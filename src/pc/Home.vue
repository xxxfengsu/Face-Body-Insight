<template>
  <div class="page-container" ref="pageContainer">
    <img src="../assets/pc_bg.png" alt="Face Background" class="bg-image" />
    <div class="overlay">
      <div class="header">
        <div class="logo">
          <img src="../assets/logo.png" alt="Logo" />
        </div>
      </div>
      <h1 class="title">{{ $t("home.title") }}</h1>
      <p class="subtitle">{{ $t("home.subtitle") }}</p>
      <button class="go-button" @click="goToLogin">
        {{ $t("home.go") }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goToLogin = () => {
  router.push("/login");
};
</script>

<style scoped lang="less">
.page-container {
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Avenir", sans-serif;
  color: white;
  text-align: center;
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
  align-items: center;
  height: 100%;
  padding: 2rem 1.5rem;
  box-sizing: border-box;
}
.header {
  display: flex;
  justify-content: end;
  width: 100%;
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

.title {
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 2;
  letter-spacing: 0.5px;
  margin-top: 6rem;
}

.subtitle {
  font-size: 36px;
  font-weight: 600;
  margin: 0;
  opacity: 0.9;
}

.go-button-wrapper {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  height: 150px;
  overflow: hidden;
}

.button-background {
  position: relative;
  width: 70px;
  height: 150px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 35px;
  z-index: -1;
}

.arrow {
  position: absolute;
  font-size: 1rem;
  color: black;
  padding: 0.2rem 1rem;
  margin-bottom: 5px;
  z-index: 0;
  transform: rotate(-90deg);
  scale: 1.3;
  top: 30%;
}

button {
  position: absolute;
  bottom: 40px;
  background-color: white;
  color: black;
  font-weight: bold;
  border: none;
  border-radius: 80px;
  width: 170px;
  height: 70px;
  cursor: pointer;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
  transition: transform 0.3s ease-out;
  touch-action: none;
}

button.moved {
  transform: translateY(-200px) !important;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100px);
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
</style>
