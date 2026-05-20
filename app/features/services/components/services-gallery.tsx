import { useTranslation } from "react-i18next";

const GALLERY_IMAGES = {
  main: "https://lh3.googleusercontent.com/aida/ADBb0uiIV8czvW6LU1CpQVNPn9YtRIeXVRQ_Qt8O3DYFFOAwWJM8RT0jNDRCiIRCrMkLW6ABdHzzR6-qP5kPDxlnbPUBGyW_zECwKyUV-If7Twm0IG4uEI8O-RAHuo138yfPk4Npt3CyDGJ0AsKTFKakzJ9ETm05-OPhhKMrgNalcySmakhLYUtXBvd1sruwDO0YgpbP3io4JjB2qE-HUhJa3c11XR1LjtZO1uDB6qhQYN24OThlJfk4PR-jG4U",
  second:
    "https://lh3.googleusercontent.com/aida/ADBb0ugRSO5ZhJ2ebq3Pu3Ug5j5LHWkQ17vXIaLNqk4BaJrPnt0v4Gy2sL4ATPXzyWe25RP2h-u7JSlypguvaIlV2umXkAFaiohpRi-UT_ogP6Dh9MpL7LQPV90n7CSMMoGpV-tMyHhZ7Cui6qFXKJC9ANCwRWvDSeeVcfshcWRMadvJsOhSoLhaHBlKASqI9pQpg8vwWJaxQwg4e7u-MyJnHN1uaWirELfpJWbBV9Yc0XeTL_i7VmKKYhs87Q",
  third:
    "https://lh3.googleusercontent.com/aida/ADBb0uguFB7PEYn5dEZkQE7Epyj20ysYR_Ngns1rrCoXjv6ltoCO93Ky7Y--BGqayja9z9u33KvhDkAcpxZ3v-y1yi2B0sT6qQjBuIPkMiWlSQmxYpmvueoflTgsK9lsMndRaqtIeMEooby6C8vNulPpfrR6tcEuQyPTuwsxfPIAWIkfoJ3M5ghm73KxXF-cOHiCGUEJbjhZIjee-E1fRt7xkmf8gOMxFR9z47XrPzYGeXgp2USBL8ZoMGnA3kk",
} as const;

export function ServicesGallery() {
  const { t } = useTranslation("services");

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
          {t("gallery.title")}
        </h2>
      </div>

      <div className="grid auto-rows-[200px] grid-cols-2 gap-4 md:grid-cols-4">
        {/* Main large image */}
        <div className="col-span-2 row-span-2 overflow-hidden rounded-2xl shadow-sm">
          <img
            src={GALLERY_IMAGES.main}
            alt={t("gallery.images.mainAlt")}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Second image */}
        <div className="overflow-hidden rounded-2xl shadow-sm">
          <img
            src={GALLERY_IMAGES.second}
            alt={t("gallery.images.secondAlt")}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Third image */}
        <div className="overflow-hidden rounded-2xl shadow-sm">
          <img
            src={GALLERY_IMAGES.third}
            alt={t("gallery.images.thirdAlt")}
            className="h-full w-full object-cover"
          />
        </div>

        {/* CTA block */}
        <div className="col-span-2 flex items-center justify-center overflow-hidden rounded-2xl bg-secondary/10 p-6 text-center shadow-sm md:col-span-2">
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">
              {t("gallery.ctaTitle")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("gallery.ctaSubtitle")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
