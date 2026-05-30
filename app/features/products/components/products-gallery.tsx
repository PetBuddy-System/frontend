import { useTranslation } from "react-i18next";
import { MaterialIcon } from "~/shared/ui";
import dogCute8 from "../assets/dogCute8.png";
import dogCute3 from "../assets/dogCute3.png";
import dogCute7 from "../assets/dogCute7.png";
import dogCute5 from "../assets/dogCute5.png";
const GALLERY_ITEMS = [
  {
    key: "walk",
    imageSrc: dogCute8,
    className: "col-span-1 row-span-2",
  },
  {
    key: "trust",
    imageSrc: dogCute3,
    className: "col-span-1 row-span-1",
  },
  {
    key: "promo",
    imageSrc: dogCute5,
    className: "col-span-2 row-span-1",
  },
  {
    key: "couple",
    imageSrc: dogCute7,
    className: "col-span-1 row-span-1",
  },
] as const;

export function ProductsGallery() {
  const { t } = useTranslation("products");

  return (
    <section className="mt-16 border-t border-border/60 pt-12">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-display">
            {t("gallery.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("gallery.subtitle")}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          {t("gallery.viewAll")}
          <MaterialIcon name="arrow_forward" className="text-[18px]" />
        </button>
      </div>

      <div className="mt-8 grid h-[400px] grid-cols-2 gap-4 md:grid-cols-4">
        {GALLERY_ITEMS.map((item) => (
          <div key={item.key} className={item.className}>
            <img
              src={item.imageSrc}
              alt={t(`gallery.items.${item.key}`)}
              className="h-full w-full rounded-xl object-cover shadow-sm transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
        ))}
        <button
          type="button"
          className="col-span-1 row-span-1 flex flex-col items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors hover:opacity-90"
        >
          <MaterialIcon name="add_a_photo" className="text-[28px]" />
          <span className="mt-2 text-sm font-semibold">
            {t("gallery.share")}
          </span>
        </button>
      </div>
    </section>
  );
}
