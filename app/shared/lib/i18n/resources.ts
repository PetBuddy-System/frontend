import enAuth from "~/locales/en/auth.json";
import enCommon from "~/locales/en/common.json";
import enLanding from "~/locales/en/landing.json";
import enProducts from "~/locales/en/products.json";
import enServices from "~/locales/en/services.json";
import enWelcome from "~/locales/en/welcome.json";
import viAuth from "~/locales/vi/auth.json";
import viCommon from "~/locales/vi/common.json";
import viLanding from "~/locales/vi/landing.json";
import viProducts from "~/locales/vi/products.json";
import viServices from "~/locales/vi/services.json";
import viWelcome from "~/locales/vi/welcome.json";

/**
 * Tập hợp tài nguyên i18n. Mỗi feature 1 namespace riêng để:
 * - Tránh đè key giữa các feature.
 * - Sau này dễ chuyển sang lazy-load (mỗi namespace 1 file riêng).
 *
 * Khi thêm namespace mới:
 *   1. Tạo locales/{en,vi}/<feature>.json
 *   2. Import + thêm vào object dưới
 *   3. Thêm tên namespace vào NAMESPACES
 */

export const NAMESPACES = [
  "common",
  "welcome",
  "landing",
  "auth",
  "products",
  "services",
] as const;
export type Namespace = (typeof NAMESPACES)[number];

export const DEFAULT_NAMESPACE: Namespace = "common";

export const resources = {
  en: {
    auth: enAuth,
    common: enCommon,
    landing: enLanding,
    products: enProducts,
    services: enServices,
    welcome: enWelcome,
  },
  vi: {
    auth: viAuth,
    common: viCommon,
    landing: viLanding,
    products: viProducts,
    services: viServices,
    welcome: viWelcome,
  },
} as const;

export const SUPPORTED_LANGUAGES = ["en", "vi"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const FALLBACK_LANGUAGE: Language = "vi";
