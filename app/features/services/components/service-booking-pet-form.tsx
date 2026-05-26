import { useTranslation } from "react-i18next";

import { MaterialIcon } from "./material-icon";

export function ServiceBookingPetForm() {
  const { t } = useTranslation("services");

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
      <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-semibold text-primary">
        <MaterialIcon name="pets" className="text-secondary" />
        {t("bookingPage.pet.title")}
      </h2>

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              {t("bookingPage.pet.countLabel")}
            </label>
            <select className="w-full appearance-none rounded-lg border border-border bg-card px-4 py-3 text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring">
              <option>{t("bookingPage.pet.countOptions.one")}</option>
              <option>{t("bookingPage.pet.countOptions.two")}</option>
              <option>{t("bookingPage.pet.countOptions.more")}</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              {t("bookingPage.pet.breedLabel")}
            </label>
            <input
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t("bookingPage.pet.breedPlaceholder")}
              type="text"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">
            {t("bookingPage.pet.noteLabel")}
          </label>
          <textarea
            className="w-full resize-none rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={t("bookingPage.pet.notePlaceholder")}
            rows={3}
          />
        </div>
      </div>
    </section>
  );
}
