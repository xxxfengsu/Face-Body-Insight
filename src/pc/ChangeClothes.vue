<template>
  <div class="change-clothes">
    <div class="head-container">
      <img
        src="../assets/logo.png"
        style="width: 50px; height: 50px"
        class="top-icon"
        alt="icon"
      />
    </div>

    <div class="content_box">
      <div class="gender-tabs">
        <div
          class="tab-item"
          :class="{ active: activeGender === 'female' }"
          @click="changeGender('female')"
        >
          <img
            src="../assets/icon/Girl_Light_Skin_Tone.png"
            style="margin-right: 10px"
            alt="female"
          />
          {{ t("changeClothes.female") }}
        </div>
        <div
          class="tab-item"
          :class="{ active: activeGender === 'male' }"
          @click="changeGender('male')"
        >
          <img
            src="../assets/icon/Boy_Light_Skin_Tone.png"
            style="margin-right: 10px"
            alt="male"
          />
          {{ t("changeClothes.male") }}
        </div>
      </div>

      <div class="try-on-area">
        <div class="clothes-carousel">
          <div
            class="carousel-container"
            ref="carousel"
            :style="{
              padding: images.length < visibleCount ? '30px 30%' : '30px',
            }"
          >
            <div
              v-for="(item, index) in loopImages"
              :key="index"
              class="carousel-item"
              :class="{ active: index === currentIndex }"
              :style="getItemStyle(index)"
              @click="handleItemClick(index)"
            >
              <img :src="item.url || ''" :alt="item.name || 'Item'" />
            </div>
          </div>
          <button
            class="confirm-btn"
            v-if="images.length > 0"
            @click="handleConfirm"
          >
            确定
          </button>
        </div>
        <div class="preview-container">
          <img
            :src="changeActiveImage ? changeActiveImage : activeImage"
            alt="Preview"
            class="preview-image"
          />
        </div>
      </div>

      <div class="material-selection" v-if="boxFromRoute != '32'">
        <div class="material-tabs">
          <div
            v-for="(label, key) in clothesTypeDic[activeGender]"
            :key="key"
            class="material-tab"
            :class="{ active: selectedType === Number(key) }"
            @click="selectedType = Number(key)"
          >
            {{ label }}
          </div>
        </div>
      </div>
    </div>
    <!-- 在 template 部分，添加加载指示器 -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在处理图片...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { clothesApi } from "@/api";

const router = useRouter();
const { t } = useI18n();
const route = useRoute();

const carousel = ref(null);
const currentIndex = ref(0);
const boxFromRoute = ref("");

const images = ref([]);
const activeImage = ref("");
const changeActiveImage = ref("");
const loading = ref(false);
const error = ref(null);
const clothesTypeDic = {
  male: {
    9: "上衣",
    10: "下装",
    11: "连体",
  },
  female: {
    12: "上衣",
    13: "下装",
    14: "连体",
  },
};
// 在 script setup 部分的顶部添加一个 loading 状态
const isLoading = ref(false);
// 性别选择
const activeGender = ref("female");

// 选中的材料类型
const selectedType = ref(12); // 默认选择女上衣

const visibleCount = 5; // 可视区域显示的item数，需为奇数
const cloneCount = Math.floor(visibleCount / 2);

const loopImages = computed(() => {
  if (images.value.length === 0) return [];
  if (images.value.length < visibleCount) {
    // 不做头尾补齐
    return images.value;
  }
  return [
    ...images.value.slice(-cloneCount),
    ...images.value,
    ...images.value.slice(0, cloneCount),
  ];
});

onMounted(async () => {
  // 从路由参数中获取图片
  if (route.query.image) {
    try {
      activeImage.value = route.query.image;
    } catch (e) {
      console.error("解析图片数据失败:", e);
    }
  }
  boxFromRoute.value = route.query.boxFromRoute;
  // 获取衣服或头发列表
  if (boxFromRoute.value == "32") selectedType.value = 16;
  const res = await clothesApi.getClothes({
    cateId: selectedType.value,
    page: 1,
    pageSize: 100,
  });

  if (res.data && res.data.list) {
    images.value = res.data.list;
  }
});

