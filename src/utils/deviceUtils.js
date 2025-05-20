// deviceUtils.js
// 用于检测设备类型的工具函数

/**
 * 检测当前设备是否为PC
 * @returns {boolean} 如果是PC返回true，否则返回false
 */
export const isPC = () => {
  // 检测是否为移动设备的正则表达式
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return !mobileRegex.test(navigator.userAgent);
};

/**
 * 获取当前设备类型
 * @returns {string} 'pc' 或 'mobile'
 */
export const getDeviceType = () => {
  return isPC() ? "pc" : "mobile";
};

// 导出设备工具对象
export const deviceUtils = {
  isPC,
  getDeviceType,
};

export default deviceUtils;
