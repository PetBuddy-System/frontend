import { useTranslation } from "react-i18next";

import { MaterialIcon } from "~/shared/ui";

export function ProductDetailInfo() {
  const { t } = useTranslation("products");

  return (
    <section className="flex flex-col justify-start">
      <h1 className="text-3xl font-bold text-foreground md:text-4xl font-display">
        {t("detail.product.title")}
      </h1>

      <div className="mt-4 flex items-center gap-3">
        <div
          className="flex text-secondary"
          aria-label={t("detail.product.ratingLabel")}
        >
          {["star", "star", "star", "star", "star_half"].map((icon, index) => (
            <MaterialIcon
              key={`${icon}-${index}`}
              name={icon}
              filled
              className="text-[22px]"
            />
          ))}
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-sm font-semibold text-muted-foreground">
          {t("detail.product.reviews")}
        </span>
      </div>

      <div className="mt-6 text-3xl font-bold text-primary font-display">
        {t("detail.product.price")}
      </div>

      <p className="mt-6 text-base leading-7 text-muted-foreground md:text-lg">
        {t("detail.product.summary")}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <label className="text-sm font-semibold text-foreground" htmlFor="quantity">
          {t("detail.quantity.label")}
        </label>
        <div className="flex w-fit items-center overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <button
            type="button"
            className="px-4 py-3 text-muted-foreground transition-colors hover:bg-muted"
            aria-label={t("detail.quantity.decrease")}
          >
            <MaterialIcon name="remove" className="text-[20px]" />
          </button>
          <input
            id="quantity"
            type="number"
            value={1}
            readOnly
            className="w-16 border-0 bg-transparent text-center text-lg font-medium text-foreground focus:ring-0"
          />
          <button
            type="button"
            className="px-4 py-3 text-muted-foreground transition-colors hover:bg-muted"
            aria-label={t("detail.quantity.increase")}
          >
            <MaterialIcon name="add" className="text-[20px]" />
          </button>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary px-8 py-4 text-base font-semibold text-secondary-foreground shadow-sm transition-colors hover:opacity-90"
        >
          <MaterialIcon name="shopping_cart" className="text-[22px]" />
          {t("detail.actions.addToCart")}
        </button>
        <button
          type="button"
          className="flex-1 rounded-xl border-2 border-primary px-8 py-4 text-base font-semibold text-primary shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {t("detail.actions.buyNow")}
        </button>
      </div>
    </section>
  );
}
