import axios from "axios";
import { getConfig } from "./config";

// 获取环境配置
const config = getConfig();

// 创建 axios 实例
const service = axios.create({
  baseURL: "http://112.74.166.183:8881",
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 如果需要携带 cookie
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 开发环境下打印请求信息
    if (import.meta.env.DEV) {
      // 可以在这里打印请求信息
    }

    // 添加token等通用请求头 - 从sessionStorage获取
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;

      // 如果是FormData类型的请求，也将token添加到FormData中
      if (config.data instanceof FormData && !config.data.has("token")) {
        config.data.append("token", token);
      }
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 开发环境下打印响应信息

    const res = response.data;
    // 这里可以根据后端的响应结构做统一处理
    if (res.code !== 0) {
      // 处理特定错误码
      switch (res.code) {
        case 401:
          // 未授权，跳转到登录页
          window.location.href = "/login";
          break;
        case 403:
          // 权限不足
          console.error("No permission");
          break;
        default:
          console.error(res.message || "Error");
      }
      return Promise.reject(new Error(res.message || "Error"));
    }
    return res;
  },
  (error) => {
    console.error("Response error:", error);
    // 处理网络错误
    if (!error.response) {
      // 网络错误
      console.error("Network Error");
    }
    return Promise.reject(error);
  }
);

// 衣服相关的 API 封装
export const clothesApi = {
  // GET请求，参数在url上
  getClothes(data) {
    return service({
      url: "/fileUploadAndDownload/getFileList",
      method: "post",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  // POST请求，参数在body中
  changeClothes(data) {
    console.log("Sending POST request with data:", data); // 添加日志
    return service({
      url: "/tryon/submit",
      method: "post", // 确保这里是小写的 'post'
      data, // 请求体数据
      headers: {
        "Content-Type": "application/json", // 确保设置了正确的 Content-Type
      },
    });
  },

  // 如果有文件上传
  uploadClothes(formData) {
    return service({
      url: "/clothes/upload",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data", // 文件上传需要修改Content-Type
      },
    });
  },

  // 删除衣服
  deleteClothes(id) {
    return service({
      url: `/clothes/${id}`,
      method: "delete",
    });
  },
};

// 用户相关的 API 封装
export const userApi = {
  login(data) {
    return service({
      url: "/base/login",
      method: "post",
      data,
    });
  },
};

export const reportApi = {
  getReport(data) {
    return service({
      url: "/analysis/report",
      method: "post",
      data,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// 统一导出
export default {
  clothes: clothesApi,
  user: userApi,
  report: reportApi,
};
