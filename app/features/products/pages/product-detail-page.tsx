import { useTranslation } from "react-i18next";

import { ProductDetailDescription } from "../components/product-detail-description";
import { ProductDetailGallery } from "../components/product-detail-gallery";
import { ProductDetailInfo } from "../components/product-detail-info";
import { ProductsBottomNav } from "../components/products-bottom-nav";
import { RelatedProducts } from "../components/related-products";
import { MaterialIcon } from "~/shared/ui";
import { LandingFooter } from "~/features/landing/components/landing-footer";
import { LandingHeader } from "~/features/landing/components/landing-header";

const BREADCRUMBS = ["home", "store", "dogFood"] as const;

export function ProductDetailPage() {
  const { t } = useTranslation("products");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6">
        <nav
          aria-label={t("detail.breadcrumb.label")}
          className="mb-8 text-sm font-semibold text-muted-foreground"
        >
          <ol className="flex flex-wrap items-center gap-1 md:gap-3">
            {BREADCRUMBS.map((breadcrumb) => (
              <li key={breadcrumb} className="flex items-center gap-1 md:gap-2">
                <a className="transition-colors hover:text-primary" href="#">
                  {t(`detail.breadcrumb.${breadcrumb}`)}
                </a>
                <MaterialIcon name="chevron_right" className="text-[18px]" />
              </li>
            ))}
            <li aria-current="page" className="text-foreground">
              {t("detail.product.shortTitle")}
            </li>
          </ol>
        </nav>

        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          <ProductDetailGallery />
          <ProductDetailInfo />
        </div>

        <ProductDetailDescription />
        <RelatedProducts />
      </main>
      <LandingFooter />
      <ProductsBottomNav />
    </div>
  );
}
