<template>
  <div class="report">
    <div class="header">
      <div class="back" @click="goBack">
        <span>&lt;</span>
      </div>
    </div>
    <div class="navigation">
      <div @click="changeRoute(1)">{{ $t("main.uploading") }}</div>
      <div @click="changeRoute(2)" class="active">{{ $t("report.title") }}</div>
      <div @click="changeRoute(3)">{{ $t("main.history") }}</div>
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
            <div class="feature-container">
              <div class="user-image-container">
                <img
                  :src="
                    reportData?.facial_density.result_image_url ||
                    '../assets/baseDeepPic.png'
                  "
                  alt="用户照片"
                  class="user-image"
                />
              </div>
              <div class="analysis-content">
                <p class="main-analysis">
                  {{ reportData.facial_density.result_name }}
                </p>
                <p>
                  {{ reportData.facial_density.advice }}
                </p>
              </div>
            </div>

            <h3>五官类型</h3>
            <div class="features-list">
              <div class="feature-item">
                <span class="feature-label">眉毛:</span>
                <span class="feature-value">{{
                  reportData?.feature_types?.brows.result_name || ""
                }}</span>
              </div>
              <div class="feature-item">
                <span class="feature-label">眼睛:</span>
                <span class="feature-value">{{
                  reportData?.feature_types?.eyes.result_name || ""
                }}</span>
              </div>
              <div class="feature-item">
                <span class="feature-label">鼻子:</span>
                <span class="feature-value">{{
                  reportData?.feature_types?.nose.result_name || ""
                }}</span>
              </div>
              <div class="feature-item">
                <span class="feature-label">嘴巴:</span>
                <span class="feature-value">{{
                  reportData?.feature_types?.lip.result_name || ""
                }}</span>
              </div>
              <div class="feature-item">
                <span class="feature-label">脸型:</span>
                <span class="feature-value">{{
                  reportData?.feature_types?.face_shape.result_name || ""
                }}</span>
              </div>
            </div>
          </div>

          <!-- 第二个分析：整体分析（包含肤色、比例、面部留白） -->
          <div class="analysis-slide">
            <section class="skin-section">
              <h2>皮肤分析</h2>
              <div class="skin-analysis">
                <div class="image-container">
                  <img
                    :src="
                      reportData?.skin_analysis.result_image_url ||
                      '../assets/baseDeepPic.png'
                    "
                    alt="肤色分析"
                    class="circle-image"
                  />
                </div>
                <div class="analysis-text">
                  <p>痘痘：{{ reportData?.skin_analysis.acne.result_name }}</p>
                  <p>{{ reportData?.skin_analysis.acne.advice }}</p>
                  <p>
                    眼皮：{{
                      reportData?.skin_analysis.eyelid_type.result_name
                    }}
                  </p>
                  <p>{{ reportData?.skin_analysis.eyelid_type.advice }}</p>
                  <p>
                    法令纹：{{
                      reportData?.skin_analysis.nasolabial_fold.result_name
                    }}
                  </p>
                  <p>{{ reportData?.skin_analysis.nasolabial_fold.advice }}</p>
                  <p>
                    斑点：{{ reportData?.skin_analysis.skin_spot.result_name }}
                  </p>
                  <p>{{ reportData?.skin_analysis.skin_spot.advice }}</p>
                  <p>
                    皮肤类型：{{
                      reportData?.skin_analysis.skin_type.result_name
                    }}
                  </p>
                  <p>{{ reportData?.skin_analysis.skin_type.advice }}</p>
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
                      :src="
                        reportData?.three_part_analysis.result_image_url ||
                        '../assets/baseDeepPic.png'
                      "
                      alt="三庭比例"
                      class="circle-image"
                    />
                    <div class="proportion-label">三庭比例</div>
                    <div class="proportion-data">
                      {{ reportData?.three_part_analysis.ratios }}
                    </div>
                  </div>
                </div>
                <div class="analysis-text proportion-text">
                  <p>
                    上庭：{{
                      reportData?.three_part_analysis.one_part.result_name
                    }}
                    {{ reportData?.three_part_analysis.one_part.advice }}
                  </p>
                  <p>
                    中庭：{{
                      reportData?.three_part_analysis.two_part.result_name
                    }}
                    {{ reportData?.three_part_analysis.two_part.advice }}
                  </p>
                  <p>
                    下庭：{{
                      reportData?.three_part_analysis.three_part.result_name
                    }}
                    {{ reportData?.three_part_analysis.three_part.advice }}
                  </p>
                </div>
                <div class="improvement-steps">
                  <img src="../assets/analysisProcess.png" />
                </div>
              </div>
              <div class="section-divider"></div>
              <div class="proportion-analysis">
                <div class="comparison-images">
                  <div class="comparison-item">
                    <img
                      :src="
                        reportData?.five_eyes_analysis.result_image_url ||
                        '../assets/baseDeepPic.png'
                      "
                      alt="五眼比例"
                      class="circle-image"
                    />
                    <div class="proportion-label">五眼比例</div>
                    <div class="proportion-data">
                      {{ reportData?.five_eyes_analysis.ratios }}
                    </div>
                  </div>
                </div>
                <div class="analysis-text proportion-text">
                  <p>
                    上庭：{{ reportData?.five_eyes_analysis.result_name }}
                    {{ reportData?.five_eyes_analysis.advice }}
                  </p>
                </div>
                <div class="improvement-steps">
                  <img src="../assets/analysisProcess.png" />
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
import { useI18n } from "vue-i18n";
import { useLanguage } from "../composables/useLanguage";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
// 使用语言钩子确保语言一致性
const { currentLanguage } = useLanguage();
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
      background: rgba(128, 128, 128, 0.5);
      border-radius: 20px;
      padding: 0;
      backdrop-filter: blur(10px);
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
          .feature-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 20px;
          }

          .user-image-container {
            margin-bottom: 15px;
          }

          .user-image {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid white;
          }

          .analysis-content {
            text-align: left;
            width: 100%;
          }

          .main-analysis {
            font-weight: bold;
            margin-bottom: 10px;
          }

          .analysis-content ol {
            padding-left: 20px;
            margin-top: 10px;
          }

          .analysis-content li {
            margin-bottom: 5px;
          }

          h3 {
            text-align: left;
            margin: 20px 0 10px 0;
            font-weight: normal;
            font-size: 18px;
          }

          .features-list {
            width: 100%;
            text-align: left;
          }

          .feature-item {
            margin-bottom: 10px;
            display: flex;
            align-items: baseline;
          }

          .feature-label {
            font-weight: bold;
            min-width: 60px;
          }

          .feature-value {
            flex: 1;
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
            align-items: start;

            .image-container {
              position: relative;
              margin-bottom: 15px;
              display: flex;
              justify-content: center;
              width: 100%;
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
              justify-content: center;
              margin-bottom: 15px;

              .comparison-item {
                text-align: center;

                .circle-image {
                  width: 200px;
                  height: 200px;
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
              img {
                width: 100%;
                height: 100%;
              }
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
            text-align: left;
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
