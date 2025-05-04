<template>
  <div class="report">
    <div class="header">
      <div class="back" @click="goBack">
        <span>&lt;</span>
      </div>
    </div>
    <div class="navigation">
      <div @click="changeRoute(1)">Uploading</div>
      <div @click="changeRoute(2)" class="active">Report</div>
      <div @click="changeRoute(3)">History</div>
    </div>
    <div class="report-content">
      <!-- 内容区域可滑动 -->
      <div
        class="face-analysis"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- 滑动容器 -->
        <div
          class="analysis-slider"
          :style="{ transform: `translateX(-${currentSlideIndex * 50}%)` }"
        >
          <!-- 第一个分析：五官量感 -->
          <div class="analysis-slide">
            <h2>五官量感</h2>
            <div class="metrics">
              <div class="metric-item">
                <div class="label">眼睛</div>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 85%"></div>
                  </div>
                  <div class="score">85</div>
                </div>
              </div>
              <div class="metric-item">
                <div class="label">鼻子</div>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 91%"></div>
                  </div>
                  <div class="score">91</div>
                </div>
              </div>
              <div class="metric-item">
                <div class="label">嘴巴</div>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 88%"></div>
                  </div>
                  <div class="score">88</div>
                </div>
              </div>
              <div class="metric-item">
                <div class="label">脸型</div>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 89%"></div>
                  </div>
                  <div class="score">89</div>
                </div>
              </div>
              <div class="metric-item">
                <div class="label">协调性</div>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 87%"></div>
                  </div>
                  <div class="score">87</div>
                </div>
              </div>
            </div>
            <div class="analysis-text">
              <p>五官量感大（如眼睛大、鼻梁高、嘴唇厚、骨骼立体）</p>
              <p>容易给人明艳大气的印象，但妆容不当也可能显得"不重"</p>
              <p>或"粗糙"。合适的妆容应**平衡量感与精致度**，强化</p>
              <p>优势的同时避免"五官打架"。</p>
            </div>
          </div>

          <!-- 第二个分析：整体分析（包含肤色、比例、面部留白） -->
          <div class="analysis-slide">
            <section class="skin-section">
              <h2>肤色分析</h2>
              <div class="skin-analysis">
                <div class="image-container">
                  <img
                    src="../assets/baseDeepPic.png"
                    alt="肤色分析"
                    class="circle-image"
                  />
                  <div class="color-circle"></div>
                </div>
                <div class="analysis-text">
                  <p>肤色：冷偏哑，"20"</p>
                  <p>冷色眼科色经适合明智的白皙肤色，强调冰冷色彩色，</p>
                  <p>也温暖色系使用时，保存于下半部位体现温暖感和亲和力。</p>
                </div>
              </div>
            </section>

            <div class="section-divider"></div>

            <section class="proportion-section">
              <h2>比例分析</h2>
              <div class="proportion-analysis">
                <div class="comparison-images">
                  <div class="comparison-item">
                    <img
                      src="../assets/baseDeepPic.png"
                      alt="四庭比例"
                      class="circle-image"
                    />
                    <div class="proportion-label">四庭比例</div>
                    <div class="proportion-data">0.64: 0.76: 0.85: 0.76</div>
                  </div>
                  <div class="comparison-item">
                    <img
                      src="../assets/baseDeepPic.png"
                      alt="五眼比例"
                      class="circle-image"
                    />
                    <div class="proportion-label">五眼比例</div>
                    <div class="proportion-data">
                      0.42: 0.45: 0.45: 0.45: 0.41
                    </div>
                  </div>
                </div>
                <div class="analysis-text proportion-text">
                  <p>
                    四庭比例、可以联想由下方落在圆上，如此上扬。面部显长，两颊分布两宽。（眼部提升，鼻翼延伸，额头改变上下比）。轮廓距离在外形最外围，所以发型修饰很关键。
                  </p>
                </div>
                <div class="improvement-steps">
                  <img
                    src="../assets/baseDeepPic.png"
                    alt="改善过程1"
                    class="step-image"
                  />
                  <img
                    src="../assets/baseDeepPic.png"
                    alt="改善过程2"
                    class="step-image"
                  />
                  <img
                    src="../assets/baseDeepPic.png"
                    alt="改善过程3"
                    class="step-image"
                  />
                </div>
              </div>
            </section>

            <div class="section-divider"></div>

            <section class="face-blank-section">
              <h2>面部留白</h2>
              <div class="face-blank-analysis">
                <div class="image-container">
                  <img
                    src="../assets/baseDeepPic.png"
                    alt="面部留白"
                    class="circle-image"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const currentSlideIndex = ref(0);

// 添加这段代码来接收参数
const reportData = computed(() => {
  if (route.query.reportData) {
    try {
      return JSON.parse(route.query.reportData);
    } catch (e) {
      console.error("解析报告数据失败:", e);
      return null;
    }
  }
  return null;
});

// 可以在组件初始化时打印一下数据
if (reportData.value) {
  console.log("接收到的报告数据:", reportData.value);
}

// 触摸滑动相关变量
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;

const goBack = () => {
  router.push("/main");
};

const handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX;
  // 记录开始触摸的Y坐标
  touchStartY = e.touches[0].clientY;
};

