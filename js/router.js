// ============================================
// 路由管理 - 思炫宝宝的专属小窝
// 基于 Hash 的轻量路由模拟
// ============================================

// 路由映射表
var routeMap = {
  '#/': 'Home',
  '#/home': 'Home',
  '#/memory': 'MemoryWall',
  '#/circle': 'FriendCircle',
  '#/order': 'OrderFood',
  '#/profile': 'Profile',
  '#/meals': 'MealTracker',
  '#/outfit': 'OutfitWall',
  '#/anniversary': 'Anniversary'
};

// 底部导航对应的路由（用于高亮判断）
var navRoutes = {
  'Home': 'home',
  'MemoryWall': 'memory',
  'FriendCircle': 'circle',
  'OrderFood': 'order',
  'Profile': 'profile'
};

// 当前页面组件名（响应式）
var currentPage = Vue.ref('Home');

// 当前导航 tab
var currentNav = Vue.ref('home');

/**
 * 根据 hash 解析页面组件名
 */
function resolvePage(hash) {
  if (!hash || hash === '#' || hash === '#/') return 'Home';
  return routeMap[hash] || 'Home';
}

/**
 * 导航到指定页面
 */
function navigateTo(hash) {
  window.location.hash = hash;
}

/**
 * 更新当前页面
 */
function updatePage() {
  var hash = window.location.hash || '#/';
  currentPage.value = resolvePage(hash);

  // 更新导航高亮
  var navKey = navRoutes[currentPage.value];
  if (navKey) {
    currentNav.value = navKey;
  }
}

// 监听 hash 变化
window.addEventListener('hashchange', updatePage);

// 初始化
updatePage();

console.log('✅ 路由初始化完成，当前页面：' + currentPage.value);
