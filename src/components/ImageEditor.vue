<template>
  <div class="image-editor">
    <div class="header">
      <div class="back" @click="goBack">
        <span>&lt;</span>
      </div>
    </div>

    <div class="image-container" ref="imageContainer">
      <!-- 图片区域 -->
      <div
        v-if="imageUrl"
        class="image-wrapper"
        @wheel="handleZoom"
        @mousedown="startPan"
        @touchstart="startPan"
        @mousemove="pan"
        @touchmove="pan"
        @mouseup="endPan"
        @touchend="endPan"
        @mouseleave="endPan"
      >
        <img
          :src="imageUrl"
          ref="imageElement"
          :style="imageStyle"
          @load="initializeEditor"
        />
        <!-- 裁剪框 -->
        <div
          v-if="cropMode"
          class="crop-box"
          :style="cropBoxStyle"
          ref="cropBox"
        >
          <!-- 裁剪框角落控制点 -->
          <div
            class="crop-handle top-left"
            @mousedown="startResize($event, 'topLeft')"
            @touchstart="startResize($event, 'topLeft')"
          ></div>
          <div
            class="crop-handle top-right"
            @mousedown="startResize($event, 'topRight')"
            @touchstart="startResize($event, 'topRight')"
          ></div>
          <div
            class="crop-handle bottom-left"
            @mousedown="startResize($event, 'bottomLeft')"
            @touchstart="startResize($event, 'bottomLeft')"
          ></div>
          <div
            class="crop-handle bottom-right"
            @mousedown="startResize($event, 'bottomRight')"
            @touchstart="startResize($event, 'bottomRight')"
          ></div>
        </div>
      </div>
      <div v-else class="no-image">
        <p>请先上传图片</p>
      </div>
      <div class="grid-overlay" v-if="imageUrl && !cropMode"></div>
    </div>

    <!-- 可滑动的刻度尺 -->
    <div
      class="ruler-container"
      ref="rulerContainer"
      @touchstart="startDrag"
      @touchmove="drag"
      @touchend="endDrag"
      @mousedown="startDrag"
      @mousemove="drag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
    >
      <div class="ruler-marks" :style="marksStyle">
        <!-- 白色刻度线 -->
        <div class="mark" v-for="i in 41" :key="i"></div>
        <!-- 中间特殊黄色刻度线 -->
        <div class="center-mark"></div>
      </div>
    </div>

    <div class="iconBar">
      <div
        class="cutOut_icon"
        :class="{ active: cropMode }"
        @click="toggleCropMode"
      ></div>
      <div class="rotate_icon" @click="rotateRight"></div>
      <div
        class="xR_icon"
        :class="{ active: xRotationMode }"
        @click="toggleXrotationMode"
      ></div>
      <div
        class="yRicon"
        :class="{ active: yRotationMode }"
        @click="toggleYrotationMode"
      ></div>
    </div>

    <div class="btnBar">
      <div class="btn" @click="resetEdits">重置</div>
      <div class="btn" v-if="cropMode" @click="applyCrop">确认裁剪</div>
      <div class="btn" v-else @click="saveEdits">保存</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const imageUrl = ref("");
const originalImageUrl = ref("");
const rotation = ref(0);
const rotateX = ref(0);
const rotateY = ref(0);
const scale = ref(100);
const imageElement = ref(null);
const imageContainer = ref(null);
const rulerContainer = ref(null);
const cropBox = ref(null);

// 新增 - 裁剪模式标志
const cropMode = ref(false);
const xRotationMode = ref(false);
const yRotationMode = ref(false);

// 图片拖拽相关
const isPanning = ref(false);
const panStartX = ref(0);
const panStartY = ref(0);
const translateX = ref(0);
const translateY = ref(0);
const initialTranslateX = ref(0);
const initialTranslateY = ref(0);

// 裁剪框相关
const cropBoxLeft = ref(100);
const cropBoxTop = ref(100);
const cropBoxWidth = ref(200);
const cropBoxHeight = ref(200);
const isResizing = ref(false);
const resizeCorner = ref("");
const resizeStartX = ref(0);
const resizeStartY = ref(0);
const initialCropValues = ref({});

// 滑动相关状态
const dragging = ref(false);
const startX = ref(0);
const currentOffset = ref(0);
const initialOffset = ref(0);
const maxOffset = ref(300); // 最大滑动范围

// 计算ruler-marks的样式
const marksStyle = computed(() => {
  return {
    transform: `translateX(${currentOffset.value}px)`,
    transition: dragging.value ? "none" : "transform 0.3s ease",
  };
});

