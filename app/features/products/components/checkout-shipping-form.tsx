import { useTranslation } from "react-i18next";

import { MaterialIcon } from "./material-icon";

const CITIES = ["hoChiMinh", "haNoi", "daNang"] as const;

export function CheckoutShippingForm() {
  const { t } = useTranslation("products");

  return (
    <section className="rounded-xl border border-border/60 bg-card p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <MaterialIcon name="local_shipping" className="text-[24px] text-primary" />
        <h2 className="font-display text-2xl font-semibold text-primary">
          {t("checkout.shipping.title")}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="fullName">
            {t("checkout.shipping.fullName")}
          </label>
          <input
            id="fullName"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={t("checkout.shipping.fullNamePlaceholder")}
            type="text"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="phone">
            {t("checkout.shipping.phone")}
          </label>
          <input
            id="phone"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={t("checkout.shipping.phonePlaceholder")}
            type="tel"
          />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="address">
            {t("checkout.shipping.address")}
          </label>
          <input
            id="address"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={t("checkout.shipping.addressPlaceholder")}
            type="text"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="city">
            {t("checkout.shipping.city")}
          </label>
          <select
            id="city"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            defaultValue=""
          >
            <option value="">{t("checkout.shipping.cityPlaceholder")}</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {t(`checkout.shipping.cities.${city}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="district">
            {t("checkout.shipping.district")}
          </label>
          <select
            id="district"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            defaultValue=""
          >
            <option value="">{t("checkout.shipping.districtPlaceholder")}</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="ward">
            {t("checkout.shipping.ward")}
          </label>
          <select
            id="ward"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            defaultValue=""
          >
            <option value="">{t("checkout.shipping.wardPlaceholder")}</option>
          </select>
        </div>
      </div>
    </section>
  );
}
