import type { TolgeeInstance } from "@tolgee/web";

export function loadTranslations(instance: TolgeeInstance) {
  instance.addStaticData({
    "en:auth.platform.page.validateEmail": () =>
      import("./tr/auth.platform.page.validateEmail/en.json").then((m) => m.default),
    "fr:auth.platform.page.validateEmail": () =>
      import("./tr/auth.platform.page.validateEmail/fr.json").then((m) => m.default),
    "en:auth.platform.page.register": () => import("./tr/auth.platform.page.register/en.json").then((m) => m.default),
    "fr:auth.platform.page.register": () => import("./tr/auth.platform.page.register/fr.json").then((m) => m.default),
    "en:auth.platform.page.resetPassword": () =>
      import("./tr/auth.platform.page.resetPassword/en.json").then((m) => m.default),
    "fr:auth.platform.page.resetPassword": () =>
      import("./tr/auth.platform.page.resetPassword/fr.json").then((m) => m.default),
  });
}
