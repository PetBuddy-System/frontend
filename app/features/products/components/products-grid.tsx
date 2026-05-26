import { useTranslation } from "react-i18next";

import { MaterialIcon } from "./material-icon";
import { cn } from "~/shared/lib/cn";

const PRODUCTS = [
  {
    key: "royalCaninPoodle",
    brand: "royalCanin",
    badge: "hot",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ug0rzsbax3l4zqUwzxg0S5KzPjYFX1M9uMpW6xJ8U6jiq2HieXliToLYotJQfl34SSQgU0SGfhMEd-Kpk_mAq_kCcmltsJz3Y_-tdYEejrZC9oT1QxDXlU_80Zt1djFr07gFPsoBNsBS7cX9U3WpwRNThDTGHSlrxKCCPsV5ySr8AmpdNCEo2D-_47iOt1Hc0i1MSL5GDgHlVd0VZFxrZ9_p4C80VpUADB9JSoigkyubP8XdoNBN8ESD8g",
    action: "add",
    comparePrice: null,
    price: "429.000đ",
  },
  {
    key: "ganadorLamb",
    brand: "ganador",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uhF7Y-7akW4gz95TCBRgSmLmfP-wktiRYh1p5Smd4qSiUF4SmyyzcqQ24iFMFgctk5vnf8mGsBnmV4fTs8jrdzQkVu8W7ZlqD74wGw_mEI9zsV_CpRfLP_D-q_qtY_wc7v9f5T-Jq1d3U2yqjmNShpwjn4AYb8HvWnVAzw4dpXUwBHJ2zGaknHDUg9mEYaGxrsOLhH3fRU6e7seZobs3FLUVcB6B20PHkm5fdRz6ML5PO4O1ZoPBKddYQ",
    badge: null,
    action: "add",
    comparePrice: null,
    price: "195.000đ",
  },
  {
    key: "zenithPuppy",
    brand: "zenith",
    badge: "new",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uhCMKbWXtBWVL6TT1exF_BG7qklp_9KuurSSUX_fkuhKl3fblSeiaxr_O1iwssj73cJTb21B4JhPlVuBUZZU3p9k_hBxPUf5DS8e4_i04T5cauS2W_5IRKQMEyYSgDlQAxN41NzhxSWW2VkD-INsdFDRYlEskHOfkTh5M9vdR5ybS-NxohQMPop_cpsTNIIy1Odu3FmsV0NMSzTXJpGj9-jzsv5NUomq9w1fjFBZ1MzYyuqZGUHnXWkXP0",
    action: "add",
    comparePrice: null,
    price: "285.000đ",
  },
  {
    key: "jerhighTreat",
    brand: "jerhigh",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uhDuqYTZR4QvNjL8139anRQtWxBbeRFfbp0k2iV75VC3QTAmQNRioCCF9TkxIo0x2XTwIMSP3N7XkjOe9ulHy0kXzLBGzc-PMq-_I2jprrooN5euuyBvamlkj52zpS3h0TJqBMyEn11Q1tcFFFecHaG6Nsmf4spj8IUczEiyqIUJwchLP7Yd9u-4QkAeEY_cPH0-MzPSctbU_QCN7Q1QNhHXRoedt04OLaG7bKSMHL6EAf2J38MsUz0qqw",
    badge: null,
    action: "options",
    comparePrice: null,
    price: "45.000đ",
  },
  {
    key: "cowhideBone",
    brand: "accessories",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ugu8LMm54_08l94BpHkOMCzfBgEUy04LIHZUMkiNlEya81zYQWCXqblgvm-q4AnpTKPwXGPlbaVcTmmCAui374ugyM52qoBu1LXxxTLLnn-jQHs8y7CqhS6q3uaWZDJbyMeXxkNDqjyc1JKafFJv2VhWBou13WCuN4AbpuQepRzkRP8vt-j_k93WOYGByvbDBeQ4mic-XQBv6HqxLX1aKr6jgAKzzqnd6MJww6p49VJOuBhObkpXZr6KQo",
    badge: null,
    action: "add",
    comparePrice: null,
    price: "25.000đ",
  },
  {
    key: "mckellyPate",
    brand: "mckelly",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uidGSCAnaDXtmfjHCuDuECrYUbnSE7-78OxpTWhAIE_RmYLdTTk4PRmclasDWQHMP_V4qTp0wDqxGmtJDLvqY_a82NK5vvrtWV-Gji73yPAvTx5OryVmNvlk2KqzxejgcfY2a1giO-fIhoVKZjM_tERs5E99HYM7ZkNKya5HInA_Zge7HhhWBbG-TS1EmVdcC5AgBcL0mdqVur6Ujew_5oWq1IYxtqUxmP6zVt4hyQdYN83E1B07tX-iQ",
    badge: null,
    action: "add",
    comparePrice: null,
    price: "55.000đ",
  },
  {
    key: "snappyTom",
    brand: "snappyTom",
    badge: "sale",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uhxTnKr24ZKRoBstpIY14Ll7TICQMC7niW2Z1ePrCGQrJl0XRUVfwbzpZFD0gJm3ePXjiu7C9UM2aDA9uentA5WWB2sn7R-DAnSTozfxxtCimEy22rnQcCHlIJQ_Q2mVitrJbACcRuwYgcY3lr32gDekYR0smgu1fBLzZ9oKqTpBp8cFUAICglUSuYuZTYtLzFQSTGcH5WyETBVNM4QqrSlyDWOiAztM74wjmDh469wU-GMNqeqjDCAcmA",
    action: "add",
    price: "45.000đ",
    comparePrice: "50.000đ",
  },
  {
    key: "pedigreeDentastix",
    brand: "pedigree",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ugd7WLC_qckP80mJxDRQEhb1B6Gy5NG2GkhrYiumT4_TEVBFTUiRVEUWUzLU547HiWJx1cMLfCpOshqSrBF-svSSPMXhO16VGMulnvo8cg1MXTEZga6_UPiQ_5QIpB8ZgBkxJa2Zdvsq-0q7nB0zOi8jyTtl2bh9iQmnl2KTGTeCOzptuz_qOaIL_apeTL86pmD1WjF-MF-ppK--83xyIJsk0R3x2yZo-HoLYxfQKjwDZE69_HWwJrGEug",
    badge: null,
    action: "add",
    comparePrice: null,
    price: "65.000đ",
  },
  {
    key: "royalRenal",
    brand: "royalCanin",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ugHETrMQc_4-Nif1lEEpK4pxufsQe-rAJQyrjvuPQoQMMHM2CrbUXJH9PoYKxL65tBhJRY_NQ-LkxTRlsqYY6dY6nesA5tYkzDIsG-fsrNZVNrMdxNI10lYYTUmgSeYvOhbeBraGZHb84VTucGzYDk8owiPRLlNg_Ji_7Pm-vQ-MmSAKsR4E1nzkWyXwa_ud5S4NitoZ3OBCcDDXbMgtP3FKMDXZ8c9acm8yxjUw8q32nDMPTnEsT8hxg",
    badge: null,
    action: "add",
    comparePrice: null,
    price: "485.000đ",
  },
  {
    key: "doggymanJerky",
    brand: "doggyman",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ujyQxXqF3Pon5eaRIuVLMrQZ-GoYj5NSIirByfHZxJVtLosh5J-W25lBlptWUcBhLbBpfO2y-Acp0_ITF5l_5rb4lWBODoNwtDsvpBmLwlJpbGiyvVYwwzzysJxKfcfB65Iz7PAKF9FD9LS4nxg_BfaNqqpQqttmusd1FgTJiZP0bbhcItO2wVibF8keI2yOUOJRKgx8kNW6kJAZOTn257ZaEGDBZva8Pek9GyP8fYFi26xAzx1R4h6sw",
    badge: null,
    action: "add",
    comparePrice: null,
    price: "35.000đ",
  },
  {
    key: "pedigreeCombo",
    brand: "pedigree",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ugd7WLC_qckP80mJxDRQEhb1B6Gy5NG2GkhrYiumT4_TEVBFTUiRVEUWUzLU547HiWJx1cMLfCpOshqSrBF-svSSPMXhO16VGMulnvo8cg1MXTEZga6_UPiQ_5QIpB8ZgBkxJa2Zdvsq-0q7nB0zOi8jyTtl2bh9iQmnl2KTGTeCOzptuz_qOaIL_apeTL86pmD1WjF-MF-ppK--83xyIJsk0R3x2yZo-HoLYxfQKjwDZE69_HWwJrGEug",
    badge: null,
    action: "add",
    comparePrice: null,
    price: "125.000đ",
  },
  {
    key: "zenithGrainFree",
    brand: "zenith",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uhCMKbWXtBWVL6TT1exF_BG7qklp_9KuurSSUX_fkuhKl3fblSeiaxr_O1iwssj73cJTb21B4JhPlVuBUZZU3p9k_hBxPUf5DS8e4_i04T5cauS2W_5IRKQMEyYSgDlQAxN41NzhxSWW2VkD-INsdFDRYlEskHOfkTh5M9vdR5ybS-NxohQMPop_cpsTNIIy1Odu3FmsV0NMSzTXJpGj9-jzsv5NUomq9w1fjFBZ1MzYyuqZGUHnXWkXP0",
    badge: null,
    action: "add",
    comparePrice: null,
    price: "310.000đ",
  },
] as const;

