<script setup>
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { languageUtils } from "./utils/languageUtils";
import Home from "./components/Home.vue";

const { locale } = useI18n();

// 初始化语言设置
onMounted(() => {
  // 设置语言为本地存储的值
  locale.value = languageUtils.getLanguage();

  // 监听语言变化事件
  window.addEventListener("languageChange", (event) => {
    locale.value = event.detail;
  });
});
</script>

<template>
  <router-view />
</template>

<style scoped></style>
