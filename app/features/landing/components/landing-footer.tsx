import { useTranslation } from "react-i18next";
import logo from "../assets/logoPetBuddy2.png";
import { MaterialIcon } from "./material-icon";

export function LandingFooter() {
  const { t } = useTranslation("landing");

  return (
    <footer id="contact" className="bg-card text-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 md:grid-cols-4 md:px-6">
        <div className="flex flex-col gap-4">
          <img
            src={logo}
            alt={t("brand.logoAlt")}
            className="h-auto w-36 rounded-lg bg-background p-2 object-contain md:w-44"
          />
          <p className="text-sm text-muted-foreground">
            {t("brand.tagline")}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-primary">
            {t("footer.aboutTitle")}
          </h3>
          <a className="text-sm text-muted-foreground hover:text-primary" href="#">
            {t("footer.aboutLinks.intro")}
          </a>
          <a className="text-sm text-muted-foreground hover:text-primary" href="#">
            {t("footer.aboutLinks.stores")}
          </a>
          <a className="text-sm text-muted-foreground hover:text-primary" href="#">
            {t("footer.aboutLinks.careers")}
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-primary">
            {t("footer.policyTitle")}
          </h3>
          <a className="text-sm text-muted-foreground hover:text-primary" href="#">
            {t("footer.policyLinks.shipping")}
          </a>
          <a className="text-sm text-muted-foreground hover:text-primary" href="#">
            {t("footer.policyLinks.returns")}
          </a>
          <a className="text-sm text-muted-foreground hover:text-primary" href="#">
            {t("footer.policyLinks.privacy")}
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-primary">
            {t("footer.contactTitle")}
          </h3>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MaterialIcon name="location_on" className="text-[18px]" />
            {t("footer.address")}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MaterialIcon name="call" className="text-[18px]" />
            {t("footer.phone")}
          </p>
          <a
            className="flex items-center gap-2 text-sm font-semibold text-brand-zalo hover:underline"
            href="#"
          >
            <MaterialIcon name="chat" className="text-[18px]" />
            {t("footer.zaloSupport")}
          </a>
        </div>
      </div>

      <div className="border-t border-border/60 px-4 py-4 text-center text-sm text-muted-foreground md:px-6">
        {t("footer.copyright")}
      </div>
    </footer>
  );
}
