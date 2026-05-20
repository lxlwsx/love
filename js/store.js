// ============================================
// 状态管理 - 思炫宝宝的专属小窝
// 支持 GitHub 云端同步 + localStorage 离线存储
// ============================================

var STORAGE_KEY = 'love_app_data';
var SYNC_CONFIG_KEY = 'love_app_sync';
var GITHUB_REPO = 'lxlwsx/love';
var DATA_FILE = 'data.json';

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
      enableNotifications: true,
      githubToken: ''
    },
    photos: [],
    meals: [],
    outfits: [],
    notifications: [],
    friendCircle: [],
    wishList: [],
    anniversaries: [],
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
      var defaults = getDefaultState();
      return deepMerge(defaults, parsed);
    }
  } catch (e) {
    console.warn('加载本地数据失败，使用默认值', e);
  }
  return getDefaultState();
}

/**
 * 深度合并对象
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
  }
}

// ============================================
// GitHub 云端同步
// ============================================

var syncTimer = null;
var syncInProgress = false;
var syncStatus = Vue.ref('idle'); // idle, syncing, success, error
var lastSyncTime = Vue.ref(null);

/**
 * 从 GitHub 拉取最新数据
 */
function pullFromGithub() {
  var token = window.appStore && window.appStore.settings && window.appStore.settings.githubToken;
  if (!token) return Promise.resolve(false);

  var url = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + DATA_FILE;

  return fetch(url, {
    headers: {
      'Authorization': 'token ' + token,
      'Accept': 'application/vnd.github.v3+json'
    }
  })
  .then(function (res) {
    if (!res.ok) throw new Error('拉取失败: ' + res.status);
    return res.json();
  })
  .then(function (data) {
    if (data.content) {
      var content = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
      var remoteState = JSON.parse(content);

      // 合并远端数据到本地（远端优先）
      var localState = JSON.parse(JSON.stringify(window.appStore));
      var merged = mergeStates(localState, remoteState);

      // 更新本地 store
      Object.keys(merged).forEach(function (key) {
        window.appStore[key] = merged[key];
      });

      saveState(window.appStore);
      lastSyncTime.value = Date.now();
      console.log('✅ 从 GitHub 拉取数据成功');
      return true;
    }
    return false;
  })
  .catch(function (err) {
    console.warn('GitHub 拉取失败:', err.message);
    return false;
  });
}

/**
 * 推送数据到 GitHub
 */
function pushToGithub() {
  var token = window.appStore && window.appStore.settings && window.appStore.settings.githubToken;
  if (!token || syncInProgress) return Promise.resolve(false);

  syncInProgress = true;
  syncStatus.value = 'syncing';

  // 先获取当前文件 SHA
  var url = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + DATA_FILE;

  return fetch(url, {
    headers: {
      'Authorization': 'token ' + token,
      'Accept': 'application/vnd.github.v3+json'
    }
  })
  .then(function (res) {
    if (res.status === 404) return { sha: null };
    if (!res.ok) throw new Error('获取文件信息失败');
    return res.json();
  })
  .then(function (fileInfo) {
    var content = JSON.stringify(window.appStore, null, 2);
    var encodedContent = btoa(unescape(encodeURIComponent(content)));

    var body = {
      message: '📱 更新数据 ' + new Date().toLocaleString('zh-CN'),
      content: encodedContent
    };
    if (fileInfo.sha) {
      body.sha = fileInfo.sha;
    }

    return fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  })
  .then(function (res) {
    if (!res.ok) throw new Error('推送失败: ' + res.status);
    syncStatus.value = 'success';
    lastSyncTime.value = Date.now();
    console.log('✅ 推送数据到 GitHub 成功');
    syncInProgress = false;
    return true;
  })
  .catch(function (err) {
    console.warn('GitHub 推送失败:', err.message);
    syncStatus.value = 'error';
    syncInProgress = false;
    return false;
  });
}

/**
 * 合并两个状态（远端优先，但保留本地独有的数据）
 */
function mergeStates(local, remote) {
  var merged = deepMerge(getDefaultState(), remote);

  // 数组类型：合并去重（以 createdAt 较新的为准）
  var arrayFields = ['photos', 'meals', 'outfits', 'notifications', 'friendCircle', 'wishList', 'anniversaries'];
  arrayFields.forEach(function (field) {
    var localArr = local[field] || [];
    var remoteArr = remote[field] || [];
    var map = {};

    // 先放远端的
    remoteArr.forEach(function (item) {
      if (item.id) map[item.id] = item;
    });
    // 再放本地的（覆盖同 id 的如果本地更新）
    localArr.forEach(function (item) {
      if (item.id) {
        if (!map[item.id] || (item.createdAt && item.createdAt > (map[item.id].createdAt || 0))) {
          map[item.id] = item;
        }
      }
    });

    merged[field] = Object.values(map);
  });

  return merged;
}

/**
 * 防抖推送（修改后 3 秒自动同步）
 */
function debouncedPush() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(function () {
    pushToGithub();
  }, 3000);
}

// ============================================
// 初始化
// ============================================

// 创建全局响应式状态
window.appStore = Vue.reactive(loadState());

// 深度监听变化，自动持久化 + 防抖推送
Vue.watch(
  window.appStore,
  function (newVal) {
    saveState(newVal);
    // 如果配置了 token，自动推送到 GitHub
    if (newVal.settings && newVal.settings.githubToken) {
      debouncedPush();
    }
  },
  { deep: true }
);

// 页面加载后自动从 GitHub 拉取
Vue.onMounted(function () {
  if (window.appStore.settings.githubToken) {
    setTimeout(function () {
      pullFromGithub();
    }, 1000);
  }
});

console.log('✅ 数据存储初始化完成，当前数据量：' + getStorageSizeText());
