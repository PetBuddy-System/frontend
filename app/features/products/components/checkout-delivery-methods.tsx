import { useTranslation } from "react-i18next";

import { MaterialIcon } from "./material-icon";

const SHIPPING_METHODS = ["standard", "express"] as const;

export interface CheckoutDeliveryMethodsProps {
  formatPrice: (value: number) => string;
}

export function CheckoutDeliveryMethods({
  formatPrice,
}: CheckoutDeliveryMethodsProps) {
  const { t } = useTranslation("products");

  return (
    <section className="rounded-xl border border-border/60 bg-card p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <MaterialIcon name="package_2" className="text-[24px] text-primary" />
        <h2 className="font-display text-2xl font-semibold text-primary">
          {t("checkout.delivery.title")}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {SHIPPING_METHODS.map((method, index) => {
          const fee = method === "express" ? 30000 : 0;

          return (
            <label
              key={method}
              className="flex cursor-pointer items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted"
            >
              <input
                className="h-5 w-5 border-border bg-background text-primary focus:ring-ring"
                name="shipping"
                type="radio"
                defaultChecked={index === 0}
              />
              <span className="flex flex-1 flex-col">
                <span className="font-semibold text-foreground">
                  {t(`checkout.delivery.methods.${method}.title`)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t(`checkout.delivery.methods.${method}.description`)}
                </span>
              </span>
              <span className="font-display font-bold text-primary">
                {fee === 0 ? t("checkout.summary.freeShipping") : formatPrice(fee)}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
