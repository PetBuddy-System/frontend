import { useTranslation } from "react-i18next";

import { MaterialIcon } from "~/shared/ui";
import { cn } from "~/shared/lib/cn";

export type ServiceHistoryStatus = "upcoming" | "completed" | "cancelled";

export interface ServiceHistoryItem {
  key: string;
  status: ServiceHistoryStatus;
  image?: string;
  petImage?: string;
  price: string;
  orderId?: string;
}

export interface ServiceHistoryCardProps {
  item: ServiceHistoryItem;
}

const STATUS_ICON: Record<ServiceHistoryStatus, string> = {
  upcoming: "event",
  completed: "check_circle",
  cancelled: "cancel",
};

function getStatusClassName(status: ServiceHistoryStatus) {
  if (status === "upcoming") {
    return "bg-primary text-primary-foreground";
  }

  if (status === "completed") {
    return "bg-success text-success-foreground";
  }

  return "bg-muted text-muted-foreground";
}

export function ServiceHistoryCard({ item }: ServiceHistoryCardProps) {
  const { t } = useTranslation("profile");

  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/40 md:p-6",
        item.status !== "upcoming" && "opacity-90 hover:opacity-100",
      )}
    >
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="relative flex-shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={t(`serviceHistory.items.${item.key}.imageAlt`)}
              className={cn(
                "h-36 w-full rounded-xl object-cover shadow-sm md:h-32 md:w-48",
                item.status === "completed" && "grayscale-[20%] transition-all hover:grayscale-0",
              )}
            />
          ) : (
            <div className="flex h-36 w-full items-center justify-center rounded-xl bg-muted md:h-32 md:w-48">
              <MaterialIcon name="block" className="text-4xl text-muted-foreground" />
            </div>
          )}
          {item.status === "upcoming" ? (
            <div className="absolute left-2 top-2 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg">
              {t("serviceHistory.badges.bestseller")}
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  className={cn(
                    "font-display text-2xl font-semibold transition-colors",
                    item.status === "cancelled"
                      ? "text-muted-foreground"
                      : "text-foreground group-hover:text-primary",
                  )}
                >
                  {t(`serviceHistory.items.${item.key}.title`)}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    {item.petImage ? (
                      <img
                        src={item.petImage}
                        alt={t(`serviceHistory.items.${item.key}.petImageAlt`)}
                        className="h-7 w-7 rounded-full object-cover ring-2 ring-accent"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                        <MaterialIcon name="pets" className="text-[16px]" />
                      </div>
                    )}
                    <span className="font-semibold text-muted-foreground">
                      {t(`serviceHistory.items.${item.key}.pet`)}
                    </span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
                      getStatusClassName(item.status),
                    )}
                  >
                    <MaterialIcon
                      name={STATUS_ICON[item.status]}
                      filled={item.status === "completed"}
                      className="text-[14px]"
                    />
                    {t(`serviceHistory.status.${item.status}`)}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={cn(
                    "font-display text-xl font-bold",
                    item.status === "upcoming" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.price}
                </p>
                {item.orderId ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("serviceHistory.orderId", { id: item.orderId })}
                  </p>
                ) : null}
              </div>
            </div>

            <div
              className={cn(
                "mt-4 grid gap-4 border-t border-border pt-4 text-muted-foreground md:grid-cols-2",
                item.status === "cancelled" && "md:grid-cols-1",
              )}
            >
              {item.status === "cancelled" ? (
                <p className="italic text-destructive">
                  {t(`serviceHistory.items.${item.key}.reason`)}
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <MaterialIcon
                      name="schedule"
                      className={cn(
                        "text-[22px]",
                        item.status === "upcoming" && "text-primary",
                      )}
                    />
                    <span>{t(`serviceHistory.items.${item.key}.time`)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MaterialIcon
                      name={item.status === "completed" ? "star" : "location_on"}
                      className={cn(
                        "text-[22px]",
                        item.status === "upcoming" && "text-primary",
                      )}
                    />
                    <span>{t(`serviceHistory.items.${item.key}.meta`)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {item.status === "upcoming" ? (
              <>
                <button className="rounded-xl border border-primary px-6 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-accent">
                  {t("serviceHistory.actions.viewDetails")}
                </button>
                <button className="rounded-xl bg-muted px-6 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                  {t("serviceHistory.actions.cancel")}
                </button>
              </>
            ) : null}

            {item.status === "completed" ? (
              <>
                <button className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:opacity-90">
                  {t("serviceHistory.actions.bookAgain")}
                </button>
                <button className="rounded-xl border border-border px-6 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted">
                  {t("serviceHistory.actions.invoice")}
                </button>
              </>
            ) : null}

            {item.status === "cancelled" ? (
              <button className="rounded-xl border border-primary px-6 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-accent">
                {t("serviceHistory.actions.bookNow")}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
