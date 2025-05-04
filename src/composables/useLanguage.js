import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { languageUtils } from "../utils/languageUtils";

export function useLanguage() {
  const { locale } = useI18n();

  // 初始化时设置为localStorage中保存的语言
  if (locale.value !== languageUtils.getLanguage()) {
    locale.value = languageUtils.getLanguage();
  }

  // 当前语言
  const currentLanguage = computed(() => locale.value);

  // 切换语言
  const changeLanguage = (lang) => {
    if (languageUtils.isSupported(lang)) {
      locale.value = languageUtils.setLanguage(lang);
      // 触发语言改变事件，方便全局响应
      window.dispatchEvent(new CustomEvent("languageChange", { detail: lang }));
    }
  };

  return {
    currentLanguage,
    changeLanguage,
  };
}