// 计算滑动百分比值
const sliderPercentage = computed(() => {
  // 将偏移值转换为百分比，范围从-maxOffset到+maxOffset
  const percentage = Math.round((currentOffset.value / maxOffset.value) * 100);

  // 限制在-100到100之间
  return Math.max(Math.min(percentage, 100), -100);
});

// 监视滑动百分比变化
watch(sliderPercentage, (newValue) => {
  console.log(`滑动百分比: ${newValue}%`);
  // 在X旋转模式下，调整X轴旋转
  if (xRotationMode.value) {
    rotateX.value = newValue * 0.3; // 将百分比转换为适当的角度
  }
  // 在Y旋转模式下，调整Y轴旋转
  else if (yRotationMode.value) {
    rotateY.value = newValue * 0.3; // 将百分比转换为适当的角度
  }
  // 在普通模式下，调整缩放
  else if (!cropMode.value) {
    // 将百分比转换为缩放值，范围从50%到200%
    scale.value = 100 + newValue;
    scale.value = Math.max(Math.min(scale.value, 200), 50);
  }
});

// 裁剪框样式
const cropBoxStyle = computed(() => {
  return {
    left: `${cropBoxLeft.value}px`,
    top: `${cropBoxTop.value}px`,
    width: `${cropBoxWidth.value}px`,
    height: `${cropBoxHeight.value}px`,
  };
});

// 如果有通过路由传递的图片URL，则使用它
onMounted(() => {
  if (route.query.imageUrl) {
    imageUrl.value = route.query.imageUrl;
    originalImageUrl.value = route.query.imageUrl; // 保存原始图片URL
  } else if (localStorage.getItem("editImage")) {
    // 如果本地存储有图片，也可以使用
    imageUrl.value = localStorage.getItem("editImage");
    originalImageUrl.value = localStorage.getItem("editImage"); // 保存原始图片URL
  }

  // 初始化最大偏移量，可以根据容器宽度动态计算
  if (rulerContainer.value) {
    // 根据容器宽度设置最大偏移量
    maxOffset.value = rulerContainer.value.clientWidth / 2;
  }

  // 添加键盘事件监听
  window.addEventListener("keydown", handleKeyDown);
});

// 计算图片样式
const imageStyle = computed(() => {
  return {
    transform: `
      translate(${translateX.value}px, ${translateY.value}px)
      rotate(${rotation.value}deg) 
      rotateX(${rotateX.value}deg) 
      rotateY(${rotateY.value}deg) 
      scale(${scale.value / 100})
    `,
    transformOrigin: "center center",
    transition:
      isPanning.value || isResizing.value ? "none" : "transform 0.2s ease",
    backfaceVisibility: "visible",
    perspective: "1000px",
  };
});

// 切换裁剪模式
const toggleCropMode = () => {
  cropMode.value = !cropMode.value;

  if (cropMode.value) {
    // 进入裁剪模式时，初始化裁剪框的位置和大小
    if (imageElement.value && imageContainer.value) {
      const container = imageContainer.value.getBoundingClientRect();
      const img = imageElement.value.getBoundingClientRect();

      // 默认裁剪框大小为图片的80%
      cropBoxWidth.value = img.width * 0.8;
      cropBoxHeight.value = img.height * 0.8;

      // 将裁剪框居中
      cropBoxLeft.value = (container.width - cropBoxWidth.value) / 2;
      cropBoxTop.value = (container.height - cropBoxHeight.value) / 2;
    }
  }
};

// 切换X轴旋转模式
const toggleXrotationMode = () => {
  xRotationMode.value = !xRotationMode.value;
  if (xRotationMode.value) {
    yRotationMode.value = false; // 关闭Y轴旋转模式
    currentOffset.value = rotateX.value / 0.3; // 设置滑块位置与当前旋转角度匹配
  }
};

// 切换Y轴旋转模式
const toggleYrotationMode = () => {
  yRotationMode.value = !yRotationMode.value;
  if (yRotationMode.value) {
    xRotationMode.value = false; // 关闭X轴旋转模式
    currentOffset.value = rotateY.value / 0.3; // 设置滑块位置与当前旋转角度匹配
  }
};

// 处理键盘事件
const handleKeyDown = (event) => {
  if (cropMode.value) {
    const step = event.shiftKey ? 10 : 1;
    switch (event.key) {
      case "ArrowLeft":
        cropBoxLeft.value -= step;
        event.preventDefault();
        break;
      case "ArrowRight":
        cropBoxLeft.value += step;
        event.preventDefault();
        break;
      case "ArrowUp":
        cropBoxTop.value -= step;
        event.preventDefault();
        break;
      case "ArrowDown":
        cropBoxTop.value += step;
        event.preventDefault();
        break;
    }
  }
};

