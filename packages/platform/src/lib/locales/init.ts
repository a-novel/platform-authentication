import type { TolgeeInstance } from "@tolgee/web";

export function loadTranslations(instance: TolgeeInstance) {
  instance.addStaticData({
    "en:auth.platform.page.validateEmail": () =>
      import("./tr/auth.platform.page.validateEmail/en.json").then((m) => m.default),
    "fr:auth.platform.page.validateEmail": () =>
      import("./tr/auth.platform.page.validateEmail/fr.json").then((m) => m.default),
    "en:auth.platform.page.register": () => import("./tr/auth.platform.page.register/en.json").then((m) => m.default),
    "fr:auth.platform.page.register": () => import("./tr/auth.platform.page.register/fr.json").then((m) => m.default),
    "en:auth.platform.page.passwordReset": () =>
      import("./tr/auth.platform.page.passwordReset/en.json").then((m) => m.default),
    "fr:auth.platform.page.passwordReset": () =>
      import("./tr/auth.platform.page.passwordReset/fr.json").then((m) => m.default),
    "en:auth.platform.page.manageAccount": () =>
      import("./tr/auth.platform.page.manageAccount/en.json").then((m) => m.default),
    "fr:auth.platform.page.manageAccount": () =>
      import("./tr/auth.platform.page.manageAccount/fr.json").then((m) => m.default),
  });
}
