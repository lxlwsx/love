// ============================================
// 通知中心组件 - 思炫宝宝的专属小窝
// 通知功能已集成在根组件 app.js 中
// 此文件为独立页面版本（备用）
// ============================================

window.Components = window.Components || {};
window.Components.NotificationCenter = {
  template: `
    <div class="page">
      <div class="card">
        <div class="card-title">🔔 消息通知</div>
        <div v-if="store.notifications.length === 0" class="empty-state" style="padding: 20px;">
          <div class="empty-icon">🔔</div>
          <div class="empty-text">暂时没有通知哦~</div>
        </div>
        <div v-else>
          <div v-for="n in [...store.notifications].reverse()" :key="n.id"
               style="display: flex; align-items: flex-start; gap: 10px; padding: 12px 0; border-bottom: 1px solid #f5f0f2;">
            <span style="font-size: 22px;">{{ getIcon(n.type) }}</span>
            <div style="flex: 1;">
              <div style="font-size: 14px; color: #333;">{{ n.message }}</div>
              <div style="font-size: 11px; color: #aaa; margin-top: 3px;">{{ relativeTime(n.timestamp) }}</div>
            </div>
            <span v-if="!n.read" style="width: 8px; height: 8px; background: var(--pink-dark); border-radius: 50%; flex-shrink: 0; margin-top: 6px;"></span>
          </div>
          <div class="text-center mt-12">
            <button class="btn btn-outline btn-small" @click="markAllRead">全部已读</button>
          </div>
        </div>
      </div>
    </div>
  `,
  setup: function () {
    var store = window.appStore;

    function getIcon(type) {
      if (type === 'call') return '📞';
      if (type === 'nani') return '🐱';
      return '🔔';
    }

    function markAllRead() {
      store.notifications.forEach(function (n) { n.read = true; });
    }

    return {
      store: store,
      getIcon: getIcon,
      markAllRead: markAllRead,
      relativeTime: relativeTime
    };
  }
};
