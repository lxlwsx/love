// ============================================
// 状态管理 - 思炫宝宝的专属小窝
// 使用 Vue 3 reactive + localStorage 自动持久化
// ============================================

var STORAGE_KEY = 'love_app_data';

/**
 * 获取默认状态
 */
function getDefaultState() {
  return {
    settings: {
      startDate: '2024-01-01',
      boyfriendName: '小亮',
      girlfriendName: '思炫宝宝',
      girlfriendBirthday: '',
      boyfriendBirthday: '',
      boyfriendAvatar: '',
      girlfriendAvatar: '',
      theme: 'pink',
      welcomeText: '欢迎回来，思炫宝宝 🌸',
      enableNotifications: true
    },
    photos: [],          // 回忆墙照片
    meals: [],           // 三餐记录
    outfits: [],         // 穿搭照片
    notifications: [],   // 通知中心
    friendCircle: [],    // 朋友圈动态
    wishList: [],        // 点餐心愿清单
    anniversaries: [],   // 自定义纪念日
    steps: {
      count: 8888,
      lastUpdated: null
    }
  };
}

/**
 * 从 localStorage 加载状态
 */
function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      // 合并默认值（防止旧数据缺少新字段）
      var defaults = getDefaultState();
      return deepMerge(defaults, parsed);
    }
  } catch (e) {
    console.warn('加载本地数据失败，使用默认值', e);
  }
  return getDefaultState();
}

/**
 * 深度合并对象（source 的值覆盖 target）
 */
function deepMerge(target, source) {
  var result = Object.assign({}, target);
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  return result;
}

/**
 * 保存状态到 localStorage
 */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('保存数据失败，存储可能已满', e);
    alert('存储空间不足，建议删除一些旧照片来释放空间~');
  }
}

// 创建全局响应式状态
window.appStore = Vue.reactive(loadState());

// 深度监听变化，自动持久化
Vue.watch(
  window.appStore,
  function (newVal) {
    saveState(newVal);
  },
  { deep: true }
);

console.log('✅ 数据存储初始化完成，当前数据量：' + getStorageSizeText());
