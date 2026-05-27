import { useTranslation } from "react-i18next";

import { MaterialIcon } from "~/shared/ui";

export interface OrderSuccessBannerProps {
  orderCode: string;
  email: string;
}

export function OrderSuccessBanner({
  orderCode,
  email,
}: OrderSuccessBannerProps) {
  const { t } = useTranslation("products");

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-8 text-center shadow-sm md:p-12">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-secondary/20" />
      <div className="relative">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success">
          <MaterialIcon name="check_circle" filled className="text-5xl" />
        </div>
        <h1 className="mb-3 font-display text-3xl font-bold text-primary md:text-5xl">
          {t("orderSuccess.banner.title")}
        </h1>
        <p className="mb-4 text-lg text-muted-foreground">
          {t("orderSuccess.banner.orderCodePrefix")}{" "}
          <span className="font-bold text-foreground">{orderCode}</span>
        </p>
        <div className="inline-block rounded-xl bg-muted px-6 py-3 text-sm font-semibold text-muted-foreground">
          {t("orderSuccess.banner.emailPrefix")}{" "}
          <span className="font-bold text-primary">{email}</span>
        </div>
      </div>
    </section>
  );
}
