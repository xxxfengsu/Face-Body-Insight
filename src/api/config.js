// API配置文件
export const API_CONFIG = {
  // 开发环境配置
  development: {
    baseURL: "/",
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
    },
  },
  // 生产环境配置
  production: {
    baseURL: "https://api.your-production-domain.com",
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
    },
  },
};

// 获取当前环境的配置
export const getConfig = () => {
  const env = import.meta.env.MODE || "development";
  return API_CONFIG[env];
};
