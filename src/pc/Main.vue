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
            {{ $t("main.report") }}
          </div>
          <div
            @click="changeRoute(3)"
            :class="activeRoute == 3 ? 'activeRoute' : ''"
          >
            {{ $t("main.history") }}
          </div>
          <!-- <div
            v-if="user?.authorityId === 1001"
            @click="changeRoute(4)"
            :class="activeRoute == 4 ? 'activeRoute' : ''"
          >
            {{ $t("main.uploadMaterial") }}
          </div> -->
        </div>
        <img
          src="../assets/logo.png"
          style="width: 50px; height: 50px"
          class="top-icon"
          alt="icon"
        />
      </div>
    </div>
    <div class="content">
      <div class="changeMode">
        <div class="select-boxes">
          <div
            class="select-box"
            :class="{ active: selectedBox === 32 }"
            @click="selectBox(32)"
          >
            <img src="../assets/pc/face_icon.png" alt="Face portrait" />
          </div>
          <div
            class="select-box"
            :class="{ active: selectedBox === 33 }"
            @click="selectBox(33)"
          >
            <img src="../assets/pc/body_icon.png" alt="Face close-up" />
          </div>
        </div>
      </div>
      <div class="formBox">
        <div class="input-number">
          <input
            type="text"
            :placeholder="$t('main.inputPlaceholder')"
            v-model="uploadId"
          />
        </div>

        <div class="upload-box" @click="triggerFileUpload">
          <input
            type="file"
            ref="fileInput"
            @change="handleFileUpload"
            style="display: none"
          />
          <div class="plus-icon" v-if="!previewImage">+</div>
          <img
            v-if="previewImage"
            :src="previewImage"
            class="preview-image"
            alt="Preview"
          />
        </div>

        <div class="action-buttons" v-if="previewImage">
          <button class="cancel-button" @click="cancelPreview">
            {{ $t("main.cancel") }}
          </button>
          <button class="confirm-button" @click="confirmUpload">
            {{ $t("main.confirm") }}
          </button>
        </div>

        <button v-else class="go-button" @click="handleSubmit">
          {{ $t("main.go") }}
        </button>
      </div>
    </div>
    <div class="contentBox"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
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
let selectedBox = ref(32);
let uploadId = ref("");
const user = ref(JSON.parse(sessionStorage.getItem("user")));
const fileInput = ref(null);
const headScroll = ref(null);
const router = useRouter();
const uploadedImageUrl = ref(null);
const windowWidth = ref(window.innerWidth);
const previewImage = ref(null);
const selectedFile = ref(null);

// 添加触摸滑动相关变量
let touchStartX = 0;
let scrollLeft = 0;

// 计算属性来判断不同的屏幕尺寸
const isLargeScreen = computed(() => windowWidth.value >= 1921);
const isMediumScreen = computed(
  () => windowWidth.value >= 1200 && windowWidth.value < 1921
);
const isSmallScreen = computed(() => windowWidth.value < 1200);

// 监听窗口大小变化的函数
const handleResize = () => {
  windowWidth.value = window.innerWidth;
  setVh();
};

// 设置视口高度的函数
const setVh = () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};

onMounted(() => {
  // 获取存储的语言设置
  const savedLanguage = localStorage.getItem("language");
  if (savedLanguage) {
    changeLanguage(savedLanguage);
  }

  // 设置初始视口高度
  setVh();

  // 添加窗口大小变化监听器
  window.addEventListener("resize", handleResize);

  // 短暂延迟后再次调整视口高度，确保所有元素已加载
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

// 在组件卸载前移除事件监听器
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);

  const headElement = headScroll.value;
  if (headElement) {
    headElement.removeEventListener("touchstart", handleTouchStart);
    headElement.removeEventListener("touchmove", handleTouchMove);
    headElement.removeEventListener("touchend", handleTouchEnd);
  }
});

