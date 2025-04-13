<template>
  <div class="login-container">
    <img src="../assets/baseDeepPic.png" alt="Background" class="bg-image" />
    <div class="overlay">
      <div class="header">
        <div class="back-button">
          <span>&lt;</span>
        </div>
        <div class="logo">
          <img src="../assets/logo.png" alt="Logo" />
        </div>
      </div>

      <div class="login-form">
        <h1 class="title">Sign In</h1>

        <div class="input-group">
          <input
            type="text"
            placeholder="Username"
            v-model="username"
            class="form-input"
          />
        </div>

        <div class="input-group">
          <input
            type="password"
            placeholder="Password"
            v-model="password"
            class="form-input"
          />
        </div>

        <button class="go-button" @click="login">GO</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "Login",
  setup() {
    const router = useRouter();
    const username = ref("");
    const password = ref("");

    const login = () => {
      // 这里添加登录逻辑
      console.log("Login attempt:", username.value, password.value);

      // 登录成功后跳转
      router.push("/main");
    };

    return {
      username,
      password,
      login,
    };
  },
};
</script>

<style scoped>
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
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.back-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(100, 100, 100, 0.5);
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.login-form {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  width: 100%;
  box-sizing: border-box;
  padding-bottom: 8%;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  margin-bottom: 2rem;
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
  padding: 0.8rem 3rem;
  font-size: 1.1rem;
  font-weight: bold;
  margin-top: 1.5rem;
  margin-bottom: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.go-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}
</style>
