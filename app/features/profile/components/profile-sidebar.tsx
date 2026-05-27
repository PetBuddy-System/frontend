import { useTranslation } from "react-i18next";

import { MaterialIcon } from "~/shared/ui";
import { cn } from "~/shared/lib/cn";

const AVATAR_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBYPki0QBRVMSU_gWuywGYHn2MGY0cy3c-I4AAJ1_AGgnsJhDdnUw4dxmNLwCruTAGeNIlHm_hINFhjIHPh_xLPeWBEkHAY9W3t97tqqozH0jF0ksRy6LmXQuVxlAph8P4-UpAphk1wILD996LWc4UhSdrZasTcPSzgFTGdqusfTOZY73gIJMLsF51IhPqG41XlPiHaolRIBOrT5HUwMwS6M80kSFL6PJwyJMATjUpg9fHXI58YLmNXqBV78v1g6YrkqOFUGOvXWJg";

const MAIN_NAV = [
  { key: "profile", icon: "person", href: "/profile" },
  { key: "orders", icon: "shopping_bag", href: "#" },
  { key: "services", icon: "calendar_today", href: "/profile/services" },
  { key: "addresses", icon: "location_on", href: "#" },
] as const;

const UTILITY_NAV = [
  { key: "zalo", icon: "chat", href: "#", brand: true },
  { key: "home", icon: "home", href: "/", brand: false },
] as const;

export type ProfileSidebarItem = (typeof MAIN_NAV)[number]["key"];

export interface ProfileSidebarProps {
  activeItem?: ProfileSidebarItem;
}

export function ProfileSidebar({ activeItem = "profile" }: ProfileSidebarProps) {
  const { t } = useTranslation("profile");

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col gap-2 border-r border-border bg-muted p-4 shadow-sm lg:flex">
      <div className="mb-8 px-4">
        <a href="/" className="font-display text-2xl font-bold text-primary">
          {t("brand.name")}
        </a>
      </div>

      <div className="mb-auto flex flex-col gap-2">
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-card px-4 py-4">
          <img
            src={AVATAR_URL}
            alt={t("user.avatarAlt")}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-bold text-foreground">{t("user.name")}</p>
            <p className="text-xs text-muted-foreground">{t("user.tier")}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {MAIN_NAV.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors active:scale-95",
                activeItem === item.key
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-card",
              )}
            >
              <MaterialIcon name={item.icon} className="text-[22px]" />
              {t(`sidebar.nav.${item.key}`)}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-1 border-t border-border pt-4">
        {UTILITY_NAV.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-card"
          >
            <MaterialIcon name={item.icon} className="text-[22px]" />
            <span className={item.brand ? "text-brand-zalo" : undefined}>
              {t(`sidebar.utility.${item.key}`)}
            </span>
          </a>
        ))}
        <button
          type="button"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-destructive transition-colors hover:bg-destructive/10"
        >
          <MaterialIcon name="logout" className="text-[22px]" />
          <span className="text-sm">{t("sidebar.logout")}</span>
        </button>
      </div>
    </aside>
  );
}
