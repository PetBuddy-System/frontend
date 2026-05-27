import { useTranslation } from "react-i18next";

import { MaterialIcon } from "~/shared/ui";

const PETS = [
  {
    key: "lu",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-j5FT2D6HgVnyla2cahh7TDlTfgqRGZRwj8WQhswsvYPdZd9JR5N3oZcGsp6lW4fZllMFKaOzBboy_8jx70xqyjEeSJzOZC06UvkAm4FG5U3UD9blbwEIID13qegLE3RbN1DDy7hCWQKcGrfXn4UuIWF2I49ESdwUhT_QCiPUZ4mdcyQUa2Hfcn9TDXd98VGKWYiksRZRyN_ECsaXBTmIdebpdMwmdKILmLC6OYMNrkjSOtK6N7N29Lu-zbDwIADkwAa-9F42esg",
  },
  {
    key: "mimi",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA3eN6H3C6XHawbSWcbpOYcbppYRCyzC74Gt-Isnm8tne4cxCcCrIOepHd3H_fqtqL7DSlKBCuCTMwmnJPorNkUHErH_WsDtMY06HRKGBiFH9dIOzjt_2hTW4khdLEJhD-6FwKNmy4lF92ibDj-lBIcShxr73biYt9klXHuqhVhGKcr6c-pBdvvFhMo2bk3D94NrQ4GwC4xcwiHrsA2JZ0mpcZfieqEoKQKL_QX0EVMyEWENM0f9AVDast1nsNvp_UtJUG3gfZPwhc",
  },
] as const;

export function ProfilePetsCard() {
  const { t } = useTranslation("profile");

  return (
    <section className="h-full rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-transform hover:-translate-y-0.5">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          {t("pets.title")}
        </h2>
        <button
          type="button"
          aria-label={t("pets.add")}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <MaterialIcon name="add" className="text-[22px]" />
        </button>
      </div>

      <div className="space-y-4">
        {PETS.map((pet) => (
          <article
            key={pet.key}
            className="group rounded-2xl border border-border bg-muted p-4 transition-colors hover:border-primary"
          >
            <div className="flex items-center gap-4">
              <img
                src={pet.image}
                alt={t(`pets.items.${pet.key}.imageAlt`)}
                className="h-16 w-16 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">
                  {t(`pets.items.${pet.key}.name`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`pets.items.${pet.key}.description`)}
                </p>
              </div>
              <MaterialIcon
                name="chevron_right"
                className="text-[22px] text-muted-foreground transition-colors group-hover:text-primary"
              />
            </div>
          </article>
        ))}

        <button
          type="button"
          className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-transparent py-8 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <MaterialIcon name="add_circle" className="text-[32px]" />
          <span className="text-sm font-semibold">{t("pets.add")}</span>
        </button>
      </div>
    </section>
  );
}
