<template>
  <div class="page-container" ref="pageContainer">
    <img
      src="../assets/baseDeepPic.png"
      alt="Face Background"
      class="bg-image"
    />
    <div class="overlay">
      <div class="header">
        <div class="logo">
          <img src="../assets/logo.png" alt="Logo" />
        </div>
      </div>
      <h1 class="title">{{ $t("home.title") }}</h1>
      <p class="subtitle">{{ $t("home.subtitle") }}</p>
      <div class="go-button-wrapper">
        <transition name="slide-up">
          <div class="go-button-container" v-show="!isMoved">
            <div class="button-background"></div>
            <div class="arrow">>></div>
            <button
              @touchstart="startDrag"
              @touchmove="onDrag"
              @touchend="endDrag"
              :class="{ moved: isMoved }"
              :style="{ transform: `translateY(${dragOffset}px)` }"
            >
              {{ $t("home.go") }}
            </button>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLanguage } from "../composables/useLanguage";

export default {
  name: "BeautyIntroPage",
  setup() {
    const router = useRouter();
    const { t } = useI18n();
    const { currentLanguage, changeLanguage } = useLanguage();
    const isMoved = ref(false);
    const dragOffset = ref(0);
    const isDragging = ref(false);
    const startY = ref(0);

    const startDrag = (event) => {
      isDragging.value = true;
      startY.value = event.touches[0].clientY;
    };

    const onDrag = (event) => {
      if (!isDragging.value) return;

      const currentY = event.touches[0].clientY;
      const diff = currentY - startY.value;

      // 限制向下拖动
      if (diff > 0) return;

      // 最大拖动距离为 -200px
      dragOffset.value = Math.max(-200, diff);
    };

    const endDrag = () => {
      isDragging.value = false;

      // 在手指释放时，判断是否超过阈值
      if (dragOffset.value <= -100) {
        // 增加阈值到-100px
        isMoved.value = true;

        // 添加动画完成后的路由跳转
        setTimeout(() => {
          router.push("/login"); // 替换为您想要跳转的路由路径
        }, 0); // 等待动画完成后再跳转
      } else {
        // 如果没有触发移动动画，则回到原位
        dragOffset.value = 0;
      }
    };

    const animateButton = () => {
      isMoved.value = true;
    };

    return {
      isMoved,
      animateButton,
      dragOffset,
      startDrag,
      onDrag,
      endDrag,
      currentLanguage,
      changeLanguage,
    };
  },
};
</script>

<style scoped lang="less">
.page-container {
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Avenir", sans-serif;
  color: white;
  text-align: center;
  background-color: black;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: 1;
}

.overlay {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 2rem 1.5rem;
}
.header {
  display: flex;
  justify-content: end;
  width: 100%;
}
.logo {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 2;
  letter-spacing: 0.5px;
  margin-top: 6rem;
}

.subtitle {
  font-size: 1rem;
  margin: 0;
  font-weight: 400;
  opacity: 0.9;
}

.go-button-wrapper {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  height: 150px;
  overflow: hidden;
}

.go-button-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-background {
  position: relative;
  width: 70px;
  height: 150px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 35px;
  z-index: -1;
}

.arrow {
  position: absolute;
  font-size: 1rem;
  color: black;
  padding: 0.2rem 1rem;
  margin-bottom: 5px;
  z-index: 0;
  transform: rotate(-90deg);
  scale: 1.3;
  top: 30%;
}

button {
  position: absolute;
  bottom: 0;
  background-color: white;
  color: black;
  font-weight: bold;
  border: none;
  border-radius: 50%;
  width: 70px;
  height: 70px;
  cursor: pointer;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
  transition: transform 0.3s ease-out;
  touch-action: none;
}

button.moved {
  transform: translateY(-200px) !important;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100px);
}
</style>
