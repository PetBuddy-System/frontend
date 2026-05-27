import { useTranslation } from "react-i18next";

import { MaterialIcon } from "~/shared/ui";
import { cn } from "~/shared/lib/cn";

const RELATED_PRODUCTS = [
  { key: "ganadorLamb", price: "215.000đ", badge: "sale" },
  { key: "zenithAdult", price: "280.000đ", badge: null },
  { key: "pedigreeBeef", price: "195.000đ", badge: null },
  { key: "smartHeartBeef", price: "205.000đ", badge: "new" },
] as const;

const BADGE_STYLES: Record<string, string> = {
  new: "bg-destructive text-destructive-foreground",
  sale: "bg-secondary text-secondary-foreground",
};

export function RelatedProducts() {
  const { t } = useTranslation("products");

  return (
    <section className="mb-16">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-2xl font-semibold text-foreground font-display">
          {t("detail.related.title")}
        </h2>
        <a
          className="flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:opacity-80"
          href="/products"
        >
          {t("detail.related.viewAll")}
          <MaterialIcon name="arrow_forward" className="text-[18px]" />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {RELATED_PRODUCTS.map((product) => (
          <article
            key={product.key}
            className="group overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-square bg-muted p-6">
              {product.badge ? (
                <span
                  className={cn(
                    "absolute left-2 top-2 z-10 rounded-full px-2 py-1 text-xs font-bold",
                    BADGE_STYLES[product.badge],
                  )}
                >
                  {t(`detail.related.items.${product.key}.badge`)}
                </span>
              ) : null}
              <span className="flex h-full w-full items-center justify-center rounded-xl bg-card text-muted-foreground transition-transform duration-300 group-hover:scale-105">
                <MaterialIcon name="inventory_2" className="text-[56px]" />
              </span>
            </div>
            <div className="flex flex-col gap-2 p-4">
              <h3 className="min-h-12 line-clamp-2 text-sm text-foreground">
                {t(`detail.related.items.${product.key}.title`)}
              </h3>
              <div className="text-lg font-bold text-primary font-display">
                {product.price}
              </div>
              <button
                type="button"
                className="mt-2 w-full rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {t("detail.related.buy")}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
