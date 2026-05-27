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
    <section className="col-span-12 grid grid-cols-1 gap-6 md:grid-cols-3">
      {STATS.map((stat) => (
        <article
          key={stat.key}
          className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <MaterialIcon name={stat.icon} className="text-[24px]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">
              {t(`stats.${stat.key}`)}
            </p>
            <p className="font-display text-xl font-bold text-primary">
              {stat.value}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}
