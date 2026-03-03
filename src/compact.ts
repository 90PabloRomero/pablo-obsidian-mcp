interface CompactedResult<T> {
  compacted: true;
  total: number;
  showing: number;
  preview: T[];
  hint: string;
}

interface CompactOptions {
  entityName?: string;
  detailTool?: string;
}

const getThreshold = (): number =>
  Number(process.env.OBSIDIAN_COMPACTION_THRESHOLD) || 20;

const getPreviewCount = (): number =>
  Number(process.env.OBSIDIAN_PREVIEW_COUNT) || 5;

export function compactResults<T>(
  items: T[],
  options?: CompactOptions,
): T[] | CompactedResult<T> {
  const threshold = getThreshold();
  if (items.length <= threshold) return items;

  const previewCount = getPreviewCount();
  const entity = options?.entityName ?? "items";
  const detail = options?.detailTool;

  const hint = detail
    ? `Showing ${previewCount} of ${items.length} ${entity}. Use ${detail} for details, or narrow with path/query filters.`
    : `Showing ${previewCount} of ${items.length} ${entity}. Narrow with path/query filters for full results.`;

  return {
    compacted: true,
    total: items.length,
    showing: previewCount,
    preview: items.slice(0, previewCount),
    hint,
  };
}
