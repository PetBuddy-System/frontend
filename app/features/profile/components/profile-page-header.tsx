import { useTranslation } from "react-i18next";

import { MaterialIcon } from "~/shared/ui";

export interface ProfilePageHeaderProps {
  titleKey?: string;
  subtitleKey?: string;
}

export function ProfilePageHeader({
  titleKey = "header.title",
  subtitleKey,
}: ProfilePageHeaderProps) {
  const { t } = useTranslation("profile");

  return (
    <header className="mb-6 flex items-center justify-between md:mb-8">
      <div>
        <a
          href="/"
          className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary lg:hidden"
        >
          <MaterialIcon name="arrow_back" className="text-[20px]" />
          {t("header.backHome")}
        </a>
        <h1 className="font-display text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">
          {t(titleKey)}
        </h1>
        {subtitleKey ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            {t(subtitleKey)}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={t("header.notifications")}
          className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
        >
          <MaterialIcon name="notifications" className="text-[24px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <a
          href="/cart"
          aria-label={t("header.cart")}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
        >
          <MaterialIcon name="shopping_cart" className="text-[24px]" />
        </a>
      </div>
    </header>
  );
}
