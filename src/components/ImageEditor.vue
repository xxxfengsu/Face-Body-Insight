<template>
  <div class="image-editor">
    <div class="header">
      <div class="back" @click="goBack">
        <span>&lt;</span>
      </div>
    </div>

    <div class="image-container" ref="imageContainer">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        ref="imageElement"
        :style="imageStyle"
        @load="initializeEditor"
      />
      <div v-else class="no-image">
        <p>请先上传图片</p>
      </div>
      <div class="grid-overlay" v-if="imageUrl"></div>
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

    <!-- 显示百分比值（可选） -->
    <div class="percentage-display">{{ sliderPercentage }}%</div>

    <!-- <div class="edit-controls">
      <div class="control-row">
        <button @click="rotateLeft"><span>↺</span> 向左旋转</button>
        <button @click="rotateRight"><span>↻</span> 向右旋转</button>
      </div>

      <div class="control-row">
        <div class="slider-container">
          <label>X轴旋转:</label>
          <input
            type="range"
            min="-30"
            max="30"
            v-model.number="rotateX"
            @input="updateImageStyle"
          />
          <span>{{ rotateX }}°</span>
        </div>
      </div>

      <div class="control-row">
        <div class="slider-container">
          <label>Y轴旋转:</label>
          <input
            type="range"
            min="-30"
            max="30"
            v-model.number="rotateY"
            @input="updateImageStyle"
          />
          <span>{{ rotateY }}°</span>
        </div>
      </div>

      <div class="control-row">
        <div class="slider-container">
          <label>缩放:</label>
          <input
            type="range"
            min="50"
            max="200"
            v-model.number="scale"
            @input="updateImageStyle"
          />
          <span>{{ scale }}%</span>
        </div>
      </div>

      <div class="control-buttons">
        <button class="reset-button" @click="resetEdits">重置</button>
        <button class="crop-button" @click="cropImage">裁剪</button>
        <button class="save-button" @click="saveEdits">保存</button>
      </div>
    </div>

    <div class="action-buttons">
      <button class="analyze-button">分析</button>
      <button class="change-button">换装</button>
    </div> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const imageUrl = ref("");
const rotation = ref(0);
const rotateX = ref(0);
const rotateY = ref(0);
const scale = ref(100);
const imageElement = ref(null);
const imageContainer = ref(null);
const rulerContainer = ref(null);

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

// 监视百分比变化并输出到控制台
watch(sliderPercentage, (newValue) => {
  console.log(`滑动百分比: ${newValue}%`);
});

// 如果有通过路由传递的图片URL，则使用它
onMounted(() => {
  if (route.query.imageUrl) {
    imageUrl.value = route.query.imageUrl;
  } else if (localStorage.getItem("editImage")) {
    // 如果本地存储有图片，也可以使用
    imageUrl.value = localStorage.getItem("editImage");
  }

  // 初始化最大偏移量，可以根据容器宽度动态计算
  if (rulerContainer.value) {
    // 根据容器宽度设置最大偏移量
    maxOffset.value = rulerContainer.value.clientWidth / 2;
  }
});

// 计算图片样式
const imageStyle = computed(() => {
  return {
    transform: `
      rotate(${rotation.value}deg) 
      rotateX(${rotateX.value}deg) 
      rotateY(${rotateY.value}deg) 
      scale(${scale.value / 100})
    `,
    transformOrigin: "center center",
    transition: "transform 0.2s ease",
    backfaceVisibility: "visible",
    perspective: "1000px",
  };
});

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
};

// 结束拖动
const endDrag = () => {
  dragging.value = false;
};

// 初始化编辑器
const initializeEditor = () => {
  // 图片加载后可以执行一些初始化逻辑
  console.log("Image loaded, ready for editing");
};

// 向左旋转
const rotateLeft = () => {
  rotation.value = (rotation.value - 90) % 360;
};

