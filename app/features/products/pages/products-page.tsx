import { useTranslation } from "react-i18next";
import { LandingBottomNav } from "~/features/landing/components/landing-bottom-nav";
import { LandingFab } from "~/features/landing/components/landing-fab";
import { LandingFooter } from "~/features/landing/components/landing-footer";
import { LandingHeader } from "~/features/landing/components/landing-header";
import { MaterialIcon } from "../components/material-icon";
import { ProductsGrid } from "../components/products-grid";
import { ProductsHero } from "../components/products-hero";
import { ProductsGallery } from "../components/products-gallery";

const CATEGORIES = [
  "all",
  "dryFood",
  "wetFood",
  "treats",
  "accessories",
  "dogs",
  "cats"
] as const;

const BRANDS = ["royalCanin", "ganador", "pedigree", "zenith"] as const;

const CHIPS = ["all", "dryFood", "pate", "chews", "toys"] as const;

const SORT_OPTIONS = ["popular", "priceLow", "priceHigh", "newest"] as const;

export function ProductsPage() {
  const { t } = useTranslation("products");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingHeader />
      <main className="flex-1">
        <ProductsHero />

        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="flex flex-col gap-6 md:flex-row">
            <aside className="hidden w-1/4 pr-4 md:block">
              <div className="sticky top-[100px] rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-2 border-b border-border/60 pb-4">
                  <MaterialIcon name="filter_list" className="text-[20px] text-primary" />
                  <h2 className="text-lg font-semibold text-foreground font-display">
                    {t("filters.title")}
                  </h2>
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                    {t("filters.categoriesTitle")}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {CATEGORIES.map((category, index) => (
                      <label key={category} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          defaultChecked={index === 0}
                          className="h-5 w-5 rounded border-border bg-muted text-primary focus:ring-ring"
                        />
                        <span className="text-sm text-foreground">
                          {t(`filters.categories.${category}`)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                    {t("filters.brandsTitle")}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {BRANDS.map((brand) => (
                      <label key={brand} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded border-border bg-muted text-primary focus:ring-ring"
                        />
                        <span className="text-sm text-foreground">
                          {t(`brands.${brand}`)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                    {t("filters.priceTitle")}
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min={0}
                      max={1000000}
                      defaultValue={500000}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                    />
                    <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                      <span>{t("filters.priceMin")}</span>
                      <span>{t("filters.priceMax")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <section className="w-full md:w-3/4">
              <div className="mb-6 flex items-center justify-between rounded-xl border border-border/60 bg-card p-3 shadow-sm md:hidden">
                <button className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MaterialIcon name="filter_list" className="text-[20px]" />
                  {t("mobile.filterSort")}
                </button>
                <span className="text-sm text-muted-foreground">
                  {t("mobile.count", { count: 24 })}
                </span>
              </div>

              <div className="mb-6 hidden md:flex">
                <div className="relative w-full">
                  <MaterialIcon
                    name="search"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder={t("search.categoryPlaceholder")}
                    className="w-full rounded-xl border border-border bg-card py-3 pl-12 pr-4 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="mb-6 hidden items-center justify-between border-b border-border/60 pb-4 md:flex">
                <span className="text-sm text-muted-foreground">
                  {t("sort.results", { from: 1, to: 12, total: 24 })}
                </span>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-muted-foreground">
                    {t("sort.label")}
                  </label>
                  <select className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground focus:outline-none">
                    {SORT_OPTIONS.map((option) => (
                      <option key={option}>{t(`sort.options.${option}`)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4 flex gap-3 overflow-x-auto pb-4">
                {CHIPS.map((chip, index) => (
                  <button
                    key={chip}
                    type="button"
                    className={
                      index === 0
                        ? "whitespace-nowrap rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground shadow-sm"
                        : "whitespace-nowrap rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                    }
                  >
                    {t(`chips.${chip}`)}
                  </button>
                ))}
              </div>

              <ProductsGrid />

              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                  aria-label={t("pagination.prev")}
                  disabled
                >
                  <MaterialIcon name="chevron_left" className="text-[20px]" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  1
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:border-primary hover:text-primary">
                  2
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:border-primary hover:text-primary">
                  3
                </button>
                <span className="px-2 text-sm text-muted-foreground">...</span>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:border-primary hover:text-primary"
                  aria-label={t("pagination.next")}
                >
                  <MaterialIcon name="chevron_right" className="text-[20px]" />
                </button>
              </div>

              <ProductsGallery />
            </section>
          </div>
        </div>
      </main>
      <LandingFooter />
      <LandingBottomNav />
      <LandingFab />
    </div>
  );
}
