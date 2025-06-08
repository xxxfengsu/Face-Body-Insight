<template>
  <div class="report">
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
      </div>
      <img
        src="../assets/logo.png"
        style="width: 50px; height: 50px"
        class="top-icon"
        alt="icon"
      />
    </div>
    <div class="content" v-if="cateId == 32">
      <div class="report_left" ref="leftContainer" @scroll="handleLeftScroll">
        <div class="face-analysis">
          <!-- 滑动容器，改为垂直布局 -->
          <div class="analysis-slider">
            <!-- 第一个分析：整体分析（包含肤色、比例、面部留白） -->
            <div class="analysis-slide">
              <!-- 风格参考放到第一位 -->
              <div class="style-reference html2pic">
                <h2>风格参考</h2>
                <!-- 使用v-for循环遍历style_reference_list数组 -->
                <div
                  v-for="(
                    styleRef, index
                  ) in reportData?.style_reference_list || []"
                  :key="index"
                  class="style-card"
                >
                  <div class="style-content">
                    <!-- 左侧图片和颜色面板 -->
                    <div class="style-image-section" v-if="styleRef.imageUrl">
                      <img
                        :src="styleRef.imageUrl || '../assets/baseDeepPic.png'"
                        alt="风格参考"
                        class="style-image"
                      />
                    </div>

                    <!-- 右侧信息区 -->
                    <div class="style-info">
                      <div class="style-item">
                        <div class="style-label">三庭比例:</div>
                        <div class="style-value">
                          {{ styleRef.threePartRatio || "" }}
                        </div>
                      </div>
                      <div class="style-item">
                        <div class="style-label">五眼比例:</div>
                        <div class="style-value">
                          {{ styleRef.fiveEyeRatio || "" }}
                        </div>
                      </div>
                      <div class="style-item">
                        <div class="style-label">风格定位:</div>
                      </div>
                      <div class="style-value">
                        {{ styleRef.stylePositioning || "" }}
                      </div>
                      <div class="style-item">
                        <div class="style-label">妆容重点:</div>
                      </div>
                      <div
                        class="style-value"
                        v-html="formatAdvice(styleRef.makeupFocus)"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="section-divider"></div>

              <section class="skin-section html2pic">
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
                    <p>
                      痘痘：{{ reportData?.skin_analysis.acne.result_name }}
                    </p>
                    <p
                      v-html="
                        formatAdvice(reportData?.skin_analysis.acne.advice)
                      "
                    ></p>
                    <p>
                      眼皮：{{
                        reportData?.skin_analysis.eyelid_type.result_name
                      }}
                    </p>
                    <p
                      v-html="
                        formatAdvice(
                          reportData?.skin_analysis.eyelid_type.advice
                        )
                      "
                    ></p>
                    <p>
                      法令纹：{{
                        reportData?.skin_analysis.nasolabial_fold.result_name
                      }}
                    </p>
                    <p
                      v-html="
                        formatAdvice(
                          reportData?.skin_analysis.nasolabial_fold.advice
                        )
                      "
                    ></p>
                    <p>
                      斑点：{{
                        reportData?.skin_analysis.skin_spot.result_name
                      }}
                    </p>
                    <p
                      v-html="
                        formatAdvice(reportData?.skin_analysis.skin_spot.advice)
                      "
                    ></p>
                    <p>
                      皮肤类型：{{
                        reportData?.skin_analysis.skin_type.result_name
                      }}
                    </p>
                    <p
                      v-html="
                        formatAdvice(reportData?.skin_analysis.skin_type.advice)
                      "
                    ></p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <div
        class="report_right"
        ref="rightContainer"
        @scroll="handleRightScroll"
      >
        <div class="face-analysis">
          <!-- 滑动容器，改为垂直布局 -->
          <div class="analysis-slider">
            <!-- 第一个分析：整体分析（包含肤色、比例、面部留白） -->
            <div class="analysis-slide">
              <!-- 风格参考放到第一位 -->

              <section class="proportion-section">
                <h2>比例分析</h2>
                <div class="proportion-analysis html2pic">
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
                    <p
                      v-if="reportData?.three_part_analysis.advice"
                      v-html="
                        formatAdvice(reportData?.three_part_analysis.advice)
                      "
                    ></p>
                    <p
                      v-if="
                        reportData?.three_part_analysis.one_part.result !==
                        'faceup_normal'
                      "
                    >
                      上庭：{{
                        reportData?.three_part_analysis.one_part.result_name
                      }}
                      <span
                        v-html="
                          formatAdvice(
                            reportData?.three_part_analysis.one_part.advice
                          )
                        "
                      ></span>
                    </p>
                    <div
                      v-if="
                        reportData?.three_part_analysis.one_part
                          .advice_image_url
                      "
                      class="improvement-steps"
                    >
                      <img
                        :src="
                          reportData?.three_part_analysis.one_part
                            .advice_image_url
                        "
                        alt="上庭建议"
                      />
                    </div>

                    <p
                      v-if="
                        reportData?.three_part_analysis.two_part.result !==
                        'facemid_normal'
                      "
                    >
                      中庭：{{
                        reportData?.three_part_analysis.two_part.result_name
                      }}
                      <span
                        v-html="
                          formatAdvice(
                            reportData?.three_part_analysis.two_part.advice
                          )
                        "
                      ></span>
                    </p>
                    <div
                      v-if="
                        reportData?.three_part_analysis.two_part
                          .advice_image_url
                      "
                      class="improvement-steps"
                    >
                      <img
                        :src="
                          reportData?.three_part_analysis.two_part
                            .advice_image_url
                        "
                        alt="中庭建议"
                      />
                    </div>

                    <p
                      v-if="
                        reportData?.three_part_analysis.three_part.result !==
                        'facedown_normal'
                      "
                    >
                      下庭：{{
                        reportData?.three_part_analysis.three_part.result_name
                      }}
                      <span
                        v-html="
                          formatAdvice(
                            reportData?.three_part_analysis.three_part.advice
                          )
                        "
                      ></span>
                    </p>
                    <div
                      v-if="
                        reportData?.three_part_analysis.three_part
                          .advice_image_url
                      "
                      class="improvement-steps"
                    >
                      <img
                        :src="
                          reportData?.three_part_analysis.three_part
                            .advice_image_url
                        "
                        alt="下庭建议"
                      />
                    </div>
                  </div>
                  <div
                    class="improvement-steps"
                    v-if="reportData?.three_part_analysis.normal_image_url"
                  >
                    <img
                      :src="reportData?.three_part_analysis.normal_image_url"
                    />
                  </div>
                </div>
                <div class="section-divider"></div>
                <div class="proportion-analysis html2pic">
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
                      眼距：{{ reportData?.five_eyes_analysis.result_name }}
                      <span
                        v-html="
                          formatAdvice(reportData?.five_eyes_analysis.advice)
                        "
                      ></span>
                    </p>
                  </div>
                  <div class="improvement-steps">
                    <img
                      :src="
                        reportData?.five_eyes_analysis.image_url ||
                        '../assets/analysisProcess.png'
                      "
                    />
                  </div>
                </div>
              </section>

              <div class="section-divider"></div>

              <!-- 五官量感分析 -->
              <div class="feature-container html2pic">
                <h2>五官量感</h2>
                <div class="user-image-container">
                  <img
                    :src="
                      reportData?.facial_density.result_image_url ||
                      '../assets/baseDeepPic.png'
                    "
                    alt="用户照片"
                    class="circle-image"
                  />
                </div>
                <div class="analysis-content">
                  <p class="main-analysis">
                    {{ reportData?.facial_density.result_name }}
                  </p>
                  <p
                    v-html="formatAdvice(reportData?.facial_density.advice)"
                  ></p>
                </div>
              </div>

              <div class="features-list html2pic">
                <h3>五官类型</h3>
                <div class="feature-item">
                  <span class="feature-label">眉毛:</span>
                  <span class="feature-value">{{
                    reportData?.feature_types?.brows.result_name || ""
                  }}</span>
                </div>
                <p
                  v-html="formatAdvice(reportData?.feature_types?.brows.advice)"
                ></p>
                <div class="feature-item">
                  <span class="feature-label">眼睛:</span>
                  <span class="feature-value">{{
                    reportData?.feature_types?.eyes.result_name || ""
                  }}</span>
                </div>
                <p
                  v-html="formatAdvice(reportData?.feature_types?.eyes.advice)"
                ></p>
                <div class="feature-item">
                  <span class="feature-label">鼻子:</span>
                  <span class="feature-value">{{
                    reportData?.feature_types?.nose.result_name || ""
                  }}</span>
                </div>
                <p
                  v-html="formatAdvice(reportData?.feature_types?.nose.advice)"
                ></p>
                <div class="feature-item">
                  <span class="feature-label">嘴巴:</span>
                  <span class="feature-value">{{
                    reportData?.feature_types?.lip.result_name || ""
                  }}</span>
                </div>
                <p
                  v-html="formatAdvice(reportData?.feature_types?.lip.advice)"
                ></p>
                <div class="feature-item">
                  <span class="feature-label">脸型:</span>
                  <span class="feature-value">{{
                    reportData?.feature_types?.face_shape.result_name || ""
                  }}</span>
                </div>
                <p
                  v-html="
                    formatAdvice(reportData?.feature_types?.face_shape.advice)
                  "
                ></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="centerLine"></div>
    </div>
    <div class="content" v-if="cateId == 33">
      <div class="report_left" ref="leftContainer" @scroll="handleLeftScroll">
        <div class="face-analysis">
          <div class="analysis-slider">
            <div class="analysis-slide">
              <section>
                <h2>身材类型</h2>
                <!-- 使用v-for循环遍历style_reference_list数组 -->

                <div class="style-content">
                  <!-- 左侧图片和颜色面板 -->
                  <div class="style-image-section">
                    <img
                      :src="reportData?.body_type?.image_url"
                      alt="风格参考"
                      class="style-image"
                    />
                  </div>

                  <!-- 右侧信息区 -->
                  <div class="style-info">
                    <div class="style-item">
                      <div class="style-label">身材类型:</div>
                      <div class="style-value">
                        {{ reportData?.body_type?.body_type || "" }}
                      </div>
                    </div>
                    <div class="style-item">
                      <div class="style-label">特性特征:</div>
                    </div>
                    <div
                      class="info-value"
                      v-for="(item, index) in reportData?.body_type?.features"
                      :key="index"
                    >
                      {{ item
                      }}{{
                        index < reportData?.body_type?.features.length - 1
                          ? "、"
                          : ""
                      }}
                    </div>
                  </div>
                </div>
              </section>

              <div class="section-divider"></div>
              <section>
                <h2>身材比例</h2>
                <div class="style-content">
                  <!-- 左侧图片和颜色面板 -->
                  <div class="style-image-section">
                    <img
                      :src="
                        (reportData?.body_proportion?.image_url ||
                          '../assets/baseDeepPic.png') +
                        '?t=' +
                        new Date().getTime()
                      "
                      alt="风格参考"
                      class="style-image"
                    />
                  </div>

                  <!-- 右侧信息区 -->
                  <div class="style-info">
                    <div class="style-item">
                      <div class="style-label">头身比例:</div>
                      <div class="style-value">
                        {{ reportData?.body_proportion?.head_to_body || "" }}
                      </div>
                    </div>
                    <div class="style-item">
                      <div class="style-label">头肩比例:</div>
                      <div class="style-value">
                        {{
                          reportData?.body_proportion?.head_to_shoulders || ""
                        }}
                      </div>
                    </div>
                    <div class="style-item">
                      <div class="style-label">上下身比例:</div>
                      <div class="style-value">
                        {{
                          reportData?.body_proportion?.upper_to_lower_body || ""
                        }}
                      </div>
                    </div>
                    <div class="style-item">
                      <div class="style-label">腰臀比例:</div>
                      <div class="style-value">
                        {{
                          reportData?.body_proportion?.waist_to_hip_ratio || ""
                        }}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <div
        class="report_right"
        ref="rightContainer"
        @scroll="handleRightScroll"
      >
        <div class="face-analysis">
          <div class="analysis-slider">
            <div class="analysis-slide">
              <section>
                <h2>穿搭建议</h2>
                <div class="style-suggestions-list">
                  <div
                    v-for="(suggestion, index) in reportData?.suggestions || []"
                    :key="index"
                    class="suggestion-item"
                  >
                    <p v-if="suggestion" v-html="formatAdvice(suggestion)"></p>
                    <div
                      class="suggestion-images"
                      v-if="suggestion.images && suggestion.images.length > 0"
                    >
                      <img
                        v-for="(image, imgIndex) in suggestion.images"
                        :key="imgIndex"
                        :src="image"
                        alt="穿搭建议"
                        class="suggestion-image"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <div class="centerLine"></div>
    </div>
    <!-- 在 template 部分，添加加载指示器 -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在生成报告...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

