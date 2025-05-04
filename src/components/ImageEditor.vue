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
        @touchstart.prevent="startPan"
        @mousemove="pan"
        @touchmove.prevent="pan"
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
import { reportApi } from "@/api";

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

// 添加保存变换状态用的变量
const savedTransformations = ref({
  rotation: 0,
  rotateX: 0,
  rotateY: 0,
  scale: 100,
  translateX: 0,
  translateY: 0,
});

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

// 修改切换裁剪模式函数
const toggleCropMode = () => {
  cropMode.value = !cropMode.value;

  if (cropMode.value) {
    // 进入裁剪模式时，保存当前变换状态
    savedTransformations.value = {
      rotation: rotation.value,
      rotateX: rotateX.value,
      rotateY: rotateY.value,
      scale: scale.value,
      translateX: translateX.value,
      translateY: translateY.value,
    };

    // 重置变换，回到未旋转状态，便于裁剪
    rotation.value = 0;
    rotateX.value = 0;
    rotateY.value = 0;
    scale.value = 100;
    translateX.value = 0;
    translateY.value = 0;

    // 初始化裁剪框的位置和大小
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
  } else {
    // 退出裁剪模式时，恢复之前的变换状态
    rotation.value = savedTransformations.value.rotation;
    rotateX.value = savedTransformations.value.rotateX;
    rotateY.value = savedTransformations.value.rotateY;
    scale.value = savedTransformations.value.scale;
    translateX.value = savedTransformations.value.translateX;
    translateY.value = savedTransformations.value.translateY;
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
    const imgRect = imageElement.value.getBoundingClientRect();
    const containerRect = imageContainer.value.getBoundingClientRect();

    // 图片在容器中的相对位置
    const imgLeft = imgRect.left - containerRect.left;
    const imgTop = imgRect.top - containerRect.top;
    const imgRight = imgLeft + imgRect.width;
    const imgBottom = imgTop + imgRect.height;

    let newLeft = cropBoxLeft.value;
    let newTop = cropBoxTop.value;

    switch (event.key) {
      case "ArrowLeft":
        newLeft = cropBoxLeft.value - step;
        break;
      case "ArrowRight":
        newLeft = cropBoxLeft.value + step;
        break;
      case "ArrowUp":
        newTop = cropBoxTop.value - step;
        break;
      case "ArrowDown":
        newTop = cropBoxTop.value + step;
        break;
    }

    // 确保裁剪框在图片边界内
    newLeft = Math.max(
      imgLeft,
      Math.min(newLeft, imgRight - cropBoxWidth.value)
    );
    newTop = Math.max(
      imgTop,
      Math.min(newTop, imgBottom - cropBoxHeight.value)
    );

    cropBoxLeft.value = newLeft;
    cropBoxTop.value = newTop;

    event.preventDefault();
  }
};

