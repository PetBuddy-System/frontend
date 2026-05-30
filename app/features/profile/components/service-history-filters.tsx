import { useTranslation } from "react-i18next";

import { cn } from "~/shared/lib/cn";

export const SERVICE_HISTORY_FILTERS = [
  "all",
  "upcoming",
  "completed",
  "cancelled",
] as const;

export type ServiceHistoryFilter = (typeof SERVICE_HISTORY_FILTERS)[number];

export interface ServiceHistoryFiltersProps {
  activeFilter: ServiceHistoryFilter;
  onFilterChange: (filter: ServiceHistoryFilter) => void;
}

export function ServiceHistoryFilters({
  activeFilter,
  onFilterChange,
}: ServiceHistoryFiltersProps) {
  const { t } = useTranslation("profile");

  return (
    <div className="flex flex-wrap gap-2">
      {SERVICE_HISTORY_FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors md:px-5 md:py-2 md:text-sm",
            activeFilter === filter
              ? "border border-secondary bg-secondary text-secondary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          onClick={() => onFilterChange(filter)}
        >
          {t(`serviceHistory.filters.${filter}`)}
        </button>
      ))}
    </div>
  );
}
