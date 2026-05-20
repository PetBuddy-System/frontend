import { LandingPage } from "~/features/landing";

import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Pet Store" },
    { name: "description", content: "Pet Store landing page" },
  ];
}

export default function Home() {
  return <LandingPage />;
}
