import { createI18n } from "vue-i18n";
import en from "./locales/en.js";
import zh from "./locales/zh.js";
import { languageUtils } from "../utils/languageUtils";

const i18n = createI18n({
  legacy: false, // 使用组合式API
  locale: languageUtils.getLanguage(), // 使用工具类获取语言设置
  fallbackLocale: "en", // 备用语言
  messages: {
    en,
    zh,
  },
});

export default i18n;
