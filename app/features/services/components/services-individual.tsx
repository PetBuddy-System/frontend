import { useTranslation } from "react-i18next";

const SERVICE_ITEMS = [
  {
    key: "bath",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uiIV8czvW6LU1CpQVNPn9YtRIeXVRQ_Qt8O3DYFFOAwWJM8RT0jNDRCiIRCrMkLW6ABdHzzR6-qP5kPDxlnbPUBGyW_zECwKyUV-If7Twm0IG4uEI8O-RAHuo138yfPk4Npt3CyDGJ0AsKTFKakzJ9ETm05-OPhhKMrgNalcySmakhLYUtXBvd1sruwDO0YgpbP3io4JjB2qE-HUhJa3c11XR1LjtZO1uDB6qhQYN24OThlJfk4PR-jG4U",
  },
  {
    key: "grooming",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ugRSO5ZhJ2ebq3Pu3Ug5j5LHWkQ17vXIaLNqk4BaJrPnt0v4Gy2sL4ATPXzyWe25RP2h-u7JSlypguvaIlV2umXkAFaiohpRi-UT_ogP6Dh9MpL7LQPV90n7CSMMoGpV-tMyHhZ7Cui6qFXKJC9ANCwRWvDSeeVcfshcWRMadvJsOhSoLhaHBlKASqI9pQpg8vwWJaxQwg4e7u-MyJnHN1uaWirELfpJWbBV9Yc0XeTL_i7VmKKYhs87Q",
  },
  {
    key: "hygiene",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uguFB7PEYn5dEZkQE7Epyj20ysYR_Ngns1rrCoXjv6ltoCO93Ky7Y--BGqayja9z9u33KvhDkAcpxZ3v-y1yi2B0sT6qQjBuIPkMiWlSQmxYpmvueoflTgsK9lsMndRaqtIeMEooby6C8vNulPpfrR6tcEuQyPTuwsxfPIAWIkfoJ3M5ghm73KxXF-cOHiCGUEJbjhZIjee-E1fRt7xkmf8gOMxFR9z47XrPzYGeXgp2USBL8ZoMGnA3kk",
  },
] as const;

export function ServicesIndividual() {
  const { t } = useTranslation("services");

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
          {t("individual.title")}
        </h2>
        <p className="mt-2 text-base text-muted-foreground">
          {t("individual.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {SERVICE_ITEMS.map((item) => (
          <div
            key={item.key}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="h-48 bg-muted">
              <img
                src={item.imageUrl}
                alt={t(`individual.items.${item.key}.imageAlt`)}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex h-full flex-col gap-3 p-6">
              <h3 className="font-display text-xl font-semibold text-foreground">
                {t(`individual.items.${item.key}.title`)}
              </h3>
              <p className="flex-grow text-sm text-muted-foreground">
                {t(`individual.items.${item.key}.description`)}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-display text-xl font-bold text-primary">
                  {t(`individual.items.${item.key}.price`)}
                </span>
                <button
                  type="button"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:opacity-90"
                >
                  {t("individual.cta")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
