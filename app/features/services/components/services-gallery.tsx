import { useTranslation } from "react-i18next";
import serviceGallery from "../assets/servicegallery.png";
import serviceGallery2 from "../assets/servicegallery2.png";
import serviceGallery3 from "../assets/serviceGallery3.png";
const GALLERY_IMAGES = {
  main: serviceGallery,
  second:
    serviceGallery2,
  third:
    serviceGallery3,
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
