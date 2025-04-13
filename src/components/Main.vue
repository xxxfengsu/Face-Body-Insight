<template>
  <div class="main">
    <div class="backPic">
      <div class="head">
        <div
          @click="changeRoute(1)"
          :class="activeRoute == 1 ? 'activeRoute' : ''"
        >
          Uploading
        </div>
        <div
          @click="changeRoute(2)"
          :class="activeRoute == 2 ? 'activeRoute' : ''"
        >
          Report
        </div>
        <div
          @click="changeRoute(3)"
          :class="activeRoute == 3 ? 'activeRoute' : ''"
        >
          History
        </div>
      </div>
      <div class="changeMode">
        <div class="select-boxes">
          <div
            class="select-box"
            :class="{ active: selectedBox === 0 }"
            @click="selectBox(0)"
          >
            <img src="../assets/logo.png" alt="Face close-up" />
          </div>
          <div
            class="select-box"
            :class="{ active: selectedBox === 1 }"
            @click="selectBox(1)"
          >
            <img src="../assets/logo.png" alt="Face portrait" />
          </div>
          <div
            class="select-box"
            :class="{ active: selectedBox === 2 }"
            @click="selectBox(2)"
          >
            <img src="../assets/logo.png" alt="Full body" />
          </div>
        </div>
      </div>
    </div>
    <div class="formBox">
      <div class="input-number">
        <input type="text" placeholder="type some infomation" />
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

      <button class="go-button" @click="handleSubmit">GO</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

let activeRoute = ref(1);
let selectedBox = ref(1); // Default middle box selected
const fileInput = ref(null);

// 适配移动设备视口高度
onMounted(() => {
  // 设置视口高度变量
  const setVh = () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  // 初始设置
  setVh();

  // 处理窗口大小变化
  window.addEventListener("resize", setVh);

  // iOS Safari需要额外延迟设置高度
  setTimeout(setVh, 100);
});

const changeRoute = (index) => {
  activeRoute.value = index;
};

const selectBox = (index) => {
  selectedBox.value = index;
};

const triggerFileUpload = () => {
  fileInput.value.click();
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Handle file upload logic here
    console.log("File selected:", file.name);
  }
};

const handleSubmit = () => {
  // Handle form submission
  console.log("Form submitted");
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

    .head {
      display: flex;
      justify-content: space-around;
      color: #fff;
      padding-top: 1.5rem;
      margin-bottom: 1rem;
      .activeRoute {
        text-decoration: underline;
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
          width: 45px;
          height: 45px;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid white;
          background-color: #333;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;

          &.active {
            width: 65px;
            height: 65px;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          &:before {
            content: "";
            position: absolute;
            left: -15px;
            top: 50%;
            width: 15px;
            height: 2px;
            background-color: rgba(255, 165, 0, 0.7);
          }
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
    box-shadow: 0px -5px 15px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    margin-top: -30px;
    box-sizing: border-box;
    flex: 1 0 auto; /* 允许伸长但不收缩，确保填满剩余空间 */

    .input-number {
      width: 90%;
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
        text-align: center;
        box-sizing: border-box;

        &::placeholder {
          color: #aaa;
        }
      }
    }

    .upload-box {
      width: 90%;
      max-width: 400px;
      height: 100px;
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
        font-size: 30px;
        color: #999;
        font-weight: lighter;
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
      padding: 15px 20px; /* 修改内边距 */
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