let activeRoute = ref(2);
const router = useRouter();
const route = useRoute();
const isLoading = ref(false);

const personId = ref("");
const cateId = ref("");
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
  if (localStorage.getItem("reportData"))
    try {
      return JSON.parse(localStorage.getItem("reportData"));
    } catch (e) {
      console.error("解析报告数据失败:", e);
      return null;
    }
  return null;
});

// 处理advice文本，将句号替换为换行符，如果是数组则每一项换一行
const formatAdvice = (advice) => {
  if (!advice) return "";

  // 如果是数组，将每个元素用<br>连接
  if (Array.isArray(advice)) {
    return advice.join("<br>");
  }

  // 如果是字符串，保持原有逻辑
  return advice.replace(/。/g, "。<br>").replace(/\.$/, ".<br>");
};

// 可以在组件初始化时打印一下数据
if (reportData.value) {
  console.log("接收到的报告数据:", reportData.value);
}

const changeRoute = (index) => {
  if (index === 1) {
    // Uploading 选项
    router.push("/main");
  } else if (index === 2) {
    // Report 选项
    router.push("/report");
  } else if (index === 3) {
    // History 选项
    router.push("/history");
  } else if (index === 4) {
    // Change Clothes 选项
    router.push("/change-clothes");
  }
};

// 修改 onMounted
onMounted(async () => {
  if (route.query.personId) {
    personId.value = route.query.personId;
  }
  if (route.query.cateId) {
    cateId.value = route.query.cateId;
  }
  if (localStorage.getItem("cateId")) {
    cateId.value = localStorage.getItem("cateId");
  }
});

