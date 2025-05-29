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
        <div
          v-if="user?.authorityId === 1001"
          @click="changeRoute(4)"
          :class="activeRoute == 4 ? 'activeRoute' : ''"
        >
          {{ $t("main.uploadMaterial") }}
        </div>
      </div>
      <img
        src="../assets/logo.png"
        style="width: 50px; height: 50px"
        class="top-icon"
        alt="icon"
      />
    </div>
    <div class="report-content">
      <div class="search-container">
        <div class="search-bar">
          <div class="search-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            v-model="searchNumber"
            placeholder="主播姓名"
            @input="handleSearch"
          />
        </div>
      </div>

      <div class="history-list" ref="historyListRef" @scroll="handleScroll">
        <div
          class="history-item"
          v-for="(item, index) in historyItems"
          :key="item.id || index"
        >
          <div class="item-content">
            <div class="item-title">{{ item.title || "No Title" }}</div>
            <div class="item-date">{{ item.CreatedAt || "No Date" }}</div>
          </div>
          <div class="document-icon" @click="handleDownload(item)">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              ></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading">Loading...</div>

        <!-- 没有更多数据提示 -->
        <div v-if="noMore" class="no-more">No more data</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLanguage } from "../composables/useLanguage";
import { reportApi } from "@/api";

const router = useRouter();

let activeRoute = ref(3);
// 分页相关数据
const page = ref(1);
const pageSize = 10;
const loading = ref(false);
const noMore = ref(false);
const historyItems = ref([]);
const searchNumber = ref("");
const historyListRef = ref(null);

// 获取历史记录数据
const fetchHistoryData = async () => {
  if (noMore.value) return;

  try {
    loading.value = true;

    const params = {
      page: page.value,
      pageSize,
      personId: searchNumber.value,
    };

    const response = await reportApi.getHistory(params);

    if (response.data.list) {
      // 追加数据而不是替换
      historyItems.value = [...historyItems.value, ...response.data.list];

      // 等待内容完全渲染后再检查高度
      await nextTick();
      const listElement = historyListRef.value;
      const reportContent = document.querySelector(".report-content");

      if (listElement && reportContent) {
        const listHeight = listElement.scrollHeight;
        const containerHeight = reportContent.clientHeight;

        // 判断是否还有更多数据
        noMore.value = response.data.list.length < pageSize;

        // 只有当列表高度小于容器高度且还有更多数据时才继续加载
        if (listHeight < containerHeight && !noMore.value) {
          page.value++;
          fetchHistoryData();
        }
      }
    }
  } catch (error) {
    console.error("获取历史记录失败:", error);
  } finally {
    loading.value = false;
  }
};

// 处理滚动事件
const handleScroll = (e) => {
  console.log("Scroll event triggered");
  const { scrollTop, scrollHeight, clientHeight } = e.target;
  // 当滚动到距离底部20px时加载更多
  if (
    scrollHeight - scrollTop - clientHeight < 20 &&
    !loading.value &&
    !noMore.value
  ) {
    page.value++;
    fetchHistoryData();
  }
};

// 处理搜索
const handleSearch = () => {
  // 重置分页数据
  page.value = 1;
  noMore.value = false;
  historyItems.value = []; // 清空现有数据
  // 重新获取数据
  fetchHistoryData();
};

// 修改下载处理函数为查看函数
const handleDownload = async (item) => {
  if (!item.fileUrl) {
    console.error("No file URL available");
    return;
  }

  try {
    // 直接在新标签页中打开文件URL
    window.open(item.fileUrl, "_blank");
  } catch (error) {
    console.error("Failed to open report:", error);
  }
};

// 初始化
onMounted(() => {
  fetchHistoryData();
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
  } else if (index === 1) {
    // History 选项
    router.push("/main");
  }
  activeRoute.value = index;
};
</script>

<style lang="less" scoped>
.report {
  width: 100%;
  height: 100vh;
  background-position: center center;
  background-image: url(/src/assets/pc_bg.png);
  background-size: cover;
  background-repeat: no-repeat;
  color: white;
  overflow-y: auto;

  .header {
    padding: 20px;
    height: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;

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
      span {
        background: url(../assets/icon/back_icon.png) no-repeat center center;
        width: 12px;
        height: 21px;
      }
    }
  }
  .head-container {
    width: 100%;
    background: #666;
    display: flex;
    box-sizing: border-box;
    height: 100px;
    padding: 0 20px;
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

  .report-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 20px;
    margin-top: 20px;
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
    padding: 1rem;

    .search-container {
      width: 100%;
      margin-bottom: 20px;

      .search-bar {
        background: rgba(255, 255, 255, 0.9);
        border-radius: 30px;
        padding: 8px 15px;
        display: flex;
        align-items: center;

        .search-icon {
          color: #888;
          margin-right: 8px;
        }

        input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 16px;
          color: #333;

          &::placeholder {
            color: #999;
          }
        }
      }
    }

    .history-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      height: 100%;

      .history-item {
        display: flex;
        align-items: center;
        margin: 15px 0;
        width: 100%;
        border-bottom: 1px solid rgba(255, 255, 255, 0.3);

        .document-icon {
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #fff;
          margin: 8px 0;
        }

        .item-content {
          width: 100%;
          padding: 10px;
          text-align: left;

          .item-title {
            font-size: 16px;
            margin-bottom: 5px;
          }

          .item-date {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);
          }
        }
      }

      .loading,
      .no-more {
        text-align: center;
        padding: 20px;
        color: rgba(255, 255, 255, 0.7);
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
