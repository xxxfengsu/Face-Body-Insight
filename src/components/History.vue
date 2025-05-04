<template>
  <div class="report">
    <div class="header">
      <div class="back" @click="goBack">
        <span>&lt;</span>
      </div>
    </div>
    <div class="navigation">
      <div @click="changeRoute(1)">{{ $t("main.uploading") }}</div>
      <!-- <div @click="changeRoute(2)">{{ $t("report.title") }}</div> -->
      <div @click="changeRoute(3)" class="active">
        {{ $t("history.title") }}
      </div>
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
          <input type="text" placeholder="Number" />
        </div>
      </div>

      <div class="history-list">
        <div
          class="history-item"
          v-for="(item, index) in historyItems"
          :key="index"
        >
          <div class="document-icon">
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
          <div class="separator"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLanguage } from "../composables/useLanguage";

const router = useRouter();
const { t } = useI18n();
// 使用语言钩子
const { currentLanguage, changeLanguage } = useLanguage();

const historyItems = ref([
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {}, // 9 empty items to represent the document icons
]);

const goBack = () => {
  router.push("/main");
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
    padding: 20px;
    height: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .back {
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
    flex-direction: column;
    align-items: center;
    padding: 0 20px;
    margin-top: 20px;
    max-width: 600px;
    background: rgba(128, 128, 128, 0.3);
    border-radius: 20px;
    padding: 0;
    backdrop-filter: blur(1px);
    position: absolute;
    overflow: auto;
    bottom: 1rem;
    top: 8rem;
    left: 2rem;
    right: 2rem;
    padding: 2rem;

    .search-container {
      width: 100%;
      max-width: 400px;
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
      max-width: 400px;
      display: flex;
      flex-direction: column;

      .history-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 15px 0;

        .document-icon {
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #fff;
          margin: 8px 0;
        }

        .separator {
          width: 100%;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.3);
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
