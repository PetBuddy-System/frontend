import { useTranslation } from "react-i18next";
import serviceHero from "../assets/serviceHero.png";
import { MaterialIcon } from "~/shared/ui";


export function ServicesHero() {
  const { t } = useTranslation("services");

  return (
    <section className="relative flex h-[400px] items-center overflow-hidden bg-primary md:h-[500px]">
      <div className="absolute inset-0 z-0">
        <div
          className="h-full w-full bg-cover bg-center opacity-90 mix-blend-overlay"
          style={{ backgroundImage: `url(${serviceHero})` }}
          role="img"
          aria-label={t("hero.title")}
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="w-full md:w-1/2">
          <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-4 max-w-md text-base text-primary-foreground/80 md:text-lg">
            {t("hero.subtitle")}
          </p>
          <button
            type="button"
            className="mt-8 flex w-max items-center gap-2 rounded-full bg-secondary px-8 py-4 text-sm font-semibold text-secondary-foreground shadow-lg transition-colors hover:opacity-90"
          >
            <MaterialIcon name="calendar_month" className="text-[20px]" />
            {t("hero.cta")}
          </button>
        </div>
      </div>
    </section>
  );
}
