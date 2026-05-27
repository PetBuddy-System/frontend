import { useTranslation } from "react-i18next";

import { MaterialIcon } from "~/shared/ui";

const GALLERY_ITEMS = [
  {
    key: "walk",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uhL-ZfgOs7CcCLYAL-5AxOKWdpLdz5eHLGnrr-dCnEPxLAXCILHRgZqwJa48aciiNsAKo63ZEEAJyl0zBworFGiSfUnBtYWeT2mMHyzVfUw_4ZIiXnclzOj06Z0hUq5E9kgiPgV_W4lKncvz3uncJ7BXjH_PgEGPkRftRobUIfZh7BtUSO5-66Fa42_J4S5yUPuTjlqHfounuDyi2lwxXqQn6V8uCWhSqXStIKjc183U4P1nWn_STGYsw",
    className: "col-span-1 row-span-2",
  },
  {
    key: "trust",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ug_iHJPwaugicPReZf1_ARoTGJDmQWmw9VXTsOX81GqmAIpIuPP-No6c_8xc4bizQEHZi5gvrMcm8_SHRDFtQ9VhWG3If1vfjDRVZRnpu1gVpd9wyauao6o1WzOyjlg2peNpE4aI_i0U6NLNrVe-WBRLTQ87x_bqgQlRdpHmL67URaULyynNZoA9LdN6JSx61YRcVgYBISmX14cZZYz-7guBB55H5yUdvu3fiZVueScKrsL8-BhAUhkkQ",
    className: "col-span-1 row-span-1",
  },
  {
    key: "promo",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ujPhLVnLQTA6EvmpAAFwUJz2EyTJkkG4JhutCZDYbfqJhIW2EE_0Z9HLBTDHRjZwswsF2W61POXxSYGVsYXow8pqTq0yoCErYIu24GkO2-TjXCgDsTSbvYLybUQkBReICauQIXBz6m5boKvXc8MP7O92gBE4VfZB4ev1OI-GRZFTGM2mosfM0bVz9fE56GiEZLuqwJsxeJY0hSmMsLr95wcPRYvPovGKMjKAM_prd0Y5gVY6atSuMBU6A",
    className: "col-span-2 row-span-1",
  },
  {
    key: "couple",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ujWQU1rNVnNdsyZ6z2gDcJu9jCkpScYcOKAHRzcgH1uRPamFn9YYVtzeUos16J23fO9tK1s3QQvyegb2BC8VX44RSRyg7adP5tz4nSLVAZb6HiKIgxdb03w6CBdd54UjGUYffn5LSEd4HCcpRYIQZ_uZAGLsdMzYvMJVPQqb8EZ_552En7Qa-tyNFFS0GXcbXMuyrY8my1RMn7YnEX3xt2bnjSJjA_liRd-pxtLQMkYy-XoRsmleuS9T8E",
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
              src={item.imageUrl}
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
