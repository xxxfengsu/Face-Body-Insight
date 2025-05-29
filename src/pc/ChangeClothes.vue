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

    <div class="carousel-container">
      <div
        class="carousel"
        ref="carousel"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div class="carousel-track" :style="carouselStyle">
          <div
            v-for="(item, index) in images"
            :key="index"
            class="carousel-item"
          >
            <img :src="item.url" alt="Dress preview" class="carousel-image" />
          </div>
        </div>
        <div class="mainBox">
          <img :src="activeImage" alt="Dress preview" class="carousel-image" />
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">
      {{ $t("changeClothes.loading") }}
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLanguage } from "../composables/useLanguage";
import { clothesApi } from "@/api";
import changeclothes from "../assets/changeclothes.png";
import changeclothes1 from "../assets/changeclothes1.png";
import changeclothes2 from "../assets/changeclothes2.png";

const router = useRouter();
const { t } = useI18n();
// 使用语言钩子
const { currentLanguage, changeLanguage } = useLanguage();

const carousel = ref(null);
const currentIndex = ref(0);
let touchStartX = 0;
const images = ref([]);
let activeImage = ref(
  "http://suuqjbby1.hn-bkt.clouddn.com/tryon/origin/uploads/2025-04-18/changeclothes.png"
);
const loading = ref(false);
const error = ref(null);
const clothesTypeDic = {
  1: "Upper-body",
  2: "Lower-body",
  3: "Dress",
};

// 获取衣服列表
const fetchClothes = async () => {
  let params = {
    cateId: 2,
    page: 1,
    pageSize: 20,
  };
  const response = await clothesApi.getClothes(params);
  console.log(response);
  console.log(1);
  // 直接使用返回的数据，每个item中已经包含了完整的url
  images.value = response.data.list;
};

// 切换衣服
const handleChangeClothes = async (item) => {
  try {
    loading.value = true;
    let params = {
      modelUrl:
        "http://suuqjbby1.hn-bkt.clouddn.com/tryon/origin/uploads/2025-04-18/changeclothes.png",
      clothesUrl: item.url,
      cateId: item.cateId,
    };
    let res = await clothesApi.changeClothes(params);
    activeImage.value = res.data.resultImage;
    // 可以在这里添加成功提示或其他操作
    loading.value = false;
  } catch (err) {
    loading.value = false;
    console.error("Failed to change clothes:", err);
    // 处理错误情况
  }
};

// 在组件挂载时获取衣服列表
onMounted(() => {
  fetchClothes();
});

// 计算是否显示了最后一张图片
const isLastImageVisible = computed(() => {
  // 考虑到一次显示3张图片，当currentIndex到达倒数第三张时，最后一张就会出现在视口中
  return currentIndex.value >= images.value.length - 3;
});

const carouselStyle = computed(() => ({
  transform: `translateX(calc(-${currentIndex.value * 33.333}% - ${
    currentIndex.value * 10
  }px))`,
  transition: "transform 0.3s ease-out",
}));

const goBack = () => {
  router.push("/main");
};

const handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX;
};

const handleTouchMove = (e) => {
  e.preventDefault(); // 防止页面滚动
};

const handleTouchEnd = async (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const diff = touchEndX - touchStartX;
  const minSwipeDistance = 50;

  if (Math.abs(diff) > minSwipeDistance) {
    if (diff > 0 && currentIndex.value > 0) {
      currentIndex.value--;
      // 切换到上一件衣服时调用 API
      await handleChangeClothes(images.value[currentIndex.value]);
    } else if (
      diff < 0 &&
      !isLastImageVisible.value &&
      currentIndex.value < images.value.length - 1
    ) {
      currentIndex.value++;
      // 切换到下一件衣服时调用 API
      await handleChangeClothes(images.value[currentIndex.value]);
    }
  }
};
</script>

<style lang="less" scoped>
.change-clothes {
  width: 100%;
  height: 100vh;
  background-image: url(../assets/baseDeepPic.png);
  background-size: cover;
  position: fixed;
  top: 0;
  left: 0;

  .head-container {
    width: 100%;
    box-sizing: border-box;
    background: #666;
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

  .carousel-container {
    width: 100%;
    height: calc(100% - 76px);
    position: relative;
    overflow: hidden;

    .carousel {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      touch-action: pan-x;

      .mainBox {
        position: absolute;
        top: 20%;
        bottom: 20%;
        left: 20%;
        right: 20%;
        border-radius: 2rem;
        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .carousel-track {
        display: flex;
        height: 100%;
        align-items: center;
        gap: 10px;

        .carousel-item {
          flex: 0 0 33.333%;
          display: flex;
          justify-content: center;
          align-items: center;

          .carousel-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        }
      }
    }
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    z-index: 100;
  }

  .error-message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: red;
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    z-index: 100;
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
</style>
