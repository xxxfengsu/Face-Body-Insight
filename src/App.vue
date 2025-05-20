<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { languageUtils } from "./utils/languageUtils";
import { deviceUtils } from "./utils/deviceUtils";

const { locale } = useI18n();
const router = useRouter();
const isPC = ref(deviceUtils.isPC());

// 监听窗口大小变化，重新判断设备类型
const handleResize = () => {
  const newIsPC = deviceUtils.isPC();
  // 如果设备类型变化，刷新页面以应用正确的路由组件
  if (newIsPC !== isPC.value) {
    isPC.value = newIsPC;
    // 刷新当前页面以应用新的路由组件
    window.location.reload();
  }
};

// 初始化语言设置和设备检测
onMounted(() => {
  // 设置语言为本地存储的值
  locale.value = languageUtils.getLanguage();

  // 监听语言变化事件
  window.addEventListener("languageChange", (event) => {
    locale.value = event.detail;
  });

  // 监听窗口大小变化
  window.addEventListener("resize", handleResize);
});
</script>

<template>
  <router-view />
</template>

<style scoped></style>
