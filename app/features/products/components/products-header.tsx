import { useTranslation } from "react-i18next";

import { MaterialIcon } from "./material-icon";
import { cn } from "~/shared/lib/cn";

const NAV_ITEMS = [
  { key: "services", href: "#services", active: false },
  { key: "store", href: "#", active: false },
  { key: "products", href: "#", active: true },
  { key: "blog", href: "#", active: false },
  { key: "contact", href: "#", active: false },
] as const;

export function ProductsHeader() {
  const { t } = useTranslation("products");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <a
          className="text-xl font-bold tracking-tight text-primary font-display"
          href="/"
        >
          {t("brand.name")}
        </a>

        <nav className="hidden items-center gap-4 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                item.active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {t(`nav.${item.key}`)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-primary">
          <div className="hidden items-center rounded-full border border-border bg-muted px-4 py-2 md:flex">
            <MaterialIcon
              name="search"
              className="mr-2 text-[18px] text-muted-foreground"
            />
            <input
              type="text"
              placeholder={t("header.searchPlaceholder")}
              className="w-44 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            type="button"
            aria-label={t("actions.cart")}
            className="rounded-full p-2 transition-colors hover:bg-muted"
          >
            <MaterialIcon name="shopping_cart" className="text-[22px]" />
          </button>
          <button
            type="button"
            aria-label={t("actions.account")}
            className="rounded-full p-2 transition-colors hover:bg-muted"
          >
            <MaterialIcon name="account_circle" className="text-[22px]" />
          </button>
          <button
            type="button"
            aria-label={t("actions.menu")}
            className="rounded-full p-2 transition-colors hover:bg-muted md:hidden"
          >
            <MaterialIcon name="menu" className="text-[22px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
