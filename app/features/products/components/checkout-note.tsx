import { useTranslation } from "react-i18next";

import { MaterialIcon } from "~/shared/ui";

export function CheckoutNote() {
  const { t } = useTranslation("products");

  return (
    <section className="rounded-xl border border-border/60 bg-card p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <MaterialIcon name="edit_note" className="text-[24px] text-primary" />
        <h2 className="font-display text-2xl font-semibold text-primary">
          {t("checkout.note.title")}
        </h2>
      </div>
      <textarea
        className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder={t("checkout.note.placeholder")}
        rows={3}
      />
    </section>
  );
}
