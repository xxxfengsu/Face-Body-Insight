<template>
  <div class="main">
    <div class="backPic">
      <div class="head-container">
        <div class="head" ref="headScroll">
          <div
            @click="changeRoute(1)"
            :class="activeRoute == 1 ? 'activeRoute' : ''"
          >
            {{ $t("main.uploading") }}
          </div>
          <div
            @click="changeRoute(2)"
            :class="activeRoute == 2 ? 'activeRoute' : ''"
          >
            {{$t("main.report")}}
          </div>
          <div
            @click="changeRoute(3)"
            :class="activeRoute == 3 ? 'activeRoute' : ''"
          >
            {{ $t("main.history") }}
          </div>
          <div
            @click="changeRoute(4)"
            :class="activeRoute == 4 ? 'activeRoute' : ''"
          >
            {{ $t("main.changeClothes") }}
          </div>
        </div>
      </div>


      <div class="changeMode">
        <div class="select-boxes">
          <div
            class="select-box"
            :class="{ active: selectedBox === 1 }"
            @click="selectBox(1)"
          >
            <img src="../assets/face_icon.png" alt="Face portrait" />
          </div>
          <div
            class="select-box"
            :class="{ active: selectedBox === 0 }"
            @click="selectBox(0)"
          >
            <img src="../assets/body_icon.png" alt="Face close-up" />
          </div>

        </div>
      </div>
    </div>
    <div class="formBox">
      <div class="input-number">
        <input type="text" :placeholder="$t('main.inputPlaceholder')" v-model="uploadId"/>
      </div>

      <div class="upload-box" @click="triggerFileUpload">
        <input
          type="file"
          ref="fileInput"
          @change="handleFileUpload"
          style="display: none"
        />
        <div class="plus-icon">+</div>
      </div>

      <button class="go-button" @click="handleSubmit">
        {{ $t("main.go") }}
      </button>
    </div>

    <!-- 内容容器 -->
    <div class="content-container">
      <Uploading v-if="activeRoute === 1" />
      <History v-if="activeRoute === 3" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLanguage } from "../composables/useLanguage";
// import History from "./History.vue";
// import Uploading from "./Uploading.vue";

// 获取i18n实例
const { t } = useI18n();
// 使用语言钩子
const { currentLanguage, changeLanguage } = useLanguage();

let activeRoute = ref(1);
let selectedBox = ref(1);
let uploadId = ref('')
const fileInput = ref(null);
const headScroll = ref(null);
const router = useRouter();
const uploadedImageUrl = ref(null);

// 添加触摸滑动相关变量
let touchStartX = 0;
let scrollLeft = 0;

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

const changeRoute = (index) => {
  activeRoute.value = index;
  if (index === 4) {
    // Change Clothes 选项
    router.push("/change-clothes");
  } else if (index === 2) {
    // Report 选项
    if (!localStorage.getItem("reportData")) {
      alert('请')
      return
    }
      
    router.push("/report");
  } else if (index === 3) {
    // History 选项
    router.push("/history");
  }
};

const selectBox = (index) => {
  selectedBox.value = index;
};

const triggerFileUpload = () => {
  fileInput.value.click();
};

const handleFileUpload = (event) => {
  // 清空之前选择的文件
  const fileInputElement = fileInput.value;
  
  // 验证主播编号
  if (!uploadId.value || uploadId.value.trim() === '') {
    alert('请输入主播编号');
    if (fileInputElement) {
      fileInputElement.value = ''; // 清空文件选择
    }
    return;
  }
  
  const file = event.target.files[0];
  if (file) {
    // 验证文件类型
    if (!file.type.includes('image/')) {
      alert('请上传图片文件（jpg、png等）');
      if (fileInputElement) {
        fileInputElement.value = ''; // 清空文件选择
      }
      return;
    }
    
    // 验证文件大小（限制为10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB');
      if (fileInputElement) {
        fileInputElement.value = ''; // 清空文件选择
      }
      return;
    }
    
    console.log("已选择文件:", file.name, "大小:", (file.size / 1024 / 1024).toFixed(2) + "MB", "主播ID:", uploadId.value);
    
    // 创建一个临时URL用于图片预览
    uploadedImageUrl.value = URL.createObjectURL(file);

    // 显示编辑选项
    showEditOptions();
  }
};

// 添加新方法: 显示编辑选项
const showEditOptions = () => {
  if (uploadedImageUrl.value) {
    // 使用确认对话框询问用户是否要编辑图片

      // // 将图片URL存储在本地存储中，以便在编辑页面加载
      // localStorage.setItem("editImage", uploadedImageUrl.value);
      // 导航到图片编辑页面
      router.push({
        path: "/image-editor",
        query: { imageUrl: uploadedImageUrl.value, personId:uploadId.value },
      });
  }
};

const handleSubmit = () => {
  console.log("Form submitted");
  // 可以在这里添加表单提交逻辑
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
            transform:translateY(-50%);
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: #fff
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
        color: #5B4F4F;
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
</style>
