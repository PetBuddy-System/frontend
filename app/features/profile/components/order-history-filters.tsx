import { useTranslation } from "react-i18next";

import { cn } from "~/shared/lib/cn";

export const ORDER_HISTORY_FILTERS = [
  "all",
  "pending",
  "shipping",
  "delivered",
  "cancelled",
] as const;

export type OrderHistoryFilter = (typeof ORDER_HISTORY_FILTERS)[number];

export interface OrderHistoryFiltersProps {
  activeFilter: OrderHistoryFilter;
  onFilterChange: (filter: OrderHistoryFilter) => void;
}

export function OrderHistoryFilters({
  activeFilter,
  onFilterChange,
}: OrderHistoryFiltersProps) {
  const { t } = useTranslation("profile");

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
      {ORDER_HISTORY_FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          className={cn(
            "whitespace-nowrap px-4 py-2.5 text-sm font-semibold transition-colors",
            activeFilter === filter
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-primary",
          )}
          onClick={() => onFilterChange(filter)}
        >
          {t(`orderHistory.filters.${filter}`)}
        </button>
      ))}
    </div>
  );
}
