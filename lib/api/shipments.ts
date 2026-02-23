import { supabase } from '@/lib/supabase';
import { logAction } from './auditLog';

export interface ShipmentRecord {
  id: string;
  destination: string;
  carrier: string | null;
  tracking_number: string | null;
  quantity_shipped: number;
  created_at: string;
}

export async function createShipment(
  materialId: string,
  destination: string,
  quantityShipped: number,
  carrier?: string,
  trackingNumber?: string,
  shippedBy?: string
) {
  // Atomically deduct quantity (prevents race conditions)
  const { error: rpcError } = await supabase.rpc('deduct_material_quantity', {
    p_material_id: materialId,
    p_quantity: quantityShipped,
    p_depleted_status: 'shipped',
  });

  if (rpcError) throw new Error(rpcError.message);

  // Create shipment record
  const { error: shipError } = await supabase
    .from('shipments_out')
    .insert({
      material_id: materialId,
      destination,
      carrier: carrier || null,
      tracking_number: trackingNumber || null,
      quantity_shipped: quantityShipped,
    });

  if (shipError) throw new Error(shipError.message);

  logAction(shippedBy ?? 'unknown', 'shipment_created', 'material', materialId, {
    destination,
    quantity: quantityShipped,
    carrier,
  });
}

export async function fetchShipmentHistory(materialId: string): Promise<ShipmentRecord[]> {
  const { data, error } = await supabase
    .from('shipments_out')
    .select('*')
    .eq('material_id', materialId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ShipmentRecord[];
}
