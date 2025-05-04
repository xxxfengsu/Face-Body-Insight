// 语言工具类
export const languageUtils = {
  // 默认语言
  defaultLanguage: "zh",

  // 获取语言设置
  getLanguage() {
    return localStorage.getItem("language") || this.defaultLanguage;
  },

  // 保存语言设置
  setLanguage(lang) {
    localStorage.setItem("language", lang);
    return lang;
  },

  // 检查是否支持该语言
  isSupported(lang) {
    return ["zh", "en"].includes(lang);
  },
};
