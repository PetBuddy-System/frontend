import { useTranslation } from "react-i18next";
import logo from "../assets/cho-signup.jpg";
import { MaterialIcon } from "~/shared/ui";


export function RegisterPage() {
  const { t } = useTranslation("auth");

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 md:px-6">
      <a
        href="/"
        className="absolute left-6 top-6 flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
      >
        <MaterialIcon name="arrow_back" className="text-[20px]" />
        {t("backHome")}
      </a>

      <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg md:grid-cols-2">
        <section className="relative hidden overflow-hidden md:block">
          <img
            src={logo}
            alt={t("heroAlt")}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 text-primary-foreground">
            <h2 className="text-3xl font-bold font-display">
              {t("heroTitle")}
            </h2>
            <p className="mt-4 text-base opacity-90">{t("heroSubtitle")}</p>
          </div>
        </section>

        <section className="flex flex-col justify-center p-8 md:p-14">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary font-display">
              {t("title")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <form className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="full_name"
                className="text-sm font-semibold text-foreground"
              >
                {t("fields.fullName.label")}
              </label>
              <div className="relative">
                <MaterialIcon
                  name="person"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="full_name"
                  type="text"
                  placeholder={t("fields.fullName.placeholder")}
                  className="w-full rounded-xl border border-border bg-muted py-3 pl-12 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-foreground"
                >
                  {t("fields.email.label")}
                </label>
                <div className="relative">
                  <MaterialIcon
                    name="mail"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="email"
                    type="email"
                    placeholder={t("fields.email.placeholder")}
                    className="w-full rounded-xl border border-border bg-muted py-3 pl-12 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-foreground"
              >
                {t("fields.password.label")}
              </label>
              <div className="relative">
                <MaterialIcon
                  name="lock"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="password"
                  type="password"
                  placeholder={t("fields.password.placeholder")}
                  className="w-full rounded-xl border border-border bg-muted py-3 pl-12 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirm_password"
                className="text-sm font-semibold text-foreground"
              >
                {t("fields.confirmPassword.label")}
              </label>
              <div className="relative">
                <MaterialIcon
                  name="verified_user"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="confirm_password"
                  type="password"
                  placeholder={t("fields.confirmPassword.placeholder")}
                  className="w-full rounded-xl border border-border bg-muted py-3 pl-12 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input
                id="terms"
                type="checkbox"
                className="mt-1 h-5 w-5 rounded border-border text-primary focus:ring-ring"
              />
              <span>
                {t("terms.prefix")}
                <a className="text-primary hover:underline" href="#">
                  {t("terms.service")}
                </a>
                {t("terms.and")}
                <a className="text-primary hover:underline" href="#">
                  {t("terms.privacy")}
                </a>
                .
              </span>
            </label>

            <button
              type="submit"
              className="w-full rounded-xl bg-secondary px-4 py-4 text-base font-semibold text-secondary-foreground shadow-sm transition-opacity hover:opacity-90 active:scale-[0.99]"
            >
              {t("submit")}
            </button>
          </form>

          <div className="mt-8 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground">
            {t("already.prefix")}
            <a className="font-semibold text-primary hover:underline" href="#">
              {t("already.login")}
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
