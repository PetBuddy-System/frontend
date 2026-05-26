import { useTranslation } from "react-i18next";

const HIGHLIGHTS = ["kibble", "coat", "dental"] as const;
const SPECS = ["brand", "type", "weight", "age"] as const;

export function ProductDetailDescription() {
  const { t } = useTranslation("products");

  return (
    <section className="mb-16">
      <div className="mb-8 border-b border-border">
        <div className="-mb-px flex">
          <span className="inline-block border-b-2 border-primary px-6 py-4 text-sm font-bold text-primary">
            {t("detail.tabs.description")}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-6 text-base leading-7 text-muted-foreground shadow-sm md:p-10 md:text-lg">
        <h2 className="mb-4 text-2xl font-semibold text-foreground font-display">
          {t("detail.description.highlightsTitle")}
        </h2>
        <ul className="mb-8 list-disc space-y-2 pl-6">
          {HIGHLIGHTS.map((highlight) => (
            <li key={highlight}>{t(`detail.description.highlights.${highlight}`)}</li>
          ))}
        </ul>

        <h2 className="mb-4 text-2xl font-semibold text-foreground font-display">
          {t("detail.description.benefitsTitle")}
        </h2>
        <p className="mb-8">{t("detail.description.benefits")}</p>

        <h2 className="mb-4 text-2xl font-semibold text-foreground font-display">
          {t("detail.description.specsTitle")}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full border-collapse text-left">
            <tbody>
              {SPECS.map((spec) => (
                <tr key={spec} className="border-b border-border/60 last:border-b-0">
                  <th className="w-1/3 bg-muted px-6 py-4 font-semibold text-foreground">
                    {t(`detail.specs.${spec}.label`)}
                  </th>
                  <td className="px-6 py-4 text-muted-foreground">
                    {t(`detail.specs.${spec}.value`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