const handleTouchMove = (e) => {
  // 判断是水平滑动还是垂直滑动
  const currentX = e.touches[0].clientX;
  const currentY = e.touches[0].clientY;

  // 计算X和Y方向的移动距离
  const deltaX = Math.abs(currentX - touchStartX);
  const deltaY = Math.abs(currentY - touchStartY);

  // 如果水平滑动距离大于垂直滑动距离，阻止默认行为（防止页面水平滑动）
  if (deltaX > deltaY) {
    e.preventDefault();
  }

  touchEndX = currentX;
};

const handleTouchEnd = (e) => {
  const minSwipeDistance = 50;
  const swipeDistance = touchStartX - touchEndX;

  if (Math.abs(swipeDistance) > minSwipeDistance) {
    // 向左滑动，切换到第二个分析
    if (swipeDistance > 0 && currentSlideIndex.value === 0) {
      currentSlideIndex.value = 1;
    }
    // 向右滑动，切换到第一个分析
    else if (swipeDistance < 0 && currentSlideIndex.value === 1) {
      currentSlideIndex.value = 0;
    }
  }

  // 重置触摸变量
  touchStartX = 0;
  touchEndX = 0;
};

const changeRoute = (index) => {
  if (index === 1) {
    // Change Clothes 选项
    router.push("/main");
  } else if (index === 2) {
    // Report 选项
    router.push("/report");
  } else if (index === 3) {
    // History 选项
    router.push("/history");
  }
};
</script>

<style lang="less" scoped>
.report {
  width: 100%;
  height: 100vh;
  background-position: center center;
  background-image: url(/src/assets/baseDeepPic.png);
  background-size: cover;
  background-repeat: no-repeat;
  color: white;
  overflow-y: auto;

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

  .navigation {
    display: flex;
    justify-content: center;
    gap: 80px;
    height: 30px;
    div {
      cursor: pointer;
      font-size: 18px;
      opacity: 0.7;

      &.active {
        opacity: 1;
        position: relative;
        font-weight: 500;

        &:after {
          content: "";
          position: absolute;
          bottom: -5px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: white;
        }
      }
    }
  }

  .report-content {
    display: flex;
    justify-content: center;
    padding: 0 20px;

    .face-analysis {
      max-width: 600px;
      background: rgba(128, 128, 128, 0.3);
      border-radius: 20px;
      padding: 0;
      backdrop-filter: blur(1px);
      position: absolute;
      overflow: hidden;
      bottom: 1rem;
      top: 8rem;
      left: 2rem;
      right: 2rem;

      .analysis-slider {
        display: flex;
        width: 200%; // 两个分析页面
        height: 100%;
        transition: transform 0.3s ease;

        .analysis-slide {
          width: 50%; // 每个分析占1/2
          height: 100%;
          padding: 30px;
          box-sizing: border-box;
          overflow-y: auto;

          h2 {
            text-align: center;
            margin-bottom: 20px;
            font-size: 24px;
            font-weight: normal;
          }

          // 五官量感分析
          .metrics {
            margin-bottom: 30px;

            .metric-item {
              display: flex;
              align-items: center;
              margin-bottom: 15px;

              .label {
                width: 60px;
                text-align: right;
                margin-right: 20px;
              }

              .progress-container {
                flex: 1;
                display: flex;
                align-items: center;

                .progress-bar {
                  flex: 1;
                  height: 8px;
                  background-color: rgba(255, 255, 255, 0.2);
                  border-radius: 4px;
                  overflow: hidden;
                  margin-right: 10px;

                  .progress-fill {
                    height: 100%;
                    background-color: white;
                    border-radius: 4px;
                  }
                }

                .score {
                  width: 30px;
                  text-align: left;
                }
              }
            }
          }

          // 第二个分析页面中的各部分
          section {
            margin-bottom: 25px;
          }

          .section-divider {
            height: 1px;
            background-color: rgba(255, 255, 255, 0.3);
            margin: 25px 0;
          }

          // 肤色分析
          .skin-analysis {
            display: flex;
            flex-direction: column;
            align-items: center;

            .image-container {
              position: relative;
              margin-bottom: 15px;

              .circle-image {
                width: 130px;
                height: 130px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid white;
              }

              .color-circle {
                position: absolute;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: #f5e6e0; // 肤色圆点
                top: 0;
                right: -25px;
                border: 2px solid white;
              }
            }
          }

          // 比例分析
          .proportion-analysis {
            .comparison-images {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;

              .comparison-item {
                text-align: center;
                width: 48%;

                .circle-image {
                  width: 100px;
                  height: 100px;
                  border-radius: 50%;
                  object-fit: cover;
                  margin-bottom: 8px;
                  border: 2px solid white;
                }

                .proportion-label {
                  font-size: 14px;
                  margin-bottom: 5px;
                }

                .proportion-data {
                  font-size: 12px;
                  opacity: 0.8;
                }
              }
            }

            .proportion-text {
              margin-bottom: 15px;
              font-size: 14px;
            }

            .improvement-steps {
              display: flex;
              justify-content: space-between;
              margin-top: 15px;

              .step-image {
                width: 32%;
                height: auto;
                object-fit: cover;
                border-radius: 5px;
              }
            }
          }

          // 面部留白
          .face-blank-analysis {
            display: flex;
            align-items: center;
            justify-content: center;

            .image-container {
              .circle-image {
                width: 150px;
                height: 150px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid white;
              }
            }
          }

          .analysis-text {
            line-height: 1.6;
            font-size: 14px;

            p {
              margin: 4px 0;
            }
          }
        }
      }
    }
  }
}

// 添加滚动条样式
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
