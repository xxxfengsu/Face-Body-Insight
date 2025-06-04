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
          :class="{ active: activeGender === 'male' }"
          @click="activeGender = 'male'"
        >
          {{ t("changeClothes.male") }}
        </div>
        <div
          class="tab-item"
          :class="{ active: activeGender === 'female' }"
          @click="activeGender = 'female'"
        >
          {{ t("changeClothes.female") }}
        </div>
      </div>

      <div class="try-on-area">
        <div class="preview-container">
          <img :src="activeImage || ''" alt="Preview" class="preview-image" />
        </div>
        <div class="clothes-carousel">
          <div class="carousel-container" ref="carousel">
            <div
              v-for="(item, index) in images"
              :key="index"
              class="carousel-item"
              :class="{ active: currentIndex === index }"
              @click="handleItemClick(index)"
            >
              <img :src="item.url || ''" :alt="item.name || 'Item'" />
            </div>
          </div>
        </div>
      </div>

      <div class="material-selection">
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

// 性别选择
const activeGender = ref("female");

// 选中的材料类型
const selectedType = ref(12); // 默认选择女上衣

// 过滤后的材料列表
const filteredMaterials = computed(() => {
  return images.value.filter((item) => item.clothesType === selectedType.value);
});

// 获取衣服列表
const fetchClothes = async () => {
  let params = {
    cateId: selectedType.value,
    page: 1,
    pageSize: 999,
  };
  const response = await clothesApi.getClothes(params);
  console.log(response);
  console.log(1);
  // 直接使用返回的数据，每个item中已经包含了完整的url
  images.value = response.data.list.map((item, index) => ({
    ...item,
    clothesType: (index % 3) + 1, // 临时添加类型属性用于筛选
  }));
};

// 处理轮播项点击
const handleItemClick = (index) => {
  currentIndex.value = index;
  handleChangeClothes(images.value[index]);
};

// 处理材料选择
const handleMaterialSelect = (item) => {
  handleChangeClothes(item);
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
      margin: 20px 0;
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
        flex: 1;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 15px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.1);

        .preview-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      }

      .clothes-carousel {
        width: 150px;
        margin-left: 20px;
        overflow: hidden;

        .carousel-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
          height: 100%;
          overflow-y: auto;
          padding-right: 10px;

          &::-webkit-scrollbar {
            width: 3px;
          }

          &::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
          }

          &::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
          }

          .carousel-item {
            width: 100%;
            height: 100px;
            border-radius: 10px;
            overflow: hidden;
            cursor: pointer;
            position: relative;

            &:hover {
              transform: scale(1.05);
              transition: transform 0.2s;
            }

            &.active {
              border: 2px solid white;

              &:after {
                content: "";
                position: absolute;
                top: 5px;
                right: 5px;
                width: 15px;
                height: 15px;
                border-radius: 50%;
                background: #4caf50;
              }
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

    .material-selection {
      margin-top: auto;

      .material-tabs {
        display: flex;
        justify-content: center;
        margin-bottom: 15px;

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
</style>
