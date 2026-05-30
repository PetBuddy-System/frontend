import { useTranslation } from "react-i18next";

import { MaterialIcon } from "~/shared/ui";

export function ReturnPolicyInfo() {
  const { t } = useTranslation("profile");

  return (
    <div className="relative overflow-hidden rounded-xl bg-primary p-4 text-primary-foreground shadow-md">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2">
          <MaterialIcon name="info" className="fill text-2xl" />
          <h4 className="font-display text-lg font-bold">
            {t("returnWarranty.policy.title")}
          </h4>
        </div>
        <ul className="space-y-3 text-xs opacity-90">
          <li className="flex gap-2">
            <MaterialIcon name="check_circle" className="mt-0.5 shrink-0 text-sm" />
            <span>{t("returnWarranty.policy.item1")}</span>
          </li>
          <li className="flex gap-2">
            <MaterialIcon name="check_circle" className="mt-0.5 shrink-0 text-sm" />
            <span>{t("returnWarranty.policy.item2")}</span>
          </li>
          <li className="flex gap-2">
            <MaterialIcon name="check_circle" className="mt-0.5 shrink-0 text-sm" />
            <span>{t("returnWarranty.policy.item3")}</span>
          </li>
          <li className="flex gap-2">
            <MaterialIcon name="check_circle" className="mt-0.5 shrink-0 text-sm" />
            <span>{t("returnWarranty.policy.item4")}</span>
          </li>
        </ul>
        <a
          className="block rounded-lg bg-white/20 py-2 text-center text-sm font-semibold transition-colors hover:bg-white/30"
          href="#"
        >
          {t("returnWarranty.policy.link")}
        </a>
      </div>
    </div>
  );
}
