import { useTranslation } from "react-i18next";

import { cn } from "~/shared/lib/cn";

import { MaterialIcon } from "./material-icon";

export const BOOKING_SERVICES = [
  {
    key: "bath",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0uiGNI3KLzwPPKPMMaY2J0rIHLcPCZxgCvlxYtatUATFPk4_K52e-mfkAMRPeu1HhsisPfCzYSiZygpsP71B8fWIfExOpRnNMeK3sW2Hgq0aueuv-ivNMfJJBW0I7P1HkXOo6AVecXvXQGc_dqAt66JFEYYrpGKALewmDnLPU8Y_GuQZlRNepnQSuS7gpyUkdh-OasqAh0bU4fLXumpr5ukg2F_1JTecQ6jh0FJSh686s4FGlXCRuEzkWuU",
  },
  {
    key: "spa",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ugRJodtV8wx_zOu5IYa3uVQMeClnVg-j-HdlUZNlMvKFjZwwcN_dY1C39kaIZOL_698wP-ZmXZQMSdOAhtHfBa67OpQTDs4XaTaSugA90DMiwo9fO-ac4Zbi5gMonEx3ldT_Obu-6P1TD5DHT8tDsofZadUiBDNKtBR9mfv08ATfKwX8oxudpmQoxcGVqOL30sWJWeO9J13-dZefE-OeASouhAFj1EW5l8b951Pf2CRERr5AY7TaC139Ys",
  },
  {
    key: "hygiene",
    imageUrl:
      "https://lh3.googleusercontent.com/aida/ADBb0ugqPizV4IE-HOkgqRoRGxv7ZTMh_034S20uGb4RWfCZZ9rYBwkU9ott72Chw9nzvFceNPyNAwaoa7ZsENLw7IpbZNIs-zxKCFI8AWkl7smeOVa5HEuhdycaKnhT01ayOhRLWaIo0tLuH3m4tKPDNnmGZhWqj8lReFOwAOnZX5jx7BeqFUkqbCgnZI5uPUherFbUF2RLw7O5KsWZqzUiPvB4sMwJ1RL2A5vWhynGNx5hr2VrGFqChQn82C4",
  },
] as const;

export type BookingServiceKey = (typeof BOOKING_SERVICES)[number]["key"];

export interface ServiceBookingServicePickerProps {
  selectedService: BookingServiceKey;
  onSelectService: (service: BookingServiceKey) => void;
}

export function ServiceBookingServicePicker({
  selectedService,
  onSelectService,
}: ServiceBookingServicePickerProps) {
  const { t } = useTranslation("services");

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
      <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-semibold text-primary">
        <MaterialIcon name="room_service" className="text-secondary" />
        {t("bookingPage.service.title")}
      </h2>

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {BOOKING_SERVICES.map((service) => {
          const isSelected = selectedService === service.key;

          return (
            <label
              key={service.key}
              className="relative block w-[280px] flex-shrink-0 cursor-pointer snap-start md:w-[320px]"
            >
              <input
                className="sr-only"
                name="service"
                type="radio"
                checked={isSelected}
                onChange={() => onSelectService(service.key)}
              />
              <div
                className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-md",
                  isSelected ? "border-primary bg-cream-variant" : "border-border",
                )}
              >
                <div className="mb-4 h-40 w-full overflow-hidden rounded-lg bg-muted">
                  <img
                    src={service.imageUrl}
                    alt={t(`bookingPage.service.items.${service.key}.title`)}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <h3 className="mb-1 font-display text-lg font-semibold text-foreground">
                  {t(`bookingPage.service.items.${service.key}.title`)}
                </h3>
                <p className="mb-4 flex-grow text-sm text-muted-foreground">
                  {t(`bookingPage.service.items.${service.key}.description`)}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                  <span className="font-display text-lg font-bold text-primary">
                    {t(`bookingPage.service.items.${service.key}.price`)}
                  </span>
                </div>
                {isSelected ? (
                  <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <MaterialIcon name="check" className="text-sm" />
                  </span>
                ) : null}
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
