import { useTranslation } from "react-i18next";

import { MaterialIcon } from "./material-icon";

const PROMO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida/ADBb0uiFwC2ygqdDAmb9zP-r0p20uViqelQfZM0AyzOY0wd4Le7--GuJJbH5dWKQ90UfZuE_-KsVI0LlDdK6_xLhmuw6jq93C0Pcljkk4dKz-0SLKLn7Da2-eoBSUnBbHtXF14ilHzxfck53BNHG58v9QssfwaG10H4mxpX_WdlmTTGKWd1Ft4fBLOimPMK8_8Fcg3nsXnMpPgFU6RDuvLjeDzVATvWcqk2sdSjG67310wg5_MclAR7_2ARxfQI";

const PACKAGES = [
  { key: "five", icon: "pets", featured: false },
  { key: "ten", icon: "verified", featured: true },
  { key: "twenty", icon: "star", featured: false },
] as const;

export function ServicesCombo() {
  const { t } = useTranslation("services");

  return (
    <section className="w-full bg-muted py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
            {t("combo.title")}
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            {t("combo.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Promo image — desktop only */}
          <div className="hidden overflow-hidden rounded-2xl shadow-sm lg:block">
            <img
              src={PROMO_IMAGE_URL}
              alt={t("combo.promoImageAlt")}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Packages */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:col-span-3 lg:col-span-2">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.key}
                className={
                  pkg.featured
                    ? "relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-secondary bg-secondary/10 p-6 text-center shadow-lg md:-translate-y-4"
                    : "relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
                }
              >
                {/* Badge — only for "five" */}
                {pkg.key === "five" && (
                  <div className="absolute right-0 top-0 rounded-bl-lg bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    {t("combo.packages.five.badge")}
                  </div>
                )}

                <MaterialIcon
                  name={pkg.icon}
                  filled
                  className="text-4xl text-primary"
                />
                <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
                  {t(`combo.packages.${pkg.key}.title`)}
                </h3>
                <div className="font-display text-3xl font-bold text-accent">
                  {t(`combo.packages.${pkg.key}.discount`)}
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  {t(`combo.packages.${pkg.key}.description`)}
                </p>
                <button
                  type="button"
                  className={
                    pkg.featured
                      ? "mt-auto w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:opacity-90"
                      : pkg.key === "twenty"
                        ? "mt-auto w-full rounded-xl border-2 border-primary py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                        : "mt-auto w-full rounded-xl bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:opacity-90"
                  }
                >
                  {t(`combo.packages.${pkg.key}.cta`)}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
