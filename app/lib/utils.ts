/**
 * 格式化日期为本地日期字符串
 * @param date 日期对象或日期字符串
 * @param locale 地区设置，默认为中文
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, locale: string = 'zh-CN'): string {
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  
  return dateObject.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * 截断地址字符串
 * @param address 钱包地址
 * @param startChars 开始保留的字符数
 * @param endChars 结束保留的字符数
 * @returns 截断后的地址字符串
 */
export function truncateAddress(address: string, startChars: number = 4, endChars: number = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * 格式化金额为货币字符串
 * @param amount 金额数值
 * @param currency 货币代码，默认为 CNY
 * @param locale 地区设置，默认为中文
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(amount: number, currency: string = 'CNY', locale: string = 'zh-CN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * 生成随机ID
 * @param length ID长度，默认为8
 * @returns 随机ID字符串
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * 延迟执行函数
 * @param ms 延迟毫秒数
 * @returns Promise对象
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 从URL中获取查询参数值
 * @param param 参数名称
 * @returns 参数值或null
 */
export function getQueryParam(param: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * 限制字符串长度，超过则截断并添加省略号
 * @param str 原始字符串
 * @param maxLength 最大长度
 * @returns 处理后的字符串
 */
export function truncateString(str: string, maxLength: number = 50): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  
  return `${str.slice(0, maxLength)}...`;
}

/**
 * 深度复制对象
 * @param obj 要复制的对象
 * @returns 复制后的新对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 检查字符串是否为有效电子邮件格式
 * @param email 电子邮件字符串
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 检查字符串是否为有效URL格式
 * @param url URL字符串
 * @returns 是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