// 监听性别和类型变化，重新获取衣服列表
watch([activeGender, selectedType], async ([newGender, newType]) => {
  const res = await clothesApi.getClothes({
    cateId: newType,
    page: 1,
    pageSize: 100,
  });

  if (res.data && res.data.list) {
    images.value = res.data.list;
  }
});

function changeGender(gender) {
  activeGender.value = gender;
  if (boxFromRoute.value == "32") {
    selectedType.value = gender === "female" ? 16 : 15;
  } else {
    selectedType.value = gender === "female" ? 12 : 9;
  }
}

// 点击图片切换
function handleItemClick(index) {
  currentIndex.value = index;
  nextTick(() => {
    scrollToCenter(index);
    checkLoop();
  });
}

// 检查是否到达假头/假尾，瞬间跳转
function checkLoop() {
  if (images.value.length < visibleCount) return; // 不做无限循环
  if (currentIndex.value < cloneCount) {
    currentIndex.value = images.value.length + currentIndex.value;
    scrollToCenter(currentIndex.value, true);
  } else if (currentIndex.value >= images.value.length + cloneCount) {
    currentIndex.value = currentIndex.value - images.value.length;
    scrollToCenter(currentIndex.value, true);
  }
}

// 计算每个item的样式
function getItemStyle(index) {
  const diff = index - currentIndex.value;
  if (Math.abs(diff) > 2) {
    return {
      opacity: 0,
      pointerEvents: "none",
      zIndex: 0,
      transform: "scale(0.7) translateX(0px)",
      transition: "all 0.3s",
    };
  }
  const zIndex = 10 - Math.abs(diff);
  const scale = diff === 0 ? 1.1 : 1 - Math.abs(diff) * 0.15;
  const offset = diff === 0 ? diff * 10 : diff * 80;
  const opacity = diff === 0 ? 1 : 0.7 - Math.abs(diff) * 0.2;
  return {
    zIndex,
    opacity,
    transform: `scale(${scale}) translateX(${-offset}px)`,
    transition: "all 0.3s",
  };
}

// 滚动到中间
function scrollToCenter(index, smooth = true) {
  setTimeout(() => {
    const carouselEl = carousel.value;
    if (!carouselEl) return;
    // 只选取可见的 carousel-item
    const itemEls = carouselEl.querySelectorAll(".carousel-item");
    if (!itemEls[index]) return;
    const containerWidth = carouselEl.offsetWidth;
    const itemLeft = itemEls[index].offsetLeft;
    const itemWidth = itemEls[index].offsetWidth;
    const scrollLeft = itemLeft - (containerWidth - itemWidth) / 2;
    carouselEl.scrollTo({
      left: scrollLeft,
      behavior: smooth ? "smooth" : "auto",
    });
  }, 200);
}

// 初始化时选中中间项
watch(loopImages, (val) => {
  if (val.length > 0) {
    if (images.value.length < visibleCount) {
      currentIndex.value = Math.floor(images.value.length / 2);
    } else {
      currentIndex.value = cloneCount + Math.floor(images.value.length / 2);
    }
    setTimeout(() => scrollToCenter(currentIndex.value), 100);
  }
});

