import { RegisterPage } from "~/features/auth";

import type { Route } from "./+types/register";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dang ky" }];
}

export default function Register() {
  return <RegisterPage />;
}