// 添加滚动同步的引用和处理函数
const leftContainer = ref(null);
const rightContainer = ref(null);
let isScrolling = false;

// 处理左侧滚动时同步右侧
const handleLeftScroll = (event) => {
  if (isScrolling) return;
  isScrolling = true;

  if (rightContainer.value) {
    // 计算左侧容器已滚动的百分比
    const leftScrollPercentage =
      event.target.scrollTop /
      (event.target.scrollHeight - event.target.clientHeight || 1);

    // 确保滚动到底部时，右侧也滚动到底部
    if (
      Math.abs(leftScrollPercentage - 1) < 0.05 ||
      leftScrollPercentage > 0.95
    ) {
      // 如果左侧接近或已达到底部，强制右侧滚动到底部
      rightContainer.value.scrollTop = rightContainer.value.scrollHeight;
    } else {
      // 否则按比例滚动
      const rightTargetScroll =
        leftScrollPercentage *
        (rightContainer.value.scrollHeight -
          rightContainer.value.clientHeight || 1);
      rightContainer.value.scrollTop = rightTargetScroll;
    }
  }

  setTimeout(() => {
    isScrolling = false;
  }, 1); // 增加防抖时间
};

// 处理右侧滚动时同步左侧
const handleRightScroll = (event) => {
  if (isScrolling) return;
  isScrolling = true;

  if (leftContainer.value) {
    // 计算右侧容器已滚动的百分比
    const rightScrollPercentage =
      event.target.scrollTop /
      (event.target.scrollHeight - event.target.clientHeight || 1);

    // 确保滚动到底部时，左侧也滚动到底部
    if (
      Math.abs(rightScrollPercentage - 1) < 0.05 ||
      rightScrollPercentage > 0.95
    ) {
      // 如果右侧接近或已达到底部，强制左侧滚动到底部
      leftContainer.value.scrollTop = leftContainer.value.scrollHeight;
    } else {
      // 否则按比例滚动
      const leftTargetScroll =
        rightScrollPercentage *
        (leftContainer.value.scrollHeight - leftContainer.value.clientHeight ||
          1);
      leftContainer.value.scrollTop = leftTargetScroll;
    }
  }

  setTimeout(() => {
    isScrolling = false;
  }, 1); // 增加防抖时间
};
</script>