// 开始裁剪框调整大小
const startResize = (event, corner) => {
  // 停止事件传播和默认行为
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
  document.addEventListener("mousemove", handleResize, { passive: false });
  document.addEventListener("touchmove", handleResize, { passive: false });
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

  // 获取图片边界
  const imgRect = imageElement.value.getBoundingClientRect();
  const containerRect = imageContainer.value.getBoundingClientRect();

  // 图片在容器中的相对位置
  const imgLeft = imgRect.left - containerRect.left;
  const imgTop = imgRect.top - containerRect.top;
  const imgRight = imgLeft + imgRect.width;
  const imgBottom = imgTop + imgRect.height;

  // 临时存储计算后的值，稍后会应用边界限制
  let newLeft = initial.left;
  let newTop = initial.top;
  let newWidth = initial.width;
  let newHeight = initial.height;

  // 根据不同角落进行调整
  switch (resizeCorner.value) {
    case "topLeft":
      newLeft = initial.left + deltaX;
      newTop = initial.top + deltaY;
      newWidth = initial.width - deltaX;
      newHeight = initial.height - deltaY;
      break;
    case "topRight":
      newTop = initial.top + deltaY;
      newWidth = initial.width + deltaX;
      newHeight = initial.height - deltaY;
      break;
    case "bottomLeft":
      newLeft = initial.left + deltaX;
      newWidth = initial.width - deltaX;
      newHeight = initial.height + deltaY;
      break;
    case "bottomRight":
      newWidth = initial.width + deltaX;
      newHeight = initial.height + deltaY;
      break;
  }

  // 应用边界限制
  // 确保裁剪框不会超出图片边界
  newLeft = Math.max(imgLeft, Math.min(newLeft, imgRight - 20));
  newTop = Math.max(imgTop, Math.min(newTop, imgBottom - 20));

  // 确保裁剪框的右边界不超出图片
  if (newLeft + newWidth > imgRight) {
    newWidth = imgRight - newLeft;
  }

  // 确保裁剪框的下边界不超出图片
  if (newTop + newHeight > imgBottom) {
    newHeight = imgBottom - newTop;
  }

  // 确保宽高不小于最小值
  newWidth = Math.max(newWidth, 20);
  newHeight = Math.max(newHeight, 20);

  // 应用计算后的值
  cropBoxLeft.value = newLeft;
  cropBoxTop.value = newTop;
  cropBoxWidth.value = newWidth;
  cropBoxHeight.value = newHeight;

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

  // 阻止默认行为 - 不管是鼠标还是触摸事件
  event.preventDefault();
  event.stopPropagation();
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

  // 阻止默认行为 - 不管是鼠标还是触摸事件
  event.preventDefault();
  event.stopPropagation();
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

  // 创建两个canvas - 一个用于应用变换，一个用于裁剪
  const transformCanvas = document.createElement("canvas");
  const cropCanvas = document.createElement("canvas");
  const transformCtx = transformCanvas.getContext("2d");
  const cropCtx = cropCanvas.getContext("2d");

  const img = imageElement.value;

  // 首先，在第一个canvas上应用所有变换（旋转、缩放等）
  transformCanvas.width = img.naturalWidth;
  transformCanvas.height = img.naturalHeight;

  // 应用变换 - 注意：与saveEdits函数中的变换保持一致
  transformCtx.translate(transformCanvas.width / 2, transformCanvas.height / 2);
  transformCtx.rotate((rotation.value * Math.PI) / 180);
  transformCtx.scale(scale.value / 100, scale.value / 100);
  transformCtx.translate(
    -transformCanvas.width / 2,
    -transformCanvas.height / 2
  );

  // 绘制原始图像到变换canvas上
  transformCtx.drawImage(img, 0, 0);

  // 获取图像、裁剪框以及容器的位置和尺寸信息
  const imgRect = img.getBoundingClientRect();
  const cropRect = cropBox.value.getBoundingClientRect();
  const containerRect = imageContainer.value.getBoundingClientRect();

  // 计算裁剪框在原始图像上的位置和大小
  // 由于已经应用了变换，这需要考虑当前的缩放和位置
  const scaleRatio = img.naturalWidth / (imgRect.width * (scale.value / 100));

  // 计算裁剪框相对于原图的位置，考虑平移和缩放
  // 需要计算变换后图像中心相对于容器中心的偏移
  const containerCenterX = containerRect.width / 2;
  const containerCenterY = containerRect.height / 2;

  // 裁剪框相对于容器中心的位置
  const cropRelativeX =
    cropRect.left + cropRect.width / 2 - containerRect.left - containerCenterX;
  const cropRelativeY =
    cropRect.top + cropRect.height / 2 - containerRect.top - containerCenterY;

  // 考虑旋转后的图像中心
  const transformedCenterX = transformCanvas.width / 2;
  const transformedCenterY = transformCanvas.height / 2;

  // 计算裁剪区域在变换后图像上的位置
  const cropX = transformedCenterX + cropRelativeX * scaleRatio;
  const cropY = transformedCenterY + cropRelativeY * scaleRatio;

  // 裁剪区域的宽高
  const cropWidth = cropRect.width * scaleRatio;
  const cropHeight = cropRect.height * scaleRatio;

  // 设置裁剪canvas的尺寸
  cropCanvas.width = cropWidth;
  cropCanvas.height = cropHeight;

  // 从变换后的图像中裁剪指定区域
  cropCtx.drawImage(
    transformCanvas,
    cropX - cropWidth / 2, // 左上角X坐标
    cropY - cropHeight / 2, // 左上角Y坐标
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  // 将裁剪后的图像转为URL
  const croppedImageUrl = cropCanvas.toDataURL("image/jpeg");

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
  if (xRotationMode.value) {
    xRotationMode.value = false;
  }
  if (yRotationMode.value) {
    yRotationMode.value = false;
  }
};

// 保存编辑
const saveEdits = async () => {
  try {
    // 创建canvas来渲染变换后的图像
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let processedImageUrl;

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
      processedImageUrl = canvas.toDataURL("image/jpeg");
      localStorage.setItem("lastEditedImage", processedImageUrl);
    } else {
      processedImageUrl = imageUrl.value;
      localStorage.setItem("lastEditedImage", imageUrl.value);
    }

    // 将base64数据转换为Blob
    const base64Response = await fetch(processedImageUrl);
    const blob = await base64Response.blob();

    // 创建文件对象
    const file = new File([blob], "edited_image.jpg", { type: "image/jpeg" });

    // 创建FormData对象
    const formData = new FormData();
    formData.append("file", file);
    formData.append("classId", "1");
    formData.append("force", "false");

    console.log("准备上传文件:", file.name, file.size);

    // 调用API上传文件
    const res = await reportApi.getReport(formData);

    console.log("上传结果:", res);

    // 上传成功后跳转，并传递结果数据
    router.push({
      path: "/report",
      query: { reportData: JSON.stringify(res.data) },
    });
  } catch (error) {
    console.error("保存或上传过程中出错:", error);
    alert("图片保存失败，请重试");
  }
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
    height: 55%;
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
