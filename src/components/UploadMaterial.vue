<template>
  <div class="main">
    <div class="back" @click="goBack">
      <span></span>
    </div>

    <div class="backPic"></div>
    <div class="formBox">
      <!-- <div class="input-number">
        <input
          type="text"
          :placeholder="$t('main.inputPlaceholder')"
          v-model="uploadId"
        />
      </div> -->

      <div class="upload-box" @click="triggerFileUpload">
        <input
          type="file"
          ref="fileInput"
          @change="handleFileUpload"
          style="display: none"
        />
        <img
          v-if="uploadedImageUrl"
          :src="uploadedImageUrl"
          alt="预览"
          class="preview-img"
        />
        <div v-else class="plus-icon">+</div>
      </div>

      <button class="go-button" @click="handleSubmit">
        {{ $t("main.go") }}
      </button>
    </div>

    <div class="center-layout">
      <!-- 性别切换 -->
      <div class="gender-switch">
        <div
          :class="['gender-btn', { active: gender === 'female' }]"
          @click="gender = 'female'"
        >
          <i class="female-icon"></i> 女
        </div>
        <div
          :class="['gender-btn', { active: gender === 'male' }]"
          @click="gender = 'male'"
        >
          <i class="male-icon"></i>男
        </div>
      </div>

      <!-- 发型/风格参考 -->
      <div class="top-options">
        <div
          class="option-block"
          :class="{ selected: selectedOption === 0 }"
          @click="selectedOption = 0"
        >
          <div class="option-label">发型</div>
          <img src="../assets/icon/hair_icon.png" alt="发型" />
          <div v-if="selectedOption === 0" class="select-dot"></div>
        </div>
        <div
          class="option-block"
          :class="{ selected: selectedOption === 1 }"
          @click="selectedOption = 1"
        >
          <div class="option-label">风格参考</div>
          <img src="../assets/icon/style_icon.png" alt="风格参考" />
          <div v-if="selectedOption === 1" class="select-dot"></div>
        </div>
      </div>

      <!-- 上衣/下衣/全身 -->
      <div class="bottom-options">
        <div
          class="option-block"
          :class="{ selected: selectedOption === 2 }"
          @click="selectedOption = 2"
        >
          <div class="option-label">上衣</div>
          <img src="../assets/icon/top_icon.png" alt="上衣" />
          <div v-if="selectedOption === 2" class="select-dot"></div>
        </div>
        <div
          class="option-block"
          :class="{ selected: selectedOption === 3 }"
          @click="selectedOption = 3"
        >
          <div class="option-label">下衣</div>
          <img src="../assets/icon/bottom_icon.png" alt="下衣" />
          <div v-if="selectedOption === 3" class="select-dot"></div>
        </div>
        <div
          class="option-block"
          :class="{ selected: selectedOption === 4 }"
          @click="selectedOption = 4"
        >
          <div class="option-label">全身</div>
          <img src="../assets/icon/full_icon.png" alt="全身" />
          <div v-if="selectedOption === 4" class="select-dot"></div>
        </div>
      </div>
    </div>
    <!-- 在 template 部分，添加加载指示器 -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在上传...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLanguage } from "../composables/useLanguage";
import { clothesApi } from "../api";
// import History from "./History.vue";
// import Uploading from "./Uploading.vue";

// 获取i18n实例
const { t } = useI18n();
// 使用语言钩子
const { currentLanguage, changeLanguage } = useLanguage();

let activeRoute = ref(1);
let selectedBox = ref(32);
let uploadId = ref("");
const fileInput = ref(null);
const headScroll = ref(null);
const router = useRouter();
const uploadedImageUrl = ref(null);
const isLoading = ref(false);

// 添加触摸滑动相关变量
let touchStartX = 0;
let scrollLeft = 0;

const gender = ref("female");
const selectedOption = ref(0); // 0:发型 1:风格参考 2:上衣 3:下衣 4:全身
const uploadDict = {
  male: {
    0: 15,
    1: 29,
    2: 9,
    3: 10,
    4: 11,
  },
  female: {
    0: 16,
    1: 30,
    2: 12,
    3: 13,
    4: 14,
  },
};

let uploadedFile = null;