// 向右旋转
const rotateRight = () => {
  rotation.value = (rotation.value + 90) % 360;
};

// 更新图片样式
const updateImageStyle = () => {
  // 样式通过computed属性自动更新
};

// 重置编辑
const resetEdits = () => {
  rotation.value = 0;
  rotateX.value = 0;
  rotateY.value = 0;
  scale.value = 100;
  currentOffset.value = 0; // 重置滑动位置
};

// 裁剪图片
const cropImage = () => {
  // 这里可以添加裁剪逻辑
  // 通常需要创建一个canvas并在上面绘制转换后的图像
  console.log("Crop functionality would be implemented here");
  // 简单示例，实际实现需要更复杂的canvas操作
  alert("裁剪功能需要使用Canvas API实现，这是一个示例通知");
};

// 保存编辑
const saveEdits = () => {
  // 这里可以添加保存逻辑，例如创建一个canvas并导出编辑后的图像
  console.log("Saving edited image");

  // 创建canvas来渲染3D变换后的图像
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (imageElement.value) {
    // 注意：这种简单方法无法正确捕获3D旋转效果
    // 完整实现需要使用WebGL或更复杂的canvas变换
    canvas.width = imageElement.value.naturalWidth;
    canvas.height = imageElement.value.naturalHeight;

    // 应用2D变换（仅支持缩放和旋转Z轴）
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation.value * Math.PI) / 180);
    ctx.scale(scale.value / 100, scale.value / 100);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

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

    img {
      max-width: 90%;
      max-height: 90%;
      -webkit-transform-style: preserve-3d;
      transform-style: preserve-3d;
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
    margin-top: 1rem;
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

    /* 固定位置的白色圆点 */
    .center-dot {
      position: absolute;
      left: 50%;
      top: -5px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: white;
      transform: translateX(-50%);
      z-index: 2;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    &:active {
      cursor: grabbing;
    }
  }

  /* 百分比显示 */
  .percentage-display {
    text-align: center;
    color: white;
    font-size: 14px;
    margin-top: -20px;
    margin-bottom: 20px;
    opacity: 0.7;
  }

  .edit-controls {
    padding: 1rem;
    background-color: white;
    border-top: 1px solid #eee;

    .control-row {
      display: flex;
      margin-bottom: 1rem;
      justify-content: space-between;

      button {
        flex: 1;
        margin: 0 0.5rem;
        padding: 0.5rem;
        border: 1px solid #ddd;
        background-color: white;
        border-radius: 5px;
        cursor: pointer;

        &:first-child {
          margin-left: 0;
        }

        &:last-child {
          margin-right: 0;
        }

        &:active {
          background-color: #f5f5f5;
        }
      }

      .slider-container {
        display: flex;
        align-items: center;
        width: 100%;

        label {
          width: 70px;
          flex-shrink: 0;
        }

        input[type="range"] {
          flex: 1;
          margin: 0 0.5rem;
        }

        span {
          width: 40px;
          text-align: right;
        }
      }
    }

    .control-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;

      button {
        flex: 1;
        margin: 0 0.5rem;
        padding: 0.7rem 0;
        border: none;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        cursor: pointer;

        &:first-child {
          margin-left: 0;
        }

        &:last-child {
          margin-right: 0;
        }
      }

      .reset-button {
        background-color: #999;
      }

      .crop-button {
        background-color: #666;
      }

      .save-button {
        background-color: #333;
      }
    }
  }

  .action-buttons {
    display: flex;
    padding: 1rem;

    button {
      flex: 1;
      margin: 0 0.5rem;
      padding: 0.8rem 0;
      border: none;
      border-radius: 25px;
      font-weight: bold;
      cursor: pointer;

      &:first-child {
        margin-left: 0;
        background-color: white;
        border: 1px solid #ddd;
        color: #333;
      }

      &:last-child {
        margin-right: 0;
        background-color: #333;
        color: white;
      }
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
