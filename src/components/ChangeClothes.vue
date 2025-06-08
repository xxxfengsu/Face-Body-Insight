<template>
  <div class="change-clothes">
    <div class="header">
      <div class="back" @click="goBack">
        <span></span>
      </div>
    </div>
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
    <div class="person-preview">
      <div class="person-bg">
        <img
          :src="changeActiveImage ? changeActiveImage : personImage"
          alt="person"
          class="person-img"
        />
      </div>
    </div>
    <div class="carousel-container">
      <div class="carousel-track">
        <div
          v-for="(item, idx) in materials"
          :key="item.id"
          class="carousel-item"
          :class="{ active: idx === selectedMaterialIndex }"
          @click="selectMaterial(idx)"
        >
          <img :src="item.url" alt="" class="carousel-img" />
        </div>
      </div>
    </div>

    <div
      class="confirm-button"
      @click="confirmSelection"
      v-if="materials.length > 0"
    >
      确定
    </div>

    <div class="clothes-type-tabs" v-if="boxFromRoute != '32'">
      <div
        v-for="(label, key) in clothesTypeDic[activeGender]"
        :key="key"
        class="type-item"
        :class="{ active: selectedType === Number(key) }"
        @click="selectedType = Number(key)"
      >
        {{ label }}
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
const activeGender = ref("female");
const selectedType = ref(12);
const changeActiveImage = ref("");
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
const boxFromRoute = ref("");
const personImage = ref("");
const materials = ref([]);
const selectedMaterialIndex = ref(0);
const isLoading = ref(false);

onMounted(() => {
  boxFromRoute.value = route.query.boxFromRoute;
  personImage.value = route.query.imageUrl || "";
  if (boxFromRoute.value == "32") {
    selectedType.value = activeGender.value === "female" ? 16 : 15;
  } else {
    selectedType.value = activeGender.value === "female" ? 12 : 9;
  }
  fetchMaterials();
});

function changeGender(gender) {
  activeGender.value = gender;
  if (boxFromRoute.value == "32") {
    selectedType.value = gender === "female" ? 16 : 15;
  } else {
    selectedType.value = gender === "female" ? 12 : 9;
  }
  fetchMaterials();
}

function goBack() {
  router.back();
}

async function fetchMaterials() {
  const res = await clothesApi.getClothes({
    cateId: selectedType.value,
    page: 1,
    pageSize: 100,
  });
  materials.value = res.data.list || [];
  selectedMaterialIndex.value = 0;
}

function selectMaterial(idx) {
  selectedMaterialIndex.value = idx;
}

async function confirmSelection() {
  const selected = materials.value[selectedMaterialIndex.value];
  isLoading.value = true;

  // 示例：弹窗
  const base64Response = await fetch(personImage.value);
  const blob = await base64Response.blob();

  // 创建文件对象
  const file = new File([blob], "edited_image.jpg", { type: "image/jpeg" });
  const formData = new FormData();

  try {
    let res;
    if (boxFromRoute.value == "32") {
      formData.append("faceImage", file);
      formData.append("shapeUrl", selected.url);
      res = await clothesApi.changeHair(formData);
    } else {
      formData.append("modelImage", file);
      formData.append("cateId", selectedType.value);
      formData.append("clothesUrl", selected.url);
      res = await clothesApi.changeClothes(formData);
    }
    changeActiveImage.value = res.data;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
}

watch([activeGender, selectedType], fetchMaterials);
</script>

<style lang="less" scoped>
.change-clothes {
  width: 100vw;
  height: 100vh;
  background-image: url(../assets/baseDeepPic.png);
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;

  .header {
    width: 100%;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 20px;
    .back {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      span {
        background: url(../assets/icon/back_icon.png) no-repeat center center;
        width: 12px;
        height: 21px;
        display: block;
      }
    }
  }

  .gender-tabs {
    margin-bottom: 20px;
    display: flex;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    z-index: 10;
    border: 1px solid rgba(255, 255, 255, 0.4);

    .tab-item {
      display: flex;
      align-items: center;
      padding: 8px 28px;
      font-size: 18px;
      color: #fff;
      cursor: pointer;
      position: relative;
      font-weight: 500;
      background: transparent;
      transition: background 0.2s, color 0.2s;

      img {
        width: 24px;
        height: 24px;
        margin-right: 8px;
      }

      &.active {
        background: rgba(255, 255, 255, 0.7);
        color: #222;
      }
    }
  }

  .person-preview {
    width: 70vw;
    max-width: 320px;
    min-width: 220px;
    height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
    margin-bottom: 20px;

    .person-bg {
      width: 100%;
      height: 100%;
      background: #fff;
      border-radius: 24px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      .person-img {
        width: 90%;
        height: 90%;
        object-fit: contain;
        border-radius: 16px;
      }
    }
  }

  .carousel-container {
    height: 110px;
    z-index: 10;
    overflow-x: auto;
    width: 100%;
    margin-bottom: 20px;
    /* 隐藏滚动条但保持可滚动 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari and Opera */
    }
    .carousel-track {
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 100%;
      // padding: 0 16px;
      gap: 16px;
      min-width: 100%;
      .carousel-item {
        flex: 0 0 auto;
        width: 90px;
        height: 100px;
        border-radius: 12px;
        overflow: hidden;
        border: 2px solid transparent;
        cursor: pointer;
        transition: border 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fff;
        &.active {
          border: 2px solid #409eff;
        }
        .carousel-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  .confirm-button {
    color: black;
    background: white;
    padding: 12px 32px;
    border-radius: 24px;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    transition: all 0.2s ease;
    z-index: 10;
  }

  .clothes-type-tabs {
    position: absolute;
    bottom: 48px;
    left: 0;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    background: transparent;
    z-index: 10;

    .type-item {
      font-size: 18px;
      color: #fff;
      padding: 6px 18px;
      cursor: pointer;
      position: relative;
      opacity: 0.8;
      transition: opacity 0.2s;

      &.active {
        opacity: 1;
        font-weight: 600;
        &::after {
          content: "";
          display: block;
          margin: 4px auto 0 auto;
          width: 24px;
          height: 2px;
          background: #fff;
          border-radius: 1px;
        }
      }
    }
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