// 开始裁剪框调整大小
const startResize = (event, corner) => {
  event.stopPropagation();
  event.preventDefault();

  isResizing.value = true;
  resizeCorner.value = corner;

  // 记录初始位置
  resizeStartX.value = event.type.includes("mouse")
    ? event.clientX
    : event.touches[0].clientX;
  resizeStartY.value = event.type.includes("mouse")
    ? event.clientY
    : event.touches[0].clientY;

  // 保存初始裁剪框值
  initialCropValues.value = {
    left: cropBoxLeft.value,
    top: cropBoxTop.value,
    width: cropBoxWidth.value,
    height: cropBoxHeight.value,
  };

  // 添加事件监听器
  document.addEventListener("mousemove", handleResize);
  document.addEventListener("touchmove", handleResize);
  document.addEventListener("mouseup", endResize);
  document.addEventListener("touchend", endResize);
};

// 处理裁剪框调整大小
const handleResize = (event) => {
  if (!isResizing.value) return;

  const currentX = event.type.includes("mouse")
    ? event.clientX
    : event.touches[0].clientX;
  const currentY = event.type.includes("mouse")
    ? event.clientY
    : event.touches[0].clientY;

  const deltaX = currentX - resizeStartX.value;
  const deltaY = currentY - resizeStartY.value;

  const initial = initialCropValues.value;

  // 根据不同角落进行调整
  switch (resizeCorner.value) {
    case "topLeft":
      cropBoxLeft.value = initial.left + deltaX;
      cropBoxTop.value = initial.top + deltaY;
      cropBoxWidth.value = initial.width - deltaX;
      cropBoxHeight.value = initial.height - deltaY;
      break;
    case "topRight":
      cropBoxTop.value = initial.top + deltaY;
      cropBoxWidth.value = initial.width + deltaX;
      cropBoxHeight.value = initial.height - deltaY;
      break;
    case "bottomLeft":
      cropBoxLeft.value = initial.left + deltaX;
      cropBoxWidth.value = initial.width - deltaX;
      cropBoxHeight.value = initial.height + deltaY;
      break;
    case "bottomRight":
      cropBoxWidth.value = initial.width + deltaX;
      cropBoxHeight.value = initial.height + deltaY;
      break;
  }

  // 确保宽高不为负
  if (cropBoxWidth.value < 20) cropBoxWidth.value = 20;
  if (cropBoxHeight.value < 20) cropBoxHeight.value = 20;

  event.preventDefault();
};

// 结束裁剪框调整大小
const endResize = () => {
  isResizing.value = false;

  // 移除事件监听器
  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("touchmove", handleResize);
  document.removeEventListener("mouseup", endResize);
  document.removeEventListener("touchend", endResize);
};

// 处理滚轮缩放
const handleZoom = (event) => {
  if (cropMode.value) return; // 裁剪模式下禁用滚轮缩放

  event.preventDefault();

  // 根据滚轮方向调整缩放
  const delta = event.deltaY || event.detail || event.wheelDelta;

  if (delta > 0) {
    // 缩小
    scale.value = Math.max(scale.value - 5, 50);
  } else {
    // 放大
    scale.value = Math.min(scale.value + 5, 200);
  }
};

// 开始图片平移
const startPan = (event) => {
  if (cropMode.value || isResizing.value) return; // 裁剪模式或调整大小时禁用平移

  isPanning.value = true;

  // 记录初始触摸/鼠标位置
  panStartX.value = event.type.includes("mouse")
    ? event.clientX
    : event.touches[0].clientX;
  panStartY.value = event.type.includes("mouse")
    ? event.clientY
    : event.touches[0].clientY;

  initialTranslateX.value = translateX.value;
  initialTranslateY.value = translateY.value;

  if (event.type.includes("mouse")) {
    event.preventDefault();
  }
};

// 图片平移
const pan = (event) => {
  if (!isPanning.value) return;

  // 获取当前触摸/鼠标位置
  const currentX = event.type.includes("mouse")
    ? event.clientX
    : event.touches[0].clientX;
  const currentY = event.type.includes("mouse")
    ? event.clientY
    : event.touches[0].clientY;

  // 计算移动距离
  const deltaX = currentX - panStartX.value;
  const deltaY = currentY - panStartY.value;

  translateX.value = initialTranslateX.value + deltaX;
  translateY.value = initialTranslateY.value + deltaY;

  if (event.type.includes("mouse")) {
    event.preventDefault();
  }
};

