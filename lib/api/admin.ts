import { getProjectClient } from '@/lib/supabaseProject';

const PAGE_SIZE = 20;

export async function fetchTableData(
  table: string,
  options: {
    offset?: number;
    limit?: number;
    search?: string;
    searchColumns?: string[];
    orderBy?: string;
    orderAsc?: boolean;
  } = {}
): Promise<{ data: any[]; hasMore: boolean }> {
  const limit = options.limit ?? PAGE_SIZE;
  const offset = options.offset ?? 0;

  const client = getProjectClient();
  let query = client.from(table).select('*');

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.orderAsc ?? false });
  }

  if (options.search && options.searchColumns && options.searchColumns.length > 0) {
    const orClause = options.searchColumns
      .map((col) => `${col}.ilike.%${options.search}%`)
      .join(',');
    query = query.or(orClause);
  }

  query = query.range(offset, offset + limit);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const results = data ?? [];
  const hasMore = results.length > limit;
  return { data: hasMore ? results.slice(0, limit) : results, hasMore };
}

export async function updateRecord(
  table: string,
  idField: string,
  id: string,
  changes: Record<string, any>
): Promise<void> {
  const client = getProjectClient();
  const { error } = await client.from(table).update(changes).eq(idField, id);
  if (error) throw new Error(error.message);
}

export async function insertRecord(
  table: string,
  data: Record<string, any>
): Promise<void> {
  const client = getProjectClient();
  const { error } = await client.from(table).insert(data);
  if (error) throw new Error(error.message);
}

export async function deleteRecord(
  table: string,
  idField: string,
  id: string
): Promise<void> {
  const client = getProjectClient();
  const { error } = await client.from(table).delete().eq(idField, id);
  if (error) throw new Error(error.message);
}
