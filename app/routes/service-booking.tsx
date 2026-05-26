import { ServiceBookingPage } from "~/features/services";

import type { Route } from "./+types/service-booking";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Cau hinh dich vu moi" }];
}

export default function ServiceBooking() {
  return <ServiceBookingPage />;
}
