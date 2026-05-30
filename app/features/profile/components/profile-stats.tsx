import { useTranslation } from "react-i18next";

import { MaterialIcon } from "~/shared/ui";

const STATS = [
  { key: "orders", icon: "package_2", value: "12", tone: "primary" },
  { key: "spent", icon: "payments", value: "5.000.000đ", tone: "secondary" },
  { key: "offers", icon: "confirmation_number", value: "3", tone: "accent" },
] as const;

export function ProfileStats() {
  const { t } = useTranslation("profile");

  return (
    <section className="col-span-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
      {STATS.map((stat) => (
        <article
          key={stat.key}
          className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground md:h-12 md:w-12">
            <MaterialIcon name={stat.icon} className="text-[24px]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground md:text-sm">
              {t(`stats.${stat.key}`)}
            </p>
            <p className="font-display text-lg font-bold text-primary md:text-xl">
              {stat.value}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}