const changeRoute = (index) => {
  if (index === 4) {
    // Change Clothes 选项
    router.push("/upload-material");
  } else if (index === 2) {
    // Report 选项
    if (!localStorage.getItem("reportData")) {
      alert("请上传图片");
      return;
    }

    router.push("/report");
  } else if (index === 3) {
    // History 选项
    router.push("/history");
  }
  activeRoute.value = index;
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

  // 验证主播姓名
  if (!uploadId.value || uploadId.value.trim() === "") {
    alert("请输入主播姓名");
    if (fileInputElement) {
      fileInputElement.value = ""; // 清空文件选择
    }
    return;
  }

  const file = event.target.files[0];
  if (file) {
    // 验证文件类型
    if (!file.type.includes("image/")) {
      alert("请上传图片文件（jpg、png等）");
      if (fileInputElement) {
        fileInputElement.value = ""; // 清空文件选择
      }
      return;
    }

    // 验证文件大小（限制为10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert("图片大小不能超过10MB");
      if (fileInputElement) {
        fileInputElement.value = ""; // 清空文件选择
      }
      return;
    }

    console.log(
      "已选择文件:",
      file.name,
      "大小:",
      (file.size / 1024 / 1024).toFixed(2) + "MB",
      "主播ID:",
      uploadId.value
    );

    // 存储所选文件
    selectedFile.value = file;

    // 创建一个临时URL用于图片预览
    previewImage.value = URL.createObjectURL(file);
  }
};

const cancelPreview = () => {
  // 清除预览图和选择的文件
  if (previewImage.value) {
    URL.revokeObjectURL(previewImage.value);
  }
  previewImage.value = null;
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const confirmUpload = () => {
  // 确认上传，创建uploadedImageUrl并继续原有逻辑
  uploadedImageUrl.value = previewImage.value;

  // 显示编辑选项
  showEditOptions();
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
      query: {
        imageUrl: uploadedImageUrl.value,
        personId: uploadId.value,
        selectedBox: selectedBox.value,
      },
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
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  align-items: stretch;
  justify-content: flex-start;
}

.head-container {
  width: 100%;
  background: #666;
  display: flex;
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
    height: 90px;
  }
}

