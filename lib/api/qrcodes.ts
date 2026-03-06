import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export interface QRCodeRecord {
  id: string;
  code_value: string;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
}

function generateCode(): string {
  // Generate a short unique code: QR- + 8 random hex chars
  const hex = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `QR-${hex.toUpperCase()}`;
}

const QR_PAGE_SIZE = 20;

export async function fetchQRCodes(options?: {
  offset?: number;
  limit?: number;
}): Promise<{ data: QRCodeRecord[]; hasMore: boolean }> {
  const projectId = useAuthStore.getState().activeProject?.id;
  if (!projectId) return { data: [], hasMore: false };

  const limit = options?.limit ?? QR_PAGE_SIZE;
  const offset = options?.offset ?? 0;

  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit); // inclusive, fetches limit+1 rows to detect hasMore

  if (error) throw new Error(error.message);

  const results = (data ?? []) as QRCodeRecord[];
  const hasMore = results.length > limit;
  return { data: hasMore ? results.slice(0, limit) : results, hasMore };
}

export async function batchCreateQRCodes(count: number): Promise<QRCodeRecord[]> {
  const projectId = useAuthStore.getState().activeProject?.id;
  if (!projectId) throw new Error('No active project');

  const rows = Array.from({ length: count }, () => ({
    project_id: projectId,
    code_value: generateCode(),
    entity_type: 'item',
  }));

  const { data, error } = await supabase
    .from('qr_codes')
    .insert(rows)
    .select();

  if (error) throw new Error(error.message);
  return (data ?? []) as QRCodeRecord[];
}

// Look up a QR code by its value and return linked material ID if any
export async function lookupMaterialByQR(codeValue: string): Promise<{ materialId: string } | null> {
  const projectId = useAuthStore.getState().activeProject?.id;
  if (!projectId) return null;

  // Find the QR code record
  const { data: qr } = await supabase
    .from('qr_codes')
    .select('id')
    .eq('project_id', projectId)
    .eq('code_value', codeValue)
    .single();

  if (!qr) return null;

  // Find a material linked to this QR code
  const { data: mat } = await supabase
    .from('materials')
    .select('id')
    .eq('project_id', projectId)
    .eq('qr_code_id', qr.id)
    .single();

  if (!mat) return null;
  return { materialId: mat.id };
}

export async function fetchQRCodeDetail(id: string) {
  const projectId = useAuthStore.getState().activeProject?.id;
  if (!projectId) throw new Error('No active project');

  const { data: qr, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('project_id', projectId)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  // If linked to a material, fetch that too
  let material = null;
  if (qr.entity_id) {
    const { data: mat } = await supabase
      .from('materials')
      .select('*, locations(*)')
      .eq('project_id', projectId)
      .eq('id', qr.entity_id)
      .single();
    material = mat;
  }

  return { qr: qr as QRCodeRecord, material };
}
