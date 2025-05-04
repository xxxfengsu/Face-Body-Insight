import { createRouter, createWebHistory } from "vue-router";
import Home from "../components/Home.vue";
import { languageUtils } from "../utils/languageUtils";

// 引入其他页面组件
// 例如: import Main from '../components/Main.vue'

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/login",
    name: "login",
    // 懒加载路由
    component: () => import("../components/Login.vue"),
  },
  {
    path: "/main",
    name: "main",
    // 懒加载路由
    component: () => import("../components/Main.vue"),
  },
  {
    path: "/change-clothes",
    name: "changeClothes",
    component: () => import("../components/ChangeClothes.vue"),
  },
  {
    path: "/report",
    name: "report",
    component: () => import("../components/Report.vue"),
  },
  {
    path: "/history",
    name: "history",
    component: () => import("../components/History.vue"),
  },
  {
    path: "/image-editor",
    name: "imageEditor",
    component: () => import("../components/ImageEditor.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 添加全局前置守卫，确保每个页面都使用正确的语言
router.beforeEach((to, from, next) => {
  // 获取当前设置的语言
  const currentLanguage = languageUtils.getLanguage();

  // 如果路由中包含语言参数，则切换语言
  if (to.query.lang && languageUtils.isSupported(to.query.lang)) {
    languageUtils.setLanguage(to.query.lang);
    // 触发语言改变事件
    window.dispatchEvent(
      new CustomEvent("languageChange", {
        detail: to.query.lang,
      })
    );
  }

  next();
});

export default router;
