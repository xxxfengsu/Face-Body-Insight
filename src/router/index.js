import { createRouter, createWebHashHistory } from "vue-router";
import { deviceUtils } from "../utils/deviceUtils";
import { languageUtils } from "../utils/languageUtils";

// 获取当前设备类型
const isPC = deviceUtils.isPC();

// 动态组件加载函数，根据设备类型选择不同目录的组件
const loadComponent = (componentName) => {
  if (isPC) {
    return () => import(`../pc/${componentName}.vue`);
  } else {
    return () => import(`../components/${componentName}.vue`);
  }
};

// 动态加载首页组件
const HomeComponent = isPC
  ? () => import("../pc/Home.vue")
  : () => import("../components/Home.vue");

// 引入其他页面组件
// 例如: import Main from '../components/Main.vue'

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeComponent,
  },
  {
    path: "/login",
    name: "login",
    component: loadComponent("Login"),
  },
  {
    path: "/main",
    name: "main",
    component: loadComponent("Main"),
  },
  {
    path: "/change-clothes",
    name: "changeClothes",
    component: loadComponent("ChangeClothes"),
  },
  {
    path: "/report",
    name: "report",
    component: loadComponent("Report"),
  },
  {
    path: "/history",
    name: "history",
    component: loadComponent("History"),
  },
  {
    path: "/image-editor",
    name: "imageEditor",
    component: loadComponent("ImageEditor"),
  },
  {
    path: "/upload-material",
    name: "uploadMaterial",
    component: loadComponent("UploadMaterial"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
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
