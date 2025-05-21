<template>
  <div class="login-container">
    <img src="../assets/pc_bg.png" alt="Background" class="bg-image" />
    <div class="overlay">
      <div class="login-content">
        <!-- 左侧登录表单 -->
        <div class="login-form">
          <div class="login-header">
            <h1 class="title">{{ $t("login.title") }}</h1>
            <div class="avatar-wrapper">
              <img
                src="../assets/icon/loginTop_icon.png"
                alt="avatar"
                class="avatar"
              />
            </div>
          </div>

          <div class="input-container">
            <div class="input-group">
              <input
                type="text"
                :placeholder="$t('login.username')"
                v-model="username"
                class="form-input"
              />
            </div>

            <div class="input-group">
              <input
                type="password"
                :placeholder="$t('login.password')"
                v-model="password"
                class="form-input"
              />
            </div>
          </div>

          <button class="go-button" @click="login">
            {{ $t("login.loginButton") }}
          </button>
        </div>
        <!-- 右侧文案和icon -->
        <div class="login-side-info">
          <img src="../assets/logo.png" class="side-icon" alt="icon" />
          <div class="side-text">
            <div class="main-title">Let Your Beauty</div>
            <div class="main-title">Have A Trace To Follow</div>
            <div class="sub-title">Hua Xing</div>
          </div>
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
import { userApi } from "../api";

const router = useRouter();
const { t } = useI18n();
// 使用语言钩子获取当前语言和切换语言方法
const { currentLanguage, changeLanguage } = useLanguage();

const username = ref("");
const password = ref("");

const goBack = () => {
  router.push("/");
};

const login = async () => {
  try {
    const data = {
      captchaId: "1",
      username: username.value,
      password: password.value,
    };
    const res = await userApi.login(data);

    // 登录成功，存储token到sessionStorage
    if (res && res.data && res.data.token) {
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      console.log("登录成功，token已保存");

      // 登录成功后跳转
      router.push("/main");
    } else {
      console.error("登录失败：未获取到token");
      alert(res.msg);
    }
  } catch (error) {
    console.error("登录出错:", error);
    alert(error);
  }
};
</script>

<style scoped lang="less">
.login-container {
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Avenir", sans-serif;
  color: white;
  background-color: black;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: 1;
}

.overlay {
  position: relative;
  z-index: 2;
  height: 100%;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.login-content {
  display: flex;
  height: 100%;
  width: 100%;
}

.login-form {
  position: absolute;
  bottom: 0;
  top: 0;
  left: 0;
  /* padding: 2rem; */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  width: 40%;
  min-width: 350px;
  /* padding-bottom: 8%; */
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  width: 40%;
  box-sizing: border-box;
  border-top-right-radius: 50px;
  border-bottom-right-radius: 50px;
}

.title {
  font-size: 2.5rem;
  font-weight: 500;
  margin-bottom: 2rem;
  letter-spacing: 1px;
  text-align: center;
}

.input-group {
  width: 100%;
  max-width: 400px;
  margin-bottom: 1.5rem;
}

.form-input {
  width: 100%;
  padding: 1rem 1.5rem;
  border-radius: 50px;
  border: none;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  color: #333;
  outline: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
}

.go-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}
.login-header {
  width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.4);
  position: relative;
  border-radius: 30px;
  height: 150px;
  .avatar-wrapper {
    position: absolute;
    bottom: -120px;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
.input-container {
  width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-side-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  /* justify-content: center; */
  position: relative;
  /* padding-right: 5vw; */
  box-sizing: border-box;
  padding: 5% 18%;
  z-index: -1;
}

.side-icon {
  position: absolute;
  top: 40px;
  right: 60px;
  width: 48px;
  height: 48px;
  z-index: 2;
}

.side-text {
  color: #fff;
  text-align: right;
  margin-top: 80px;
  margin-right: 30px;
}

.main-title {
  font-size: 2.2rem;
  font-weight: bold;
  line-height: 1.2;
  margin-bottom: 0.2em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.sub-title {
  font-size: 1.1rem;
  margin-top: 1.2em;
  color: #eee;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
