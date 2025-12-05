import type { TolgeeInstance } from "@tolgee/web";

export function loadTranslations(instance: TolgeeInstance) {
  instance.addStaticData({
    "en:auth.nav": () => import("./tr/auth.nav/en.json").then(m => m.default),
    "fr:auth.nav": () => import("./tr/auth.nav/fr.json").then(m => m.default),
    "en:auth.form": () => import("./tr/auth.form/en.json").then(m => m.default),
    "fr:auth.form": () => import("./tr/auth.form/fr.json").then(m => m.default),
    "en:auth.page.login": () => import("./tr/auth.page.login/en.json").then(m => m.default),
    "fr:auth.page.login": () => import("./tr/auth.page.login/fr.json").then(m => m.default),
    "en:auth.page.register": () => import("./tr/auth.page.register/en.json").then(m => m.default),
    "fr:auth.page.register": () => import("./tr/auth.page.register/fr.json").then(m => m.default),
    "en:auth.page.passwordReset": () => import("./tr/auth.page.passwordReset/en.json").then(m => m.default),
    "fr:auth.page.passwordReset": () => import("./tr/auth.page.passwordReset/fr.json").then(m => m.default),
  });
}
