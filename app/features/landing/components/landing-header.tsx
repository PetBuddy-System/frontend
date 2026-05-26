import { useTranslation } from "react-i18next";

import logo from "../assets/logoPetBuddy2.svg";
import { MaterialIcon } from "./material-icon";
import { cn } from "~/shared/lib/cn";

const NAV_ITEMS = [
  { key: "store", href: "/", active: true },
  { key: "services", href: "/services", active: false },
  { key: "products", href: "/products", active: false },
  { key: "blog", href: "/", active: false },
  { key: "contact", href: "/", active: false },
] as const;

export function LandingHeader() {
  const { t } = useTranslation("landing");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <a className="flex items-center gap-3" href="/">
          <img
            src={logo}
            alt={t("brand.logoAlt")}
            className="h-auto w-30 object-contain md:w-30"
          />
          <span className="sr-only">{t("brand.name")}</span>
        </a>

        <nav className="hidden items-center gap-4 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                item.active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {t(`nav.${item.key}`)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-primary">
          <a
            href="/cart"
            aria-label={t("actions.cart")}
            className="rounded-full p-2 transition-colors hover:bg-muted"
          >
            <MaterialIcon name="shopping_cart" className="text-[22px]" />
          </a>
          <div className="hidden items-center gap-2 md:flex">
            <a
              href="/login"
              className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {t("actions.login")}
            </a>
            <a
              href="/register"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              {t("actions.register")}
            </a>
          </div>
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
