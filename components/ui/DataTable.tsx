import { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors, radius, space, fontSize, fontWeight, shadow, touchTarget } from '@/lib/design/tokens';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type SortDir = 'asc' | 'desc';

export interface DataTableColumn<T> {
  /** Unique identifier. Passed to `onSort`. For simple cases, the object key of T. */
  key: string;
  /** Header label. */
  header: string;
  /** Optional fixed width in px. */
  width?: number;
  /** Text alignment. Default 'left'. */
  align?: 'left' | 'right' | 'center';
  /** Whether the column shows a sortable header. Default false. */
  sortable?: boolean;
  /** Custom renderer. Receives the row and returns a React node. Falls back to `row[key]` as text. */
  render?: (row: T) => React.ReactNode;
}

export interface DataTableFilter {
  label: string;
  value: string;
}

export interface DataTablePagination {
  page: number;           // zero-indexed
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Stable key extractor. */
  rowKey: (row: T) => string;

  /** Controlled sort state. */
  sortBy?: { key: string; dir: SortDir };
  onSort?: (key: string, dir: SortDir) => void;

  /** Filter chip bar. Consumers hold the active filter state externally. */
  filters?: DataTableFilter[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;

  /** Controlled pagination (omit for no pagination). */
  pagination?: DataTablePagination;

  /** Loading state — renders `skeletonRows` shimmer rows instead of data. */
  loading?: boolean;
  skeletonRows?: number;

  /** Empty-state contents when `data` is [] and not loading. */
  emptyState?: { title: string; caption?: string };

  onRowPress?: (row: T) => void;

  /** Total row count to show in the toolbar. Defaults to data.length. */
  visibleCount?: string;

  style?: ViewStyle;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

/**
 * DataTable — dense-data primitive for dashboard surfaces.
 *
 * Every axis (sort, filter, pagination) is CONTROLLED — consumers hold the
 * state and the table reports user intent via callbacks. This mirrors the
 * pattern in React Admin / Polaris IndexTable and lets you wire server-side
 * data sources trivially.
 *
 * For client-side tables, memoize the sorted/filtered/paginated slice at
 * the call site and pass the final array as `data`.
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  sortBy,
  onSort,
  filters,
  activeFilter,
  onFilterChange,
  pagination,
  loading = false,
  skeletonRows = 5,
  emptyState,
  onRowPress,
  visibleCount,
  style,
}: DataTableProps<T>) {
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;
  const startIdx = pagination ? pagination.page * pagination.pageSize + 1 : 1;
  const endIdx = pagination
    ? Math.min(pagination.page * pagination.pageSize + pagination.pageSize, pagination.total)
    : data.length;

  return (
    <View style={[styles.wrap, style]}>
      {/* Toolbar */}
      {(filters || visibleCount) && (
        <View style={styles.toolbar}>
          {filters && filters.length > 0 ? (
            <FilterBar
              filters={filters}
              active={activeFilter}
              onChange={onFilterChange}
            />
          ) : (
            <View />
          )}
          {visibleCount ? (
            <Text style={styles.count}>{visibleCount}</Text>
          ) : null}
        </View>
      )}

      {/* Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
        <View>
          {/* Header */}
          <View style={styles.headerRow}>
            {columns.map((col) => (
              <HeaderCell
                key={col.key}
                column={col}
                sortBy={sortBy}
                onSort={onSort}
              />
            ))}
          </View>

