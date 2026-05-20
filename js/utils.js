// ============================================
// 工具函数 - 思炫宝宝的专属小窝
// ============================================

/**
 * 生成唯一 ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * 获取今天的 ISO 日期字符串 (YYYY-MM-DD)
 */
function getToday() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

/**
 * 格式化日期为中文友好格式
 * @param {string} dateString - ISO 日期字符串 (YYYY-MM-DD)
 * @returns {string} 如 "2024年6月15日"
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  return `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日`;
}

/**
 * 计算两个日期之间的天数差
 * @param {string} date1 - ISO 日期字符串
 * @param {string} date2 - ISO 日期字符串
 * @returns {number} 天数差（正数表示 date1 在 date2 之后）
 */
function daysBetween(date1, date2) {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  return Math.floor((d2 - d1) / 86400000);
}

/**
 * 计算从某天到今天的天数
 */
function daysFromToday(dateString) {
  return daysBetween(dateString, getToday());
}

/**
 * 获取相对时间描述（如 "3小时前"、"昨天"）
 */
function relativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return minutes + '分钟前';
  if (hours < 24) return hours + '小时前';
  if (days < 2) return '昨天';
  if (days < 7) return days + '天前';
  if (days < 30) return Math.floor(days / 7) + '周前';
  return formatDate(getTodayFromTimestamp(timestamp));
}

function getTodayFromTimestamp(ts) {
  const d = new Date(ts);
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

/**
 * 压缩图片为 base64
 * @param {File} file - 文件对象
 * @param {number} maxWidth - 最大宽度（默认 800）
 * @param {number} quality - JPEG 质量（默认 0.6）
 * @returns {Promise<string>} base64 字符串
 */
function compressImage(file, maxWidth = 800, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = (maxWidth / w) * h;
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 批量压缩图片
 * @param {FileList} files - 文件列表
 * @param {number} maxWidth
 * @param {number} quality
 * @returns {Promise<string[]>} base64 数组
 */
async function compressImages(files, maxWidth = 800, quality = 0.6) {
  const results = [];
  for (let i = 0; i < files.length; i++) {
    const base64 = await compressImage(files[i], maxWidth, quality);
    results.push(base64);
  }
  return results;
}

/**
 * 检查 localStorage 使用量（字节）
 */
function getStorageSize() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length * 2; // UTF-16 每字符 2 字节
    }
  }
  return total;
}

/**
 * 获取存储使用量的友好描述
 */
function getStorageSizeText() {
  const bytes = getStorageSize();
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

/**
 * 检查存储是否接近上限（4MB）
 */
function isStorageNearLimit() {
  return getStorageSize() > 4 * 1024 * 1024;
}
