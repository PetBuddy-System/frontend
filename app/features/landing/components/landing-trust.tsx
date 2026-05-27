import { useTranslation } from "react-i18next";

import { MaterialIcon } from "~/shared/ui";

const TRUST_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida/ADBb0ug_iHJPwaugicPReZf1_ARoTGJDmQWmw9VXTsOX81GqmAIpIuPP-No6c_8xc4bizQEHZi5gvrMcm8_SHRDFtQ9VhWG3If1vfjDRVZRnpu1gVpd9wyauao6o1WzOyjlg2peNpE4aI_i0U6NLNrVe-WBRLTQ87x_bqgQlRdpHmL67URaULyynNZoA9LdN6JSx61YRcVgYBISmX14cZZYz-7guBB55H5yUdvu3fiZVueScKrsL8-BhAUhkkQ";
const TEAM_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida/ADBb0uiWccCL-qqqt_cg8TJMe3EVsimm102lkxyqupEPvmleGG-dPaKAM5b0N5FDbs0tECqulWDW6oSvQmrr7yg8z3l_JYtJSLq1LcAsSAWkLdK-BRPzAX4guqsVOJcZMlo4xkE52QPy0FxEc-M8rSzewBPCBxvpj7yxTzv45O58MMw0gW2eJrmbjugyWlsCSuEN79vVE3eu86s7hpFUB0lon_-cnR69BwrODmFueoPheXaUaPbB7BalxISOOzI";

const TRUST_ITEMS = [
  { key: "love", icon: "favorite" },
  { key: "authentic", icon: "verified" },
  { key: "support", icon: "support_agent" },
] as const;

export function LandingTrust() {
  const { t } = useTranslation("landing");

  return (
    <section id="trust" className="py-16 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-primary md:text-3xl font-display">
              {t("trust.title")}
            </h2>
            <div className="mt-8 space-y-6">
              {TRUST_ITEMS.map((item) => (
                <div key={item.key} className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <MaterialIcon name={item.icon} className="text-[22px]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {t(`trust.items.${item.key}.title`)}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t(`trust.items.${item.key}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border/60 shadow-sm">
            <img
              src={TRUST_IMAGE_URL}
              alt={t("images.trustAlt")}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="mt-16 grid items-center gap-12 md:grid-cols-2">
          <div className="order-2 overflow-hidden rounded-2xl border border-border/60 shadow-sm md:order-1">
            <img
              src={TEAM_IMAGE_URL}
              alt={t("images.teamAlt")}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-2xl font-bold text-primary md:text-3xl font-display">
              {t("team.title")}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground md:text-base">
              {t("team.description")}
            </p>
            <button
              type="button"
              className="mt-6 rounded-full border-2 border-primary px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {t("team.cta")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
