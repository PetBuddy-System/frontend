import { useTranslation } from "react-i18next";

import { MaterialIcon } from "./material-icon";

const STEPS = [
  { key: "check", icon: "search" },
  { key: "bath", icon: "water_drop" },
  { key: "dry", icon: "air" },
  { key: "ear", icon: "hearing" },
  { key: "nail", icon: "content_cut" },
] as const;

const BENEFITS = [
  { key: "parasite", icon: "bug_report" },
  { key: "odor", icon: "spa" },
  { key: "comfort", icon: "mood" },
] as const;

const PRICES = ["s", "m", "l", "xl"] as const;

export function ServiceDetailContent() {
  const { t } = useTranslation("services");

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
      <div className="mb-8 flex gap-8 border-b border-border">
        <button className="border-b-2 border-primary pb-4 text-lg font-semibold text-primary">
          {t("detail.tabs.description")}
        </button>
        <button className="pb-4 text-lg font-semibold text-muted-foreground transition-colors hover:text-primary">
          {t("detail.tabs.reviews")}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="flex flex-col gap-8 leading-relaxed text-muted-foreground lg:col-span-2">
          <div>
            <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
              {t("detail.process.title")}
            </h2>
            <ul className="flex flex-col gap-4">
              {STEPS.map((step) => (
                <li key={step.key} className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-muted p-2 text-primary">
                    <MaterialIcon name={step.icon} className="text-[20px]" />
                  </div>
                  <div>
                    <strong className="mb-1 block text-foreground">
                      {t(`detail.process.steps.${step.key}.title`)}
                    </strong>
                    <p>{t(`detail.process.steps.${step.key}.description`)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
              {t("detail.benefits.title")}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {BENEFITS.map((benefit) => (
                <div
                  key={benefit.key}
                  className="flex flex-col items-center rounded-2xl border border-border/60 bg-muted p-6 text-center"
                >
                  <MaterialIcon
                    name={benefit.icon}
                    className="mb-3 text-[32px] text-primary"
                  />
                  <strong className="mb-2 text-sm font-semibold text-foreground">
                    {t(`detail.benefits.items.${benefit.key}.title`)}
                  </strong>
                  <p className="text-sm">
                    {t(`detail.benefits.items.${benefit.key}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-28 rounded-2xl bg-card p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 font-display text-xl font-semibold text-foreground">
              <MaterialIcon name="payments" className="text-primary" />
              {t("detail.pricing.title")}
            </h2>
            <div className="flex flex-col gap-4">
              {PRICES.map((price) => (
                <div
                  key={price}
                  className="flex items-center justify-between border-b border-border/60 pb-4 last:border-b-0 last:pb-0"
                >
                  <div>
                    <strong className="block text-sm font-semibold text-foreground">
                      {t(`detail.pricing.items.${price}.label`)}
                    </strong>
                    <span className="text-sm text-muted-foreground">
                      {t(`detail.pricing.items.${price}.weight`)}
                    </span>
                  </div>
                  <span className="font-display text-lg font-bold text-primary">
                    {t(`detail.pricing.items.${price}.price`)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-start gap-2 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
              <MaterialIcon name="info" className="mt-0.5 text-[18px] text-primary" />
              <p>{t("detail.pricing.note")}</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
