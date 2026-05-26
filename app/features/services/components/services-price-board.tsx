import { useTranslation } from "react-i18next";
import { MaterialIcon } from "./material-icon";
import BangGia from "../assets/BangGia.png";

export function ServicesPriceBoard() {
  const { t } = useTranslation("services");

  return (
    <section className="w-full bg-background py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
            {t("priceBoard.title")}
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card p-3 shadow-lg md:p-5">
          <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted md:min-h-[620px]">
            {BangGia ? (
              <img
                src={BangGia}
                alt={t("priceBoard.imageAlt")}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex max-w-md flex-col items-center px-6 text-center">
                <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-card text-primary shadow-sm">
                  <MaterialIcon name="image" className="text-[34px]" />
                </span>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  {t("priceBoard.placeholderTitle")}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
                  {t("priceBoard.placeholderDescription")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