.head {
  display: flex;
  flex: 1;
  justify-content: center;
  height: 100%;
  align-items: center;
  gap: 150px;
  font-size: 1.3rem;
  color: #fff;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  white-space: nowrap;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 1600px) {
    gap: 100px;
    font-size: 1.2rem;
  }

  @media (max-width: 1200px) {
    gap: 60px;
    font-size: 1.1rem;
  }

  @media (max-width: 992px) {
    gap: 40px;
    font-size: 1rem;
    justify-content: flex-start;
    padding-left: 20px;
  }

  .activeRoute {
    border-bottom: 3px solid #fff;
    font-weight: bold;
    padding-bottom: 8px;
  }

  div {
    cursor: pointer;
    padding: 18px 0 10px 0;
    border-bottom: 3px solid transparent;
    transition: border 0.2s;

    @media (max-width: 1200px) {
      padding: 14px 0 8px 0;
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

.changeMode {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-top: 40px;

  @media (max-width: 1600px) {
    margin-top: 30px;
  }

  @media (max-width: 1200px) {
    margin-top: 20px;
  }

  .select-boxes {
    display: flex;
    gap: 85px;

    @media (max-width: 1600px) {
      gap: 70px;
    }

    @media (max-width: 1200px) {
      gap: 50px;
    }

    .select-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      position: relative;

      &::before {
        content: "";
        position: absolute;
        bottom: -20px;
        transform: translateY(-50%);
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #fff;

        @media (max-width: 1200px) {
          bottom: -15px;
          width: 8px;
          height: 8px;
        }
      }

      img {
        width: 110px;
        height: 140px;
        border-radius: 16px;
        margin-bottom: 8px;

        @media (max-width: 1600px) {
          width: 90px;
          height: 120px;
        }

        @media (max-width: 1200px) {
          width: 80px;
          height: 100px;
        }
      }

      &.active img,
      &.active {
        transform: scale(1.1);
      }
    }
  }
}

.formBox {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 120px;
  left: 0;
  z-index: 3;

  .input-number {
    width: 100%;
    max-width: 340px;
    margin-bottom: 24px;

    @media (max-width: 1600px) {
      max-width: 320px;
      margin-bottom: 20px;
    }

    @media (max-width: 1200px) {
      max-width: 280px;
      margin-bottom: 16px;
    }

    input {
      width: 100%;
      height: 48px;
      border-radius: 24px;
      border: none;
      background: #e5e5e5;
      font-size: 1.1rem;
      color: #333;
      padding: 0 24px;
      outline: none;
      box-sizing: border-box;

      @media (max-width: 1200px) {
        height: 42px;
        font-size: 1rem;
        border-radius: 21px;
      }
    }
  }

  .upload-box {
    width: 100%;
    max-width: 340px;
    height: 200px;
    background: #8883;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32px;
    cursor: pointer;

    @media (max-width: 1600px) {
      max-width: 320px;
      height: 180px;
      margin-bottom: 28px;
    }

    @media (max-width: 1200px) {
      max-width: 280px;
      height: 160px;
      margin-bottom: 24px;
      border-radius: 14px;
    }

    .plus-icon {
      font-size: 3rem;
      color: #fff;

      @media (max-width: 1200px) {
        font-size: 2.5rem;
      }
    }

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 14px;
    }
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 20px;
    width: 100%;
    max-width: 340px;

    @media (max-width: 1600px) {
      max-width: 320px;
    }

    @media (max-width: 1200px) {
      max-width: 280px;
      gap: 15px;
    }

    .cancel-button,
    .confirm-button {
      background-color: white;
      color: black;
      border: none;
      border-radius: 50px;
      padding: 1rem 2rem;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

      @media (max-width: 1600px) {
        padding: 0.9rem 1.8rem;
        font-size: 0.9rem;
      }

      @media (max-width: 1200px) {
        padding: 0.8rem 1.5rem;
        font-size: 0.8rem;
      }
    }

    .cancel-button:hover,
    .confirm-button:hover {
      transform: scale(1.05);
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }
  }

  .go-button {
    background-color: white;
    color: black;
    border: none;
    border-radius: 50px;
    padding: 1.3rem 4.5rem;
    font-size: 1.1rem;
    font-weight: bold;
    margin-top: 1.5rem;
    margin-bottom: 2rem;
    cursor: pointer;
    margin: 1.5rem auto 2rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

    @media (max-width: 1600px) {
      padding: 1.1rem 4rem;
      font-size: 1rem;
    }

    @media (max-width: 1200px) {
      padding: 0.9rem 3.5rem;
      font-size: 0.9rem;
    }
  }

  .go-button:hover {
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
}

/* 响应式调整 */
@media (max-width: 900px) {
  .formBox {
    position: static;
    margin: 30px auto 0 auto;
    left: 0;
    top: 0;
    width: 95vw;
    border-radius: 20px;
    padding-top: 30px;
  }
  .backPic {
    min-height: 200px;
    height: 40vh;
    border-radius: 0;
  }
}

.contentBox {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: url("../assets/pc_bg.png");
  background-size: cover;
  filter: contrast(0.7);
  background-position: center;
  background-repeat: no-repeat;
}

.content {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 100px;

  @media (max-width: 1600px) {
    gap: 40px;
  }

  @media (max-width: 1200px) {
    gap: 60px;
  }

  @media (min-width: 1921px) {
    width: 40%;
  }

  @media (max-width: 1200px) {
    width: 60%;
  }
}

/* 添加高分辨率屏幕适配 */
@media (min-width: 2560px) {
  .head-container {
    height: 120px;
  }

  .head {
    font-size: 1.5rem;
    gap: 180px;
  }

  .changeMode .select-boxes .select-box img {
    width: 130px;
    height: 160px;
  }

  .formBox .input-number {
    max-width: 400px;
  }

  .formBox .input-number input {
    height: 56px;
    font-size: 1.2rem;
  }

  .formBox .upload-box {
    max-width: 400px;
    height: 180px;
  }

  .formBox .go-button {
    padding: 1.5rem 5rem;
    font-size: 1.2rem;
  }

  .content {
    width: 35%;
  }
}
</style>
