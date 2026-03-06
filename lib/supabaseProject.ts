import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

/**
 * A centralized wrapper around Supabase that automatically injects
 * the active project's ID into database insert/select operations.
 * 
 * This helps DRY up the codebase and prevents cross-tenant data leaks
 * if developers forget to manually append `.eq('project_id', id)`.
 */

export function getProjectClient() {
    const projectId = useAuthStore.getState().activeProject?.id;

    if (!projectId) {
        throw new Error('No active project found');
    }

    return {
        projectId,
        /**
         * Start a Supabase query builder for the given table
         * with an enforced `.eq('project_id', projectId)` filter.
         */
        from: (table: string): any => {
            const baseBuilder = supabase.from(table);

            return {
                select: (query?: string, options?: { head?: boolean; count?: 'exact' | 'planned' | 'estimated' }) => {
                    return (baseBuilder.select(query, options) as any).eq('project_id', projectId);
                },
                update: (values: any, options?: { count?: 'exact' | 'planned' | 'estimated' }) => {
                    return (baseBuilder.update(values, options) as any).eq('project_id', projectId);
                },
                delete: (options?: { count?: 'exact' | 'planned' | 'estimated' }) => {
                    return (baseBuilder.delete(options) as any).eq('project_id', projectId);
                },
                insert: (values: any | any[], options?: { count?: 'exact' | 'planned' | 'estimated' }) => {
                    // Automatically inject project_id into inserted records
                    if (Array.isArray(values)) {
                        values = values.map(v => ({ ...v, project_id: projectId }));
                    } else {
                        values = { ...values, project_id: projectId };
                    }
                    return baseBuilder.insert(values, options);
                }
            };
        }
    };
}
