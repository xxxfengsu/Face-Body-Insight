import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import i18n from "./i18n"; // 导入i18n配置

// 创建Vue应用实例
const app = createApp(App);

// 使用插件
app.use(router);
app.use(i18n);

// 挂载应用
app.mount("#app");