          {/* Body */}
          {loading ? (
            <SkeletonRows columns={columns} count={skeletonRows} />
          ) : data.length === 0 ? (
            <EmptyRow
              totalWidth={sumColWidth(columns)}
              state={emptyState}
            />
          ) : (
            data.map((row) => (
              <DataRow
                key={rowKey(row)}
                row={row}
                columns={columns}
                onPress={onRowPress ? () => onRowPress(row) : undefined}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Pagination */}
      {pagination && !loading && data.length > 0 ? (
        <View style={styles.pagination}>
          <Text style={styles.paginationInfo}>
            {startIdx}-{endIdx} of {pagination.total}
          </Text>
          <View style={styles.paginationControls}>
            <PaginationButton
              label="Previous page"
              icon="chevron-left"
              disabled={pagination.page === 0}
              onPress={() => pagination.onPageChange(pagination.page - 1)}
            />
            <Text style={styles.paginationPage}>
              {pagination.page + 1} / {totalPages}
            </Text>
            <PaginationButton
              label="Next page"
              icon="chevron-right"
              disabled={pagination.page >= totalPages - 1}
              onPress={() => pagination.onPageChange(pagination.page + 1)}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Pieces
// ─────────────────────────────────────────────────────────────

function FilterBar({
  filters,
  active,
  onChange,
}: {
  filters: DataTableFilter[];
  active?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <View style={styles.filterBar} accessibilityRole="tablist" accessibilityLabel="Filter">
      {filters.map((f) => {
        const isActive = f.value === (active ?? '');
        return (
          <Pressable
            key={f.value || '__all__'}
            onPress={() => onChange?.(f.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) => [
              styles.filterChip,
              isActive && styles.filterChipActive,
              pressed && !isActive && styles.filterChipPressed,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                isActive && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function HeaderCell<T>({
  column,
  sortBy,
  onSort,
}: {
  column: DataTableColumn<T>;
  sortBy?: { key: string; dir: SortDir };
  onSort?: (key: string, dir: SortDir) => void;
}) {
  const isActive = sortBy?.key === column.key;
  const cellStyle: ViewStyle = { width: column.width ?? 'auto', minWidth: column.width ?? 80 };
  const alignText: TextStyle = {
    textAlign: column.align ?? 'left',
  };

  if (!column.sortable) {
    return (
      <View style={[styles.headerCell, cellStyle]}>
        <Text style={[styles.headerText, alignText]}>{column.header}</Text>
      </View>
    );
  }

  const handlePress = () => {
    if (!onSort) return;
    const nextDir: SortDir = isActive && sortBy?.dir === 'asc' ? 'desc' : 'asc';
    onSort(column.key, nextDir);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Sort by ${column.header}`}
      accessibilityState={{ selected: isActive }}
      style={[styles.headerCell, cellStyle]}
    >
      <Text style={[styles.headerText, isActive && styles.headerTextActive, alignText]}>
        {column.header}
      </Text>
      <FontAwesome
        name={
          isActive
            ? sortBy?.dir === 'asc'
              ? 'sort-asc'
              : 'sort-desc'
            : 'sort'
        }
        size={12}
        color={isActive ? colors.brandPrimary : colors.textSubtle}
        style={styles.sortIcon}
      />
    </Pressable>
  );
}

function DataRow<T>({
  row,
  columns,
  onPress,
}: {
  row: T;
  columns: DataTableColumn<T>[];
  onPress?: () => void;
}) {
  const content = (
    <>
      {columns.map((col) => (
        <View
          key={col.key}
          style={[
            styles.cell,
            { width: col.width ?? 'auto', minWidth: col.width ?? 80 },
          ]}
        >
          {col.render ? (
            col.render(row)
          ) : (
            <Text
              style={[styles.cellText, { textAlign: col.align ?? 'left' }]}
              numberOfLines={1}
            >
              {String((row as unknown as Record<string, unknown>)[col.key] ?? '')}
            </Text>
          )}
        </View>
      ))}
    </>
  );
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }
  return <View style={styles.row}>{content}</View>;
}

function SkeletonRows<T>({
  columns,
  count,
}: {
  columns: DataTableColumn<T>[];
  count: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.row}>
          {columns.map((col, j) => (
            <View
              key={col.key}
              style={[
                styles.cell,
                { width: col.width ?? 'auto', minWidth: col.width ?? 80 },
              ]}
            >
              <View
                style={[
                  styles.skeletonBar,
                  { width: (['50%', '75%', '60%', '90%', '40%'] as const)[j % 5] },
                ]}
              />
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

function EmptyRow({
  totalWidth,
  state,
}: {
  totalWidth: number;
  state?: { title: string; caption?: string };
}) {
  return (
    <View style={[styles.emptyCell, { minWidth: totalWidth }]}>
      <View style={styles.emptyIcon}>
        <FontAwesome name="search" size={18} color={colors.textSubtle} />
      </View>
      <Text style={styles.emptyTitle}>{state?.title ?? 'No results'}</Text>
      {state?.caption ? <Text style={styles.emptyCaption}>{state.caption}</Text> : null}
    </View>
  );
}

function PaginationButton({
  label,
  icon,
  disabled,
  onPress,
}: {
  label: string;
  icon: 'chevron-left' | 'chevron-right';
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.paginationBtn,
        pressed && !disabled && styles.paginationBtnPressed,
        disabled && styles.paginationBtnDisabled,
      ]}
    >
      <FontAwesome name={icon} size={14} color={colors.textPrimary} />
    </Pressable>
  );
}

function sumColWidth<T>(columns: DataTableColumn<T>[]): number {
  return columns.reduce((sum, c) => sum + (c.width ?? 120), 0);
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.sm,
  },

  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    backgroundColor: colors.raised,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: space[3],
  },
  count: { fontSize: fontSize.sm, color: colors.textMuted },

  filterBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  filterChip: {
    paddingHorizontal: space[3],
    paddingVertical: 6,
    minHeight: 32,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  filterChipPressed: { backgroundColor: colors.raised },
  filterChipActive: {
    backgroundColor: colors.brandPrimarySoft,
    borderColor: colors.brandPrimary,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.semibold as TextStyle['fontWeight'],
  } as TextStyle,
  filterChipTextActive: { color: colors.brandPrimary },

  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.raised,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
  },
  headerText: {
    fontSize: 12,
    fontWeight: fontWeight.bold as TextStyle['fontWeight'],
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
    flex: 1,
  } as TextStyle,
  headerTextActive: { color: colors.textPrimary },
  sortIcon: { opacity: 0.8 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: touchTarget,
  },
  rowPressed: { backgroundColor: colors.raised },
  cell: {
    paddingHorizontal: space[4],
    paddingVertical: space[3] + 2,
    justifyContent: 'center',
  },
  cellText: { fontSize: fontSize.body, color: colors.textPrimary } as TextStyle,

  skeletonBar: {
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.raised,
  },

  emptyCell: {
    paddingVertical: 56,
    paddingHorizontal: space[6],
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.raised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold as TextStyle['fontWeight'],
    color: colors.textPrimary,
  } as TextStyle,
  emptyCaption: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },

  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: space[3],
  },
  paginationInfo: { fontSize: fontSize.sm, color: colors.textMuted },
  paginationControls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  paginationPage: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    paddingHorizontal: 10,
    minWidth: 60,
    textAlign: 'center',
  },
  paginationBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationBtnPressed: { backgroundColor: colors.raised },
  paginationBtnDisabled: { opacity: 0.4 },
});