<style lang="less" scoped>
.report {
  width: 100%;
  height: 100vh;
  background: black;
  color: white;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  .face-analysis {
    background: rgba(128, 128, 128, 0.5);
    border-radius: 20px;
    padding: 0;
    backdrop-filter: blur(10px);

    .analysis-slider {
      height: 100%;

      .analysis-slide {
        width: 100%;
        padding: 10px 20px;
        box-sizing: border-box;

        h2 {
          text-align: center;
          margin-bottom: 20px;
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
        .circle-image {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 8px;
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
          align-items: start;

          .image-container {
            position: relative;
            margin-bottom: 15px;
            display: flex;
            justify-content: center;
            width: 50%;
            .circle-image {
              width: 200px;
              height: 200px;
              border-radius: 50%;
              object-fit: cover;
              margin-bottom: 8px;
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
                margin-bottom: 5px;
              }

              .proportion-data {
                opacity: 0.8;
              }
            }
          }

          .proportion-text {
            margin-bottom: 15px;
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
              width: 200px;
              height: 200px;
              border-radius: 50%;
              object-fit: cover;
              margin-bottom: 8px;
              border: 2px solid white;
            }
          }
        }

        .analysis-text {
          line-height: 1.6;
          text-align: left;
          display: flex;
          flex-direction: column;
          justify-content: center;
          p {
            margin: 4px 0;
          }
        }

        // 风格参考样式
        .style-reference {
          margin-top: 15px;
        }

        .style-card {
          border-radius: 15px;
          margin-bottom: 20px;
        }

        .style-content {
          display: flex;
          // align-items: flex-start;
          gap: 10px;
          overflow: hidden;
        }

        .style-image-section {
          border-radius: 15px;
          overflow: hidden;
          width: 50%;
        }

        .style-image {
          width: 100%;
          border-radius: 15px 15px 0 0;
          display: block;
        }

        .color-palette {
          display: flex;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.9);
          padding: 10px;
          border-radius: 0 0 15px 15px;
        }

        .color-chip {
          width: 18%;
          height: 30px;
          border-radius: 5px;
        }

        .style-info {
          flex: 1;
          text-align: left;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .style-item {
          display: flex;
          margin-top: 10px;
          align-items: baseline;
        }

        .style-label {
          font-weight: bold;
          min-width: 90px;
          text-align: left;
        }

        .style-value {
          text-align: left;
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

/* 响应式适配 */
@media (max-width: 580px) {
  .style-content {
    flex-direction: column;
  }

  .style-image-section {
    max-width: 100%;
    margin-bottom: 15px;
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
.head-container {
  width: 100%;
  box-sizing: border-box;
  background: #666;
  display: flex;
  padding: 0 20px;
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
    height: 100px;
  }
}

.content {
  flex: 1;
  background-position: right;
  background-image: url(/src/assets/pc_bg.png);
  background-repeat: no-repeat;
  // filter: blur(3px);
  display: flex;
  gap: 20px;
  position: relative;
  max-height: calc(100vh - 100px); /* 添加最大高度限制 */
  padding: 20px;
  box-sizing: border-box;
  .report_left {
    width: 50%;
    height: 100%;
    padding: 20px;
    overflow: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari and Opera */
    }
    box-sizing: border-box;
  }
  .report_right {
    width: 50%;
    height: 100%;
    padding: 20px;
    overflow: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    box-sizing: border-box;
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari and Opera */
    }
  }
  .centerLine {
    width: 1px;
    bottom: 20px;
    background: #fff;
    position: absolute;
    left: 50%;
    top: 20px;
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
</style>
