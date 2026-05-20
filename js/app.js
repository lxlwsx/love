// ============================================
// 应用入口 - 思炫宝宝的专属小窝
// Vue 3 根组件与应用挂载
// ============================================

// 占位组件（后续步骤替换为真实组件）
window.Components = window.Components || {};

if (!window.Components.Home) {
  window.Components.Home = {
    template: '<div class="page"><div class="card text-center"><div class="empty-state"><div class="empty-icon">🏠</div><div class="empty-text">主页加载中...</div></div></div></div>'
  };
}
if (!window.Components.MemoryWall) {
  window.Components.MemoryWall = {
    template: '<div class="page"><div class="card text-center"><div class="empty-state"><div class="empty-icon">📸</div><div class="empty-text">回忆墙即将呈现~</div></div></div></div>'
  };
}
if (!window.Components.FriendCircle) {
  window.Components.FriendCircle = {
    template: '<div class="page"><div class="card text-center"><div class="empty-state"><div class="empty-icon">👥</div><div class="empty-text">朋友圈即将开放~</div></div></div></div>'
  };
}
if (!window.Components.OrderFood) {
  window.Components.OrderFood = {
    template: '<div class="page"><div class="card text-center"><div class="empty-state"><div class="empty-icon">🍜</div><div class="empty-text">点餐功能即将上线~</div></div></div></div>'
  };
}
if (!window.Components.Profile) {
  window.Components.Profile = {
    template: '<div class="page"><div class="card text-center"><div class="empty-state"><div class="empty-icon">👤</div><div class="empty-text">个人中心即将开放~</div></div></div></div>'
  };
}

// ============ 主题切换 ============
var themeColors = {
  pink: {
    primary: '#FFB6C1', light: '#FFD1DC', dark: '#FF69B4',
    bg: '#FFF5F7', bg2: '#FFE8EE', banner: 'linear-gradient(135deg, #FFB6C1 0%, #FF8FAB 40%, #FF69B4 100%)'
  },
  purple: {
    primary: '#D8B4FE', light: '#E9D5FF', dark: '#A855F7',
    bg: '#FAF5FF', bg2: '#F3E8FF', banner: 'linear-gradient(135deg, #D8B4FE 0%, #C084FC 40%, #A855F7 100%)'
  },
  blue: {
    primary: '#93C5FD', light: '#BFDBFE', dark: '#3B82F6',
    bg: '#EFF6FF', bg2: '#DBEAFE', banner: 'linear-gradient(135deg, #93C5FD 0%, #60A5FA 40%, #3B82F6 100%)'
  }
};

function applyTheme(theme) {
  var colors = themeColors[theme] || themeColors.pink;
  var root = document.documentElement;
  root.style.setProperty('--pink-primary', colors.primary);
  root.style.setProperty('--pink-light', colors.light);
  root.style.setProperty('--pink-dark', colors.dark);
  root.style.setProperty('--pink-bg', colors.bg);
  root.style.setProperty('--pink-bg2', colors.bg2);
  document.querySelector('.welcome-banner').style.background = colors.banner;
}

// ============ 浮动粒子 ============
var particleEmojis = ['💕', '⭐', '🌸', '🐱', '🐾', '✨', '💖', '🎀'];
var particleContainer = null;
var particleCount = 0;
var MAX_PARTICLES = 12;

function createParticle() {
  if (!particleContainer || particleCount >= MAX_PARTICLES) return;
  particleCount++;
  var el = document.createElement('span');
  el.className = 'particle';
  el.textContent = particleEmojis[Math.floor(Math.random() * particleEmojis.length)];
  el.style.left = Math.random() * 100 + '%';
  el.style.fontSize = (12 + Math.random() * 12) + 'px';
  el.style.animationDuration = (6 + Math.random() * 8) + 's';
  el.style.animationDelay = '0s';
  particleContainer.appendChild(el);
  setTimeout(function () {
    if (el.parentNode) el.parentNode.removeChild(el);
    particleCount--;
  }, 15000);
}

function startParticles() {
  particleContainer = document.getElementById('floating-particles');
  if (!particleContainer) return;
  setInterval(createParticle, 2500);
  // 初始几个粒子
  for (var i = 0; i < 3; i++) {
    setTimeout(createParticle, i * 800);
  }
}

// ============ 点击爱心爆散 ============
function createHeartBurst(x, y) {
  var hearts = ['💕', '💖', '❤️', '💗', '🐾'];
  for (var i = 0; i < 5; i++) {
    var el = document.createElement('span');
    el.className = 'heart-burst';
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    var angle = (Math.PI * 2 / 5) * i + Math.random() * 0.5;
    var distance = 40 + Math.random() * 40;
    el.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
    el.style.setProperty('--ty', Math.sin(angle) * distance - 30 + 'px');
    document.body.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 900);
  }
}

// 全局点击监听
document.addEventListener('click', function (e) {
  // 只在按钮和卡片点击时触发
  if (e.target.closest('.btn, .nav-item, .card, .food-item, .photo-card')) {
    createHeartBurst(e.clientX, e.clientY);
  }
});

