// API 环境配置
const config = {
  development: {
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://139.224.59.6:8882", // 开发环境
  },
  production: {
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://139.224.59.6:8881", // 生产环境
  },
};

// 获取当前环境的配置
export const getConfig = () => {
  const env = import.meta.env.MODE;
  return config[env] || config.development; // 默认返回开发环境配置
};

export default config;
