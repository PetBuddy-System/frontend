import { useTranslation } from "react-i18next";
import logo from "../assets/cho-login.jpg";
import { MaterialIcon } from "~/shared/ui";

export function LoginPage() {
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

      <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg md:min-h-[700px] md:flex-row">
        <section className="flex w-full flex-col justify-center p-8 md:w-1/2 md:p-12 lg:p-16">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-primary font-display md:text-4xl">
              {t("login.welcomeTitle")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              {t("login.welcomeSubtitle")}
            </p>
          </div>

          <form className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="login_id"
                className="text-sm font-semibold text-foreground"
              >
                {t("login.fields.loginId.label")}
              </label>
              <input
                id="login_id"
                type="text"
                placeholder={t("login.fields.loginId.placeholder")}
                className="w-full rounded-xl border border-border bg-muted px-4 py-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-foreground"
                >
                  {t("fields.password.label")}
                </label>
                <a className="text-sm font-semibold text-primary hover:underline" href="#">
                  {t("login.forgot")}
                </a>
              </div>
              <input
                id="password"
                type="password"
                placeholder={t("fields.password.placeholder")}
                className="w-full rounded-xl border border-border bg-muted px-4 py-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <label className="flex items-center gap-3 text-sm text-muted-foreground">
              <input
                id="remember"
                type="checkbox"
                className="h-5 w-5 rounded border-border text-primary focus:ring-ring"
              />
              {t("login.remember")}
            </label>

            <button
              type="submit"
              className="w-full rounded-xl bg-secondary px-4 py-4 text-base font-semibold text-secondary-foreground shadow-md transition-opacity hover:opacity-90 active:scale-[0.99]"
            >
              {t("login.submit")}
            </button>
          </form>

          <div className="relative my-10 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <span className="relative bg-card px-4 text-sm font-semibold text-muted-foreground">
              {t("login.or")}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              className="flex items-center justify-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8dFu53rEG4tsS4qT-OIklx2ZgAe9Ivfx239CwWsNlkSuqDOTtw59vczBn4VhZ7IsbY8IaGqY37M-ghJfg6O9l41GbLuk2-UjIVjUrR8AdXrJjb0hmqtUE0gHSGeQXiYGbw-142G15wbL8EFKufeUggVW3tQJTEeQCmwOUl-H6mFiJqCJu0FlPH5sVssU7P09Gj7OtLdOVR9rfHmBKPmH-HFuu4-4UkcP3jdij0zw0kfbG_rkY_S-PTZMxfjE6x0vjpO8hrNNdUHw"
                alt={t("login.social.googleAlt")}
                className="h-5 w-5"
              />
              {t("login.social.google")}
            </button>
            
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t("login.noAccount")}
            <a className="font-semibold text-primary hover:underline" href="/register">
              {t("login.register")}
            </a>
          </p>
        </section>

        <section className="relative hidden w-1/2 overflow-hidden md:block">
          <img
            src={logo}
            alt={t("login.heroAlt")}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 text-primary-foreground">
            <h2 className="text-3xl font-bold font-display">
              {t("login.heroTitle")}
            </h2>
            <p className="mt-4 text-base opacity-90">{t("login.heroSubtitle")}</p>
          </div>
        </section>
      </div>

      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-zalo text-brand-zalo-foreground shadow-lg transition-transform hover:scale-105"
          aria-label={t("login.supportChat")}
        >
          <MaterialIcon name="chat" className="text-[26px]" />
        </button>
      </div>
    </main>
  );
}
