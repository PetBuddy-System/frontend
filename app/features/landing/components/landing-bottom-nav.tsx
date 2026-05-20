import { useTranslation } from "react-i18next";

import { MaterialIcon } from "./material-icon";
import { cn } from "~/shared/lib/cn";

const NAV_ITEMS = [
  { key: "store", icon: "pets", active: true, href: "/" },
  { key: "services", icon: "content_cut", active: false, href: "/services" },
  { key: "cart", icon: "shopping_cart", active: false, href: "#" },
  { key: "account", icon: "person", active: false, href: "#" },
] as const;

export function LandingBottomNav() {
  const { t } = useTranslation("landing");

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-border bg-card px-4 py-2 shadow-lg md:hidden">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.key}
          href={item.href}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl px-4 py-1 text-xs font-semibold transition-transform",
            item.active
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          <MaterialIcon name={item.icon} className="text-[22px]" />
          <span className="mt-1">{t(`mobileNav.${item.key}`)}</span>
          {item.key === "cart" ? (
            <span className="absolute -translate-y-2 translate-x-6 rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
              2
            </span>
          ) : null}
        </a>
      ))}
    </nav>
  );
}
