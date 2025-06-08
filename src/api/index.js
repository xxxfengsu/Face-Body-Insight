import axios from "axios";
import { getConfig } from "./config";

// 获取环境配置
const config = getConfig();

// 创建 axios 实例
const service = axios.create({
  baseURL: config.baseURL,
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
      config.headers["x-token"] = `${token}`;

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
          alert(res.msg || "Error");
      }
      return Promise.reject(new Error(res.msg || "Error"));
    }
    return res;
  },
  (error) => {
    if (error.response.status === 401) {
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }
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

  // 如果有文件上传
  uploadImage(formData) {
    return service({
      url: "/fileUploadAndDownload/upload",
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
  // 换衣
  changeClothes(formData) {
    return service({
      url: "/tryon/clothes",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data", // 文件上传需要修改Content-Type
      },
    });
  },
  // 换头发
  changeHair(formData) {
    return service({
      url: "/tryon/hair",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data", // 文件上传需要修改Content-Type
      },
    });
  },
  // 创建风格参考
  createStyleReference(formData) {
    return service({
      url: "/styleReferences/createStyleReferences",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data", // 文件上传需要修改Content-Type
      },
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
      url: "/analysis/face",
      method: "post",
      data,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getBodyReport(data) {
    return service({
      url: "/analysis/body/provider",
      method: "post",
      data,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  createRecord(data) {
    return service({
      url: "/analysis/record/create",
      method: "post",
      data,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getHistory(params) {
    return service({
      url: "/analysis/record/getList",
      method: "get",
      params,
    });
  },
};

// 统一导出
export default {
  clothes: clothesApi,
  user: userApi,
  report: reportApi,
};