async function handleConfirm() {
  isLoading.value = true;
  // 这里写你的业务逻辑，比如：
  // 1. 获取当前选中图片
  // 2. 跳转页面或发请求
  const selected =
    images.value[
      (currentIndex.value - cloneCount + images.value.length) %
        images.value.length
    ];
  // 示例：弹窗
  const base64Response = await fetch(activeImage.value);
  const blob = await base64Response.blob();

  // 创建文件对象
  const file = new File([blob], "edited_image.jpg", { type: "image/jpeg" });
  const formData = new FormData();
  formData.append("modelImage", file);
  formData.append("cateId", selectedType.value);
  formData.append("clothesUrl", selected.url);
  try {
    let res;
    if (boxFromRoute.value == "32") {
      res = await clothesApi.changeHair(formData);
    } else {
      res = await clothesApi.changeClothes(formData);
    }
    changeActiveImage.value = res.data;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
}
</script>

<style lang="less" scoped>
.change-clothes {
  width: 100%;
  height: 100vh;
  background-image: url(../assets/pc_bg.png);
  background-size: cover;
  background-position: right;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  color: white;

  .head-container {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    padding: 0 20px;
    height: 100px;
    align-items: center;
    position: relative;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    z-index: 2;

    @media (max-width: 1600px) {
      height: 100px;
    }

    @media (max-width: 1200px) {
      height: 100px;
    }
  }

  .content_box {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 100px);
    padding: 0 40px;
    box-sizing: border-box;

    .gender-tabs {
      display: flex;
      justify-content: center;
      margin: 0 0 20px 0;
      width: 220px;
      height: 40px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 20px;
      overflow: hidden;
      align-self: center;

      .tab-item {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50%;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;

        &.active {
          background: rgba(255, 255, 255, 0.2);
          font-weight: bold;
        }
      }
    }

    .try-on-area {
      display: flex;
      flex: 1;
      margin-bottom: 20px;
      min-height: 0;

      .preview-container {
        width: 40%;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 15px;
        overflow: hidden;

        .preview-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      }

      .clothes-carousel {
        width: 60%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        flex-direction: column;
        .carousel-mask {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 60px;
          z-index: 2;
          pointer-events: none;
          &.left {
            left: 0;
            background: linear-gradient(to right, #000 60%, transparent);
          }
          &.right {
            right: 0;
            background: linear-gradient(to left, #000 60%, transparent);
          }
        }
        .carousel-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: -60px;
          width: 100%;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 30px;
          scroll-snap-type: x mandatory;
          &::-webkit-scrollbar {
            display: none;
          }
        }
        .carousel-item {
          position: relative;
          flex: 0 0 240px;
          height: 340px;
          scroll-snap-align: center;
          border-radius: 20px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          opacity: 0.5;
          transform: scale(0.8);
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          &.active {
            opacity: 1;
            transform: scale(1.1);
            z-index: 1;
            border: 2px solid #fff;
          }
          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }
      }
    }

    .material-selection {
      margin-top: auto;

      .material-tabs {
        display: flex;
        justify-content: center;
        margin-bottom: 15px;
        gap: 130px;
        .material-tab {
          padding: 8px 20px;
          cursor: pointer;
          position: relative;
          opacity: 0.7;

          &.active {
            opacity: 1;

            &:after {
              content: "";
              position: absolute;
              bottom: -5px;
              left: 0;
              width: 100%;
              height: 2px;
              background-color: white;
            }
          }
        }
      }

      .material-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 15px;
        overflow-x: auto;
        padding-bottom: 20px;

        .material-item {
          width: 100%;
          aspect-ratio: 1/1;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.1);

          &:hover {
            transform: scale(1.05);
            transition: transform 0.2s;
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }
  }
}

.top-icon {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;

  @media (min-width: 1600px) {
    width: 70px;
    height: 70px;
    right: 60px;
  }

  @media (max-width: 992px) {
    width: 30px;
    height: 30px;
    right: 20px;
  }
}

.confirm-btn {
  display: block;
  margin: 30px auto 0 auto;
  padding: 10px 40px;
  font-size: 20px;
  background: #fff;
  color: #333;
  border: none;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #f0f0f0;
  }
}
/* 在 style 部分添加加载样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
}

.loading-text {
  color: white;
  font-size: 18px;
}
</style>
