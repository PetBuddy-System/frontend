import { useTranslation } from "react-i18next";

import { MaterialIcon } from "./material-icon";

const LOGO_URL =
  "https://lh3.googleusercontent.com/aida/ADBb0uiXpm-7DHl6cWDuhBjICMrAhUrzY_6nlwbTJl29i6PxqPts3zVWhFJ2z84YTLlQyNSSwRxHsx85KN-GRvyixKMotaH4Uy6tiWxiNjKlcTmge-IUM76-1VQHwWqpnAPNxOB83wC6RULBmuHEX3H3JZlrd6KtzFn-e8UMAdgExahKW-9UtFj_MyMsrdMXHJUi-eIDQMC4G4wKiqg8S03HSG6-RjEu5_7X-MkkNrqqxq-2pyIWTY21BCH-FbM";

export function LandingFooter() {
  const { t } = useTranslation("landing");

  return (
    <footer id="contact" className="bg-card text-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 md:grid-cols-4 md:px-6">
        <div className="flex flex-col gap-4">
          <img
            src={LOGO_URL}
            alt={t("brand.logoAlt")}
            className="h-10 w-fit rounded-lg bg-background p-2"
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
