import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { logAction } from './auditLog';

export interface MaterialWithLocation {
  id: string;
  material_type: string;
  size: string | null;
  grade: string | null;
  qty: number;
  current_quantity: number;
  weight: number | null;
  spec: string | null;
  status: string;
  qr_code_id: string;
  location_id: string | null;
  created_at: string;
  qr_code_value: string | null;
  location_zone: string | null;
  location_row: string | null;
  location_rack: string | null;
}

const PAGE_SIZE = 20;

export async function fetchMaterials(filters?: {
  status?: string;
  material_type?: string;
  search?: string;
  offset?: number;
  limit?: number;
}): Promise<{ data: MaterialWithLocation[]; hasMore: boolean }> {
  const limit = filters?.limit ?? PAGE_SIZE;
  const offset = filters?.offset ?? 0;

  const projectId = useAuthStore.getState().activeProject?.id;
  if (!projectId) return { data: [], hasMore: false };

  let query = supabase
    .from('materials')
    .select(`
      *,
      qr_codes ( code_value ),
      locations ( zone, row, rack )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit); // inclusive, fetches limit+1 rows to detect hasMore

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.material_type) {
    query = query.eq('material_type', filters.material_type);
  }
  if (filters?.search) {
    query = query.or(`material_type.ilike.%${filters.search}%,grade.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const results = (data ?? []).map((m: any) => ({
    id: m.id,
    material_type: m.material_type,
    size: m.size,
    grade: m.grade,
    qty: m.qty,
    current_quantity: m.current_quantity,
    weight: m.weight,
    spec: m.spec,
    status: m.status,
    qr_code_id: m.qr_code_id,
    location_id: m.location_id,
    created_at: m.created_at,
    qr_code_value: m.qr_codes?.code_value ?? null,
    location_zone: m.locations?.zone ?? null,
    location_row: m.locations?.row ?? null,
    location_rack: m.locations?.rack ?? null,
  })) as MaterialWithLocation[];

  const hasMore = results.length > limit;
  return { data: hasMore ? results.slice(0, limit) : results, hasMore };
}

export async function fetchMaterialById(id: string) {
  const projectId = useAuthStore.getState().activeProject?.id;
  if (!projectId) throw new Error('No active project');

  const { data, error } = await supabase
    .from('materials')
    .select(`
      *,
      qr_codes ( code_value ),
      locations ( zone, row, rack )
    `)
    .eq('project_id', projectId)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  const m = data as any;
  return {
    id: m.id,
    material_type: m.material_type,
    size: m.size,
    grade: m.grade,
    qty: m.qty,
    current_quantity: m.current_quantity,
    weight: m.weight,
    spec: m.spec,
    status: m.status,
    qr_code_id: m.qr_code_id,
    location_id: m.location_id,
    created_at: m.created_at,
    qr_code_value: m.qr_codes?.code_value ?? null,
    location_zone: m.locations?.zone ?? null,
    location_row: m.locations?.row ?? null,
    location_rack: m.locations?.rack ?? null,
  } as MaterialWithLocation;
}

export async function transferMaterial(
  materialId: string,
  fromLocationId: string | null,
  toLocationId: string,
  movedBy: string,
  reason?: string
) {
  const projectId = useAuthStore.getState().activeProject?.id;
  if (!projectId) throw new Error('No active project');

  // Update material location
  const { error: updateError } = await supabase
    .from('materials')
    .update({ location_id: toLocationId })
    .eq('project_id', projectId)
    .eq('id', materialId);

  if (updateError) throw new Error(updateError.message);

  // Record the movement
  const { error: moveError } = await supabase
    .from('material_movements')
    .insert({
      project_id: projectId,
      material_id: materialId,
      from_location_id: fromLocationId,
      to_location_id: toLocationId,
      moved_by: movedBy,
      reason: reason || null,
    });

  if (moveError) throw new Error(moveError.message);

  logAction(movedBy, 'material_transferred', 'material', materialId, {
    from: fromLocationId,
    to: toLocationId,
    reason,
  });
}

export async function issueMaterial(
  materialId: string,
  jobNumber: string,
  quantityIssued: number,
  issuedBy: string,
  workOrder?: string
) {
  const projectId = useAuthStore.getState().activeProject?.id;
  if (!projectId) throw new Error('No active project');

  // Atomically deduct quantity (prevents race conditions)
  const { error: rpcError } = await supabase.rpc('deduct_material_quantity', {
    p_material_id: materialId,
    p_quantity: quantityIssued,
    p_depleted_status: 'depleted',
  });

  if (rpcError) throw new Error(rpcError.message);

  // Record the issue
  const { error: issueError } = await supabase
    .from('material_issues')
    .insert({
      project_id: projectId,
      material_id: materialId,
      job_number: jobNumber,
      work_order: workOrder || null,
      quantity_issued: quantityIssued,
      issued_by: issuedBy,
    });

  if (issueError) throw new Error(issueError.message);

  logAction(issuedBy, 'material_issued', 'material', materialId, {
    job_number: jobNumber,
    quantity: quantityIssued,
  });
}