// 结束图片平移
const endPan = () => {
  isPanning.value = false;
};

// 开始拖动
const startDrag = (event) => {
  dragging.value = true;
  // 记录初始触摸/鼠标位置
  startX.value = event.type.includes("mouse")
    ? event.clientX
    : event.touches[0].clientX;
  initialOffset.value = currentOffset.value;

  // 防止事件冒泡和默认行为
  if (event.type.includes("mouse")) {
    event.preventDefault();
  }
  event.preventDefault();
};

// 拖动过程
const drag = (event) => {
  if (!dragging.value) return;

  // 获取当前触摸/鼠标位置
  const currentX = event.type.includes("mouse")
    ? event.clientX
    : event.touches[0].clientX;
  // 计算移动距离
  const deltaX = currentX - startX.value;

  // 左滑动时，黄线向右移动（正向移动）；右滑动时，黄线向左移动（负向移动）
  currentOffset.value = initialOffset.value - deltaX;

  // 限制滑动范围
  currentOffset.value = Math.max(
    Math.min(currentOffset.value, maxOffset.value),
    -maxOffset.value
  );

  // 防止事件冒泡和默认行为
  if (event.type.includes("mouse")) {
    event.preventDefault();
  }
  event.preventDefault();
};

// 结束拖动
const endDrag = () => {
  dragging.value = false;
};

// 应用裁剪
const applyCrop = () => {
  if (!cropMode.value || !imageElement.value) return;

  // 创建canvas来实现裁剪
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // 确保获取原始图像尺寸
  const img = imageElement.value;

  // 获取图像、裁剪框以及容器的位置和尺寸信息
  const imgRect = img.getBoundingClientRect();
  const cropRect = cropBox.value.getBoundingClientRect();
  const containerRect = imageContainer.value.getBoundingClientRect();

  // 计算缩放和旋转后的图像在容器中的位置
  const imgScaleFactor = img.naturalWidth / imgRect.width;

  // 计算裁剪框相对于图像的位置
  const cropLeft =
    (cropRect.left - containerRect.left - (imgRect.left - containerRect.left)) *
    imgScaleFactor;
  const cropTop =
    (cropRect.top - containerRect.top - (imgRect.top - containerRect.top)) *
    imgScaleFactor;
  const cropWidth = cropRect.width * imgScaleFactor;
  const cropHeight = cropRect.height * imgScaleFactor;

  // 设置canvas尺寸为裁剪区域大小
  canvas.width = cropWidth;
  canvas.height = cropHeight;

  // 注意：这种简单方法无法完全处理复杂的3D变换
  // 更完整的实现需要考虑旋转和3D变换
  ctx.drawImage(
    img,
    cropLeft,
    cropTop,
    cropWidth,
    cropHeight, // 源图像裁剪区域
    0,
    0,
    cropWidth,
    cropHeight // 目标canvas区域
  );

  // 将canvas转为图像数据URL
  const croppedImageUrl = canvas.toDataURL("image/jpeg");

  // 更新图片URL并退出裁剪模式
  imageUrl.value = croppedImageUrl;
  cropMode.value = false;

  // 重置变换
  resetTransformations();
};

// 重置变换参数
const resetTransformations = () => {
  rotation.value = 0;
  rotateX.value = 0;
  rotateY.value = 0;
  scale.value = 100;
  translateX.value = 0;
  translateY.value = 0;
  currentOffset.value = 0;
};

// 初始化编辑器
const initializeEditor = () => {
  // 图片加载后可以执行一些初始化逻辑
  console.log("Image loaded, ready for editing");
};

// 向右旋转
const rotateRight = () => {
  rotation.value = (rotation.value + 90) % 360;
};

// 重置编辑
const resetEdits = () => {
  // 恢复原始图片
  imageUrl.value = originalImageUrl.value;

  // 重置变换参数
  resetTransformations();

  if (cropMode.value) {
    // 退出裁剪模式
    cropMode.value = false;
  }
};

// 保存编辑
const saveEdits = () => {
  // 创建canvas来渲染变换后的图像
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (imageElement.value) {
    // 设置canvas尺寸
    canvas.width = imageElement.value.naturalWidth;
    canvas.height = imageElement.value.naturalHeight;

    // 应用变换
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation.value * Math.PI) / 180);
    ctx.scale(scale.value / 100, scale.value / 100);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // 绘制图像
    ctx.drawImage(imageElement.value, 0, 0);

    // 将canvas转为图像数据
    const processedImageUrl = canvas.toDataURL("image/jpeg");
    localStorage.setItem("lastEditedImage", processedImageUrl);
  } else {
    localStorage.setItem("lastEditedImage", imageUrl.value);
  }

  // 返回主页
  router.push("/main");
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};
</script>

