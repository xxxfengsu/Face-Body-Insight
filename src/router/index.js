import { createRouter, createWebHistory } from "vue-router";
import Home from "../components/Home.vue";

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
  // 可以添加更多路由...
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