onMounted(() => {
  // 获取存储的语言设置
  const savedLanguage = localStorage.getItem("language");
  if (savedLanguage) {
    changeLanguage(savedLanguage);
  }

  // 原有的视口高度适配代码保持不变
  const setVh = () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };
  setVh();
  window.addEventListener("resize", setVh);
  setTimeout(setVh, 100);

  // 添加触摸事件监听
  const headElement = headScroll.value;
  if (headElement) {
    headElement.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    headElement.addEventListener("touchmove", handleTouchMove, {
      passive: true,
    });
    headElement.addEventListener("touchend", handleTouchEnd, { passive: true });
  }
});

const triggerFileUpload = () => {
  fileInput.value.click();
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    uploadedFile = file;
    uploadedImageUrl.value = URL.createObjectURL(file);
  }
};

const handleSubmit = async () => {
  const cateId = uploadDict[gender.value][selectedOption.value];
  if (!uploadedImageUrl.value) {
    alert("请先上传图片");
    return;
  }
  try {
    // 开始加载
    isLoading.value = true;
    // 将base64数据转换为Blob
    const base64Response = await fetch(uploadedImageUrl.value);
    const blob = await base64Response.blob();
    // 用原文件名和类型
    const file = new File([blob], uploadedFile.name, {
      type: uploadedFile.type,
    });

    // 创建FormData对象
    const formData = new FormData();
    formData.append("file", file);
    formData.append("cateId", cateId);
    formData.append("isSave", "1");
    const token = sessionStorage.getItem("token");
    if (token) {
      formData.append("token", token);
    }
    let res;
    // 调用API上传文件
    if (cateId == 29 || cateId == 30) {
      res = await clothesApi.createStyleReference(formData);
    } else {
      res = await clothesApi.uploadImage(formData);
    }

    if (res.code == 0) {
      // 上传成功后，取消loading，然后跳转
      // 跳转到报告页面
      alert("图片保存成功");
      uploadedImageUrl.value = null;
      if (fileInput.value) {
        fileInput.value.value = "";
      }
    } else {
      alert("图片保存失败，请重试");
    }
    isLoading.value = false;
  } catch (error) {
    // 出错时也要取消loading
    isLoading.value = false;
  }
};

// 触摸事件处理函数
const handleTouchStart = (e) => {
  touchStartX = e.touches[0].pageX;
  scrollLeft = headScroll.value.scrollLeft;
};

const handleTouchMove = (e) => {
  if (!touchStartX) return;
  const x = e.touches[0].pageX;
  const walk = (touchStartX - x) * 2; // 滚动速度系数
  headScroll.value.scrollLeft = scrollLeft + walk;
};

const handleTouchEnd = () => {
  touchStartX = null;
};
const goBack = () => {
  router.push("/main");
};
</script>

