import { useTranslation } from "react-i18next";

import { MaterialIcon } from "~/shared/ui";

const HERO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida/ADBb0uh52RpcFbu1XGzWt7elY-_58td2OhVfTmJh7LrRteHmc7uwKetPvOEQYDoS7OwztP6YTZtCOVikIAiZ74QZc4aYbjnup-Jb7Z0ot7BHxKGOm2JLSNN73tAEWmsmSPeEOIHsM1-cGQWU2BnDqCvDSzw9BY2EvQ-A0dX0wdhSX1Pf3atW3rlDz5lNfQDa4MqtC9Qbw_FOgzvcFChIHhtQax0MnmPcHQLb0wadnEtWz1AblgvqLJo5Es2CFis";

export function ServicesHero() {
  const { t } = useTranslation("services");

  return (
    <section className="relative flex h-[400px] items-center overflow-hidden bg-primary md:h-[500px]">
      <div className="absolute inset-0 z-0">
        <div
          className="h-full w-full bg-cover bg-center opacity-90 mix-blend-overlay"
          style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
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