<style lang="less" scoped>
.image-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: black;

  .header {
    padding: 20px 0;
    height: 30px;

    .back {
      position: absolute;
      left: 20px;
      top: 20px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }

  .image-container {
    /* flex: 1; */
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    background-color: rgba(255, 255, 255, 0.3);
    height: 65%;
    width: 80%;
    margin: 0 auto;
    perspective: 1000px; /* 为3D旋转添加透视效果 */
    border-radius: 1rem;

    .image-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      cursor: move; /* 指示可拖动 */

      img {
        max-width: 90%;
        max-height: 90%;
        -webkit-transform-style: preserve-3d;
        transform-style: preserve-3d;
      }

      // 裁剪框样式
      .crop-box {
        position: absolute;
        border: 2px dashed rgba(255, 255, 255, 0.8);
        box-sizing: border-box;
        pointer-events: none; // 让内部区域可以点击穿透

        // 裁剪框控制点
        .crop-handle {
          position: absolute;
          width: 20px;
          height: 20px;
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          pointer-events: auto; // 使控制点可点击
          cursor: pointer;

          &.top-left {
            top: -10px;
            left: -10px;
            cursor: nw-resize;
          }

          &.top-right {
            top: -10px;
            right: -10px;
            cursor: ne-resize;
          }

          &.bottom-left {
            bottom: -10px;
            left: -10px;
            cursor: sw-resize;
          }

          &.bottom-right {
            bottom: -10px;
            right: -10px;
            cursor: se-resize;
          }
        }
      }
    }

    .no-image {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      color: #999;
    }

    .grid-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: linear-gradient(
          to right,
          rgba(255, 165, 0, 0.2) 1px,
          transparent 1px
        ),
        linear-gradient(to bottom, rgba(255, 165, 0, 0.2) 1px, transparent 1px);
      background-size: 25% 25%;
      pointer-events: none;
    }
  }

  /* 可滑动的尺子容器样式 */
  .ruler-container {
    width: 90%;
    margin: 1rem auto 0;
    position: relative;
    height: 50px;
    overflow: hidden;
    touch-action: pan-x; /* 启用水平滑动 */
    cursor: grab;

    /* 刻度标记容器 */
    .ruler-marks {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      position: absolute;
      left: 0;
      right: 0;
      width: 100%;
      height: 30px;

      /* 白色刻度线布局 */
      .mark {
        flex: none;
        width: 1px;
        height: 20px;
        background-color: white;
        margin: 0 10px; /* 刻度间距 */

        &:nth-child(5n + 1) {
          height: 30px;
        }
      }

      /* 中间黄色刻度线 */
      .center-mark {
        position: absolute;
        left: 50%;
        top: 0;
        width: 2px;
        height: 30px;
        background-color: #ffd700; /* 黄色 */
        transform: translateX(-50%);
        z-index: 1;
      }
    }

    &:active {
      cursor: grabbing;
    }
  }

  .btnBar {
    width: 100%;
    height: 2rem;
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 1rem;

    .btn {
      padding: 12px 34px;
      display: flex;
      align-items: center;
      color: white;
      border: 1px solid #fff;
      border-radius: 1rem;
      cursor: pointer;

      &:active {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  }

  .iconBar {
    width: 100%;
    height: 2rem;
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 1rem;
    div {
      width: 20px;
      height: 20px;
      background-size: cover;
      cursor: pointer;
      position: relative;

      &.active {
        border: 2px solid #ffd700;
        border-radius: 4px;
      }

      &.active.xR_icon,
      &.active.yRicon {
        border: none;
        &:after {
          content: "";
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #ffd700;
        }
      }
    }
    .cutOut_icon {
      background-image: url(../assets/icon/cutOut_icon.png);
    }
    .rotate_icon {
      background-image: url(../assets/icon/rotate_icon.png);
    }
    .xR_icon {
      background-image: url(../assets/icon/xR_icon.png);
    }
    .yRicon {
      background-image: url(../assets/icon/yRicon.png);
    }
  }
}

// 媒体查询适配不同设备
@media (max-width: 500px) {
  .image-editor {
    .ruler-container {
      width: 95%;
    }
  }
}

// 针对特别小的屏幕
@media (max-height: 600px) {
  .image-editor {
    .edit-controls {
      padding: 0.5rem;

      .control-row {
        margin-bottom: 0.5rem;
      }
    }

    .action-buttons {
      padding: 0.5rem 1rem;
    }
  }
}
</style>