<style lang="less" scoped>
.main {
  position: fixed; /* 改为fixed定位，确保填满整个视口 */
  top: 0;
  left: 0;
  width: 100%;
  max-width: 100%;
  height: 100%; /* 简化高度设置 */
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
  overflow-y: auto; /* 允许垂直滚动 */
  box-sizing: border-box;
  background-color: white; /* 确保底部不会露出底层颜色 */

  .backPic {
    width: 100%;
    flex: 0 0 auto; /* 不要伸缩，保持自身大小 */
    height: 60vmax; /* 使用vmax单位，响应不同设备 */
    max-height: 60%; /* 最大不超过容器的60% */
    background-position: center center;
    background-image: url(/src/assets/baseDeepPic.png);
    background-size: cover;
    background-repeat: no-repeat;
    border-bottom-right-radius: 30px;
    border-bottom-left-radius: 30px;
    position: relative;
    max-width: 500px;
    margin-bottom: 20px;

    .head-container {
      width: 100%;
      overflow: hidden;
      position: relative;

      &::after {
        content: "";
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        width: 20px;
        background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.3));
        pointer-events: none;
      }

      .head {
        display: flex;
        color: #fff;
        padding: 1.5rem 1rem;
        margin-bottom: 1rem;
        overflow-x: auto;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
        white-space: nowrap;
        gap: 0.5rem;
        padding-right: 2rem; /* 为渐变留出空间 */

        &::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }

        div {
          padding: 0.5rem 1rem;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
          transition: all 0.3s ease;

          &.activeRoute {
            text-decoration: underline;
            font-weight: 500;
          }

          &:not(:last-child) {
            margin-right: 0.5rem;
          }
        }
      }
    }

    .changeMode {
      height: calc(100% - 4rem);
      position: relative;

      .select-boxes {
        position: absolute;
        right: 10%;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        z-index: 10;

        .select-box {
          width: 65px;
          height: 65px;
          border-radius: 10px;
          // overflow: hidden;
          border: 2px solid white;
          background-color: #333;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;

          &.active {
            width: 85px;
            height: 85px;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          &::before {
            content: "";
            position: absolute;
            left: -25px;
            top: 50%;
            transform: translateY(-50%);
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: #fff;
          }
        }
      }
    }

    // 添加语言切换按钮样式
    .language-switcher {
      position: absolute;
      top: 5rem;
      left: 20px;
      display: flex;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

      .language-btn {
        padding: 8px 12px;
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;

        &.active {
          background: rgba(255, 255, 255, 0.3);
          font-weight: bold;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      }
    }
  }

  .formBox {
    width: 100%;
    max-width: 500px;
    background-color: white;
    border-radius: 30px 30px 0 0;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    margin-top: -30px;
    box-sizing: border-box;
    flex: 1 0 auto; /* 允许伸长但不收缩，确保填满剩余空间 */

    .input-number {
      width: 85%;
      max-width: 400px;
      margin-top: 10px;

      input {
        width: 100%;
        height: 45px;
        border-radius: 25px;
        border: 1px solid #ddd;
        padding: 0 20px;
        font-size: 16px;
        outline: none;
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.05);
        text-align: left;
        box-sizing: border-box;

        &::placeholder {
          color: #aaa;
        }
      }
    }

    .upload-box {
      width: 80%;
      max-width: 400px;
      height: 110px;
      border: 2px dashed #ccc;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-sizing: border-box;
      margin: 15px 0; /* 添加上下边距 */

      &:hover {
        border-color: #aaa;
      }

      .plus-icon {
        font-size: 40px;
        color: #5b4f4f;
        font-weight: bold;
      }
    }

    .go-button {
      color: #000;
      width: 100px;
      height: 40px;
      border-radius: 20px;
      background-color: white;
      border: 1px solid #ddd;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
      margin-top: 10px;
      margin-bottom: 20px; /* 增加底部边距 */

      &:hover {
        background-color: #f8f8f8;
        box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.15);
      }

      &:active {
        transform: translateY(2px);
        box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

// 添加全局样式以确保内容不超出屏幕
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 确保基础页面容器不会溢出 */
html,
body {
  overflow: hidden; /* 防止滚动 */
  width: 100%;
  height: 100%;
  position: relative;
  margin: 0;
  padding: 0;
  background-color: white;
  touch-action: manipulation; /* 优化移动端触摸 */
}

#app {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

// 确保手机端展示正确
@media (max-width: 500px) {
  .main {
    .backPic {
      width: 100%;
    }
    .formBox {
      width: 100%;
      padding: 25px 20px; /* 修改内边距 */
    }
  }
}

/* 针对特别小的屏幕 */
@media (max-height: 600px) {
  .main .backPic {
    height: 50vmax;
  }

  .main .formBox {
    gap: 10px;
  }

  .main .formBox .upload-box {
    height: 60px;
    margin: 10px 0;
  }

  .main .formBox .input-number input {
    height: 40px;
  }

  .main .formBox .go-button {
    margin-bottom: 15px;
  }
}

.back {
  position: absolute;
  left: 20px;
  top: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  span {
    background: url(../assets/icon/back_icon.png) no-repeat center center;
    width: 12px;
    height: 21px;
  }
}

.center-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 4rem;
}

.gender-switch {
  display: flex;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.gender-btn {
  padding: 10px 32px;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  background: transparent;
  border: none;
  outline: none;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  i {
    width: 30px;
    height: 30px;
    margin-right: 5px;
  }
  .male-icon {
    background: url(../assets/icon/Boy_Light_Skin_Tone.png) no-repeat 100% 100%;
  }
  .female-icon {
    background: url(../assets/icon/Girl_Light_Skin_Tone.png) no-repeat 100% 100%;
  }
}
.gender-btn.active {
  background: rgba(255, 255, 255, 0.5);
  color: #222;
  font-weight: bold;
}

.top-options,
.bottom-options {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.option-block {
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: 110px;
  height: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: box-shadow 0.2s;
  color: #fff;
}
.option-block img {
  width: 60px;
  height: 60px;
  margin-bottom: 8px;
}
.option-label {
  font-size: 16px;
  color: #fff;
  text-align: center;
}

.select-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
  margin: 6px auto 0 auto;
}

.all-options {
  flex-wrap: wrap;
  row-gap: 20px;
}

.preview-img {
  max-width: 100%;
  max-height: 100px;
  border-radius: 10px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
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
