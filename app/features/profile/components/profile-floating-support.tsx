import { useTranslation } from "react-i18next";

import { MaterialIcon } from "~/shared/ui";

export function ProfileFloatingSupport() {
  const { t } = useTranslation("profile");

  return (
    <a
      className="group fixed bottom-8 right-8 z-50 hidden h-14 w-14 items-center justify-center rounded-full bg-brand-zalo text-brand-zalo-foreground shadow-lg transition-transform hover:scale-110 md:flex"
      href="#"
      aria-label={t("support.zalo")}
    >
      <MaterialIcon name="chat" className="text-[28px]" />
      <span className="absolute right-full mr-4 whitespace-nowrap rounded-xl bg-card px-4 py-2 font-bold text-brand-zalo opacity-0 shadow-md transition-opacity group-hover:opacity-100">
        {t("support.zalo")}
      </span>
    </a>
  );
}