const BADGE_STYLES: Record<string, string> = {
  hot: "bg-destructive text-destructive-foreground",
  new: "bg-secondary text-secondary-foreground",
  sale: "bg-destructive text-destructive-foreground",
};

export function ProductsGrid() {
  const { t } = useTranslation("products");

  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {PRODUCTS.map((product) => (
        <article
          key={product.key}
          className="group flex flex-col rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-lg"
        >
          <div className="relative w-full overflow-hidden bg-muted pt-[100%]">
            <img
              src={product.imageUrl}
              alt={t(`products.items.${product.key}.imageAlt`)}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.badge ? (
              <span
                className={cn(
                  "absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide",
                  BADGE_STYLES[product.badge],
                )}
              >
                {t(`products.badges.${product.badge}`)}
              </span>
            ) : null}
          </div>
          <div className="flex flex-1 flex-col p-4">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {t(`brands.${product.brand}`)}
            </span>
            <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary md:text-base">
              {t(`products.items.${product.key}.title`)}
            </h3>
            <div className="mt-auto flex items-end justify-between pt-3">
              <span className="text-base font-bold text-primary font-display">
                {product.price}
              </span>
              {product.comparePrice ? (
                <span className="text-xs text-muted-foreground line-through">
                  {product.comparePrice}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              className={cn(
                "mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                product.action === "options"
                  ? "border border-primary text-primary hover:bg-muted"
                  : "bg-secondary text-secondary-foreground hover:opacity-90",
              )}
            >
              <MaterialIcon
                name={product.action === "options" ? "visibility" : "add_shopping_cart"}
                className="text-[18px]"
              />
              {product.action === "options"
                ? t("actions.viewOptions")
                : t("actions.addToCart")}
            </button>
            <a
              href={`/products/${product.key}`}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <MaterialIcon name="info" className="text-[18px]" />
              {t("actions.viewDetails")}
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
