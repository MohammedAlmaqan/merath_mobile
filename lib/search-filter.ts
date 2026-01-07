export interface CalculationRecord {
  id: string;
  madhab: string;
  timestamp: string | number;
  estate: any;
  heirs: any;
  result: any;
}

export interface FilterOptions {
  madhab?: string;
  startDate?: Date;
  endDate?: Date;
  searchText?: string;
}

export interface SearchResult {
  records: CalculationRecord[];
  totalCount: number;
  filteredCount: number;
}

/**
 * Search and filter calculations based on various criteria
 */
export const searchCalculations = (
  records: CalculationRecord[],
  options: FilterOptions
): SearchResult => {
  let filtered = [...records];

  // Filter by madhab
  if (options.madhab) {
    filtered = filtered.filter(record => record.madhab === options.madhab);
  }

  // Filter by date range
  if (options.startDate) {
    filtered = filtered.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= options.startDate!;
    });
  }

  if (options.endDate) {
    filtered = filtered.filter(record => {
      const recordDate = new Date(record.timestamp);
      const endOfDay = new Date(options.endDate!);
      endOfDay.setHours(23, 59, 59, 999);
      return recordDate <= endOfDay;
    });
  }

  // Search by text (searches in heirs names and madhab)
  if (options.searchText && options.searchText.trim()) {
    const searchLower = options.searchText.toLowerCase();
    filtered = filtered.filter(record => {
      const madhab = record.madhab.toLowerCase();
      const heirsText = record.heirs
        .map((h: any) => h.name)
        .join(' ')
        .toLowerCase();
      
      return madhab.includes(searchLower) || heirsText.includes(searchLower);
    });
  }

  // Sort by date (newest first)
  filtered.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return {
    records: filtered,
    totalCount: records.length,
    filteredCount: filtered.length,
  };
};

/**
 * Get unique madhabs from records for filter options
 */
export const getUniqueMadhabs = (records: CalculationRecord[]): string[] => {
  const madhabs = new Set(records.map(r => r.madhab));
  return Array.from(madhabs).sort();
};

/**
 * Get date range from records
 */
export const getDateRange = (records: CalculationRecord[]): { min: Date; max: Date } | null => {
  if (records.length === 0) return null;

  const dates = records.map(r => new Date(r.timestamp));
  const min = new Date(Math.min(...dates.map(d => d.getTime())));
  const max = new Date(Math.max(...dates.map(d => d.getTime())));

  return { min, max };
};

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date and time for display
 */
export const formatDateTime = (date: Date): string => {
  const dateStr = formatDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
};

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
  if (diffHours < 24) return `قبل ${diffHours} ساعة`;
  if (diffDays < 7) return `قبل ${diffDays} يوم`;
  
  return formatDate(date);
};