// ============ Vue 应用 ============
var app = Vue.createApp({
  setup: function () {
    var store = window.appStore;
    var showNotificationPanel = Vue.ref(false);

    var unreadCount = Vue.computed(function () {
      return store.notifications.filter(function (n) { return !n.read; }).length;
    });

    // 自定义欢迎语
    var welcomeText = Vue.computed(function () {
      return store.settings.welcomeText || '欢迎回来，思炫宝宝 🌸';
    });

    function closeNotificationPanel() {
      showNotificationPanel.value = false;
    }

    function markAllRead() {
      store.notifications.forEach(function (n) { n.read = true; });
    }

    function getNotificationIcon(type) {
      if (type === 'call') return '📞';
      if (type === 'nani') return '🐱';
      return '🔔';
    }

    // 主题切换
    Vue.watch(function () { return store.settings.theme; }, function (newTheme) {
      applyTheme(newTheme);
    });

    Vue.onMounted(function () {
      applyTheme(store.settings.theme || 'pink');
      startParticles();
    });

    return {
      currentPage: currentPage,
      currentNav: currentNav,
      navigateTo: navigateTo,
      showNotificationPanel: showNotificationPanel,
      unreadCount: unreadCount,
      welcomeText: welcomeText,
      closeNotificationPanel: closeNotificationPanel,
      markAllRead: markAllRead,
      getNotificationIcon: getNotificationIcon,
      relativeTime: relativeTime,
      appStore: store
    };
  },
  template: `
    <div id="app-root">
      <!-- 浮动粒子容器 -->
      <div id="floating-particles" class="floating-particles"></div>

      <!-- 欢迎横幅 -->
      <div class="welcome-banner">
        <span class="banner-deco deco-kitty">🎀</span>
        <span class="banner-deco deco-dog">🐶</span>
        <span class="banner-deco deco-paw1">🐾</span>
        <span class="banner-deco deco-paw2">🐾</span>
        <span class="banner-deco deco-heart1">💕</span>
        <span class="banner-deco deco-heart2">✨</span>
        <span class="banner-deco deco-star">⭐</span>
        <span class="banner-text">{{ welcomeText }}</span>
        <button class="notification-btn" @click="showNotificationPanel = !showNotificationPanel">
          🔔
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
        </button>
      </div>

      <!-- 通知面板 -->
      <div v-if="showNotificationPanel" class="modal-overlay" @click.self="closeNotificationPanel">
        <div class="modal-content" style="max-height: 60vh;">
          <div class="modal-title">🔔 消息通知</div>
          <div v-if="appStore.notifications.length === 0" class="empty-state" style="padding: 20px;">
            <div class="empty-icon">🔔</div>
            <div class="empty-text">暂时没有通知哦~</div>
          </div>
          <div v-else>
            <div v-for="n in [...appStore.notifications].reverse()" :key="n.id"
                 style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
              <span style="font-size: 20px;">{{ getNotificationIcon(n.type) }}</span>
              <div style="flex: 1;">
                <div style="font-size: 14px; color: #333;">{{ n.message }}</div>
                <div style="font-size: 11px; color: #aaa; margin-top: 2px;">{{ relativeTime(n.timestamp) }}</div>
              </div>
              <span v-if="!n.read" style="width: 8px; height: 8px; background: var(--pink-dark); border-radius: 50%; flex-shrink: 0; margin-top: 6px;"></span>
            </div>
            <div class="text-center mt-12">
              <button class="btn btn-outline btn-small" @click="markAllRead">全部已读</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 页面内容 -->
      <div class="page-content">
        <component :is="currentPage"></component>
      </div>

      <!-- 底部导航 -->
      <nav class="bottom-nav">
        <button class="nav-item" :class="{ active: currentNav === 'home' }" @click="navigateTo('#/home')">
          <span class="paw-print">🐾</span>
          <span class="nav-icon-wrap"><span class="nav-icon">🏠</span></span>
          <span class="nav-label">首页</span>
          <span class="active-dot"></span>
        </button>
        <button class="nav-item" :class="{ active: currentNav === 'memory' }" @click="navigateTo('#/memory')">
          <span class="paw-print">🐾</span>
          <span class="nav-icon-wrap"><span class="nav-icon">📸</span></span>
          <span class="nav-label">回忆墙</span>
          <span class="active-dot"></span>
        </button>
        <button class="nav-item" :class="{ active: currentNav === 'circle' }" @click="navigateTo('#/circle')">
          <span class="paw-print">🐾</span>
          <span class="nav-icon-wrap"><span class="nav-icon">💕</span></span>
          <span class="nav-label">朋友圈</span>
          <span class="active-dot"></span>
        </button>
        <button class="nav-item" :class="{ active: currentNav === 'order' }" @click="navigateTo('#/order')">
          <span class="paw-print">🐾</span>
          <span class="nav-icon-wrap"><span class="nav-icon">🍰</span></span>
          <span class="nav-label">点餐</span>
          <span class="active-dot"></span>
        </button>
        <button class="nav-item" :class="{ active: currentNav === 'profile' }" @click="navigateTo('#/profile')">
          <span class="paw-print">🐾</span>
          <span class="nav-icon-wrap"><span class="nav-icon">🐱</span></span>
          <span class="nav-label">我的</span>
          <span class="active-dot"></span>
        </button>
      </nav>
    </div>
  `
});

// 注册所有组件
for (var name in window.Components) {
  if (window.Components.hasOwnProperty(name)) {
    app.component(name, window.Components[name]);
  }
}

// 挂载应用
app.mount('#app');
console.log('✅ 思炫宝宝的专属小窝已启动 💕');
