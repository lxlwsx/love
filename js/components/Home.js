// ============================================
// 主页组件 - 思炫宝宝的专属小窝
// ============================================

window.Components = window.Components || {};
window.Components.Home = {
  template: `
    <div class="page home-page">

      <!-- 安装引导卡片 -->
      <div v-if="showInstallGuide" class="card install-card">
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <span style="font-size: 28px;">📱</span>
          <div style="flex: 1;">
            <div style="font-size: 14px; font-weight: 600; color: var(--pink-dark); margin-bottom: 4px;">
              添加到手机桌面，随时打开~
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.8;">
              <div v-if="isAndroid">
                <b>安卓手机：</b><br>
                点击浏览器右上角 <b>⋮ 三个点</b> →<br>
                找到 <b>「添加到主屏幕」</b> 或 <b>「安装应用」</b> →<br>
                点确认即可！
              </div>
              <div v-else-if="isIOS">
                <b>iPhone：</b><br>
                点击底部 <b>分享按钮 ↗️</b> →<br>
                往下滑找到 <b>「添加到主屏幕」</b> →<br>
                点右上角 <b>「添加」</b> 即可！
              </div>
              <div v-else>
                点浏览器菜单 → <b>「添加到主屏幕」</b><br>
                即可像 App 一样打开~
              </div>
            </div>
          </div>
          <button @click="dismissInstall" style="background: none; border: none; font-size: 18px; color: var(--text-light); cursor: pointer; padding: 2px;">✕</button>
        </div>
      </div>

      <!-- 欢迎卡片 -->
      <div class="card welcome-card">
        <div style="text-align: center;">
          <div style="font-size: 32px; margin-bottom: 6px;" class="decoration-bounce">🐱</div>
          <div style="font-size: 18px; font-weight: 700; color: var(--pink-dark); margin-bottom: 4px;">
            思炫宝宝，今天也要开心哦~
          </div>
          <div style="font-size: 13px; color: var(--text-secondary);">
            小亮一直在你身边 💕
          </div>
        </div>
      </div>

      <!-- 纪念日倒计时卡片 -->
      <div class="card anniversary-card" @click="navigateTo('#/anniversary')" style="cursor: pointer;">
        <div class="flex-between">
          <div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">
              💝 在一起已经
            </div>
            <div style="display: flex; align-items: baseline; gap: 4px;">
              <span style="font-size: 42px; font-weight: 800; color: var(--pink-dark); line-height: 1;">
                {{ daysTogether }}
              </span>
              <span style="font-size: 14px; color: var(--text-secondary); font-weight: 500;">天</span>
            </div>
            <div style="font-size: 11px; color: var(--text-light); margin-top: 4px;">
              {{ formatDate(appStore.settings.startDate) }} 至今 ❤️
            </div>
          </div>
          <div style="font-size: 36px; opacity: 0.8;" class="decoration-heart">💕</div>
        </div>
      </div>

      <!-- 今日步数卡片 -->
      <div class="card steps-card">
        <div class="flex-between" style="margin-bottom: 8px;">
          <div class="card-title" style="margin-bottom: 0;">🏃‍♀️ 今日步数</div>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-small btn-outline" @click="refreshSteps" style="padding: 4px 10px; font-size: 12px;">
              🎲 随机
            </button>
            <button class="btn btn-small btn-outline" @click="showEditSteps = true" style="padding: 4px 10px; font-size: 12px;">
              ✏️ 编辑
            </button>
          </div>
        </div>
        <div style="text-align: center; padding: 8px 0;">
          <div style="font-size: 36px; font-weight: 800; color: var(--pink-dark);">
            {{ appStore.steps.count.toLocaleString() }}
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
            步
          </div>
        </div>
        <div style="text-align: center; font-size: 13px; color: var(--rose); font-weight: 500;">
          {{ stepsMessage }}
        </div>
      </div>

      <!-- 编辑步数弹窗 -->
      <div v-if="showEditSteps" class="modal-overlay" @click.self="showEditSteps = false">
        <div class="modal-content">
          <div class="modal-title">✏️ 编辑步数</div>
          <div class="form-group">
            <input type="number" class="form-input" v-model.number="editStepsValue" placeholder="输入步数" min="0" max="99999">
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline btn-block" @click="showEditSteps = false">取消</button>
            <button class="btn btn-pink btn-block" @click="saveSteps">确定</button>
          </div>
        </div>
      </div>

      <!-- 今日穿搭缩略图 -->
      <div class="card outfit-card" @click="navigateTo('#/outfit')" style="cursor: pointer;">
        <div class="card-title">👗 今日穿搭</div>
        <div v-if="todayOutfit" style="border-radius: var(--radius-md); overflow: hidden;">
          <img :src="todayOutfit.base64" style="width: 100%; max-height: 200px; object-fit: cover; display: block;">
        </div>
        <div v-else class="upload-area" style="padding: 20px;">
          <div class="upload-icon">👗</div>
          <div class="upload-text">还没拍呢，今天穿什么可爱衣服呀~</div>
          <div style="font-size: 11px; color: var(--text-light); margin-top: 4px;">点击去穿搭墙上传</div>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="card">
        <div class="card-title">✨ 快捷入口</div>
        <div style="display: flex; justify-content: space-around; padding: 8px 0;">
          <button class="btn-round" @click="callBoyfriend" style="background: linear-gradient(135deg, #FFE0E6, #FFB6C1);">
            <span style="font-size: 28px;">📞</span>
            <span class="btn-label" style="color: var(--pink-dark);">呼叫男友</span>
          </button>
          <button class="btn-round" @click="navigateTo('#/meals')" style="background: linear-gradient(135deg, #FFF0E0, #FFD6A5);">
            <span style="font-size: 28px;">🍚</span>
            <span class="btn-label" style="color: #E8943A;">按时吃饭</span>
          </button>
          <button class="btn-round" @click="naniNvYou" style="background: linear-gradient(135deg, #E8DFFF, #D4B8FF);">
            <span style="font-size: 28px;">🫴</span>
            <span class="btn-label" style="color: #9B6FD4;">拿捏女友</span>
          </button>
        </div>
      </div>

      <!-- 呼叫男朋友弹窗 -->
      <div v-if="showCallPopup" class="modal-overlay" @click.self="showCallPopup = false">
        <div class="modal-content" style="text-align: center;">
          <div style="font-size: 64px; margin-bottom: 12px;" class="decoration-heart">💖</div>
          <div style="font-size: 17px; font-weight: 600; color: var(--pink-dark); line-height: 1.8; margin-bottom: 16px;">
            呼叫已发出！<br>
            男朋友李雪亮收到啦，<br>
            他马上来陪你~
          </div>
          <div style="font-size: 28px; margin-bottom: 16px;">
            <span class="decoration-bounce" style="display: inline-block;">🐱</span>
            <span class="decoration-heart" style="display: inline-block; margin: 0 4px;">💕</span>
            <span class="decoration-bounce" style="display: inline-block; animation-delay: 0.3s;">🐶</span>
          </div>
          <button class="btn btn-pink btn-block" @click="showCallPopup = false">知道啦~</button>
        </div>
      </div>

      <!-- 拿捏女友弹窗 -->
      <div v-if="showNaniPopup" class="modal-overlay" @click.self="showNaniPopup = false">
        <div class="modal-content" style="text-align: center;">
          <div style="font-size: 64px; margin-bottom: 12px; animation: wiggle 0.5s ease-in-out infinite;">🐾</div>
          <div style="font-size: 17px; font-weight: 600; color: var(--pink-dark); line-height: 1.8; margin-bottom: 16px;">
            被拿捏啦！<br>
            思炫宝宝快摸摸头~
          </div>
          <div style="font-size: 28px; margin-bottom: 16px;">
            <span style="display: inline-block; animation: wiggle 0.6s ease-in-out infinite;">🫳</span>
            <span style="display: inline-block; animation: wiggle 0.6s ease-in-out infinite 0.2s;">🐱</span>
          </div>
          <button class="btn btn-pink btn-block" @click="showNaniPopup = false">好嘛好嘛~</button>
        </div>
      </div>

    </div>
  `,
  setup: function () {
    var store = window.appStore;

    // 安装引导
    var ua = navigator.userAgent.toLowerCase();
    var isAndroid = /android/.test(ua);
    var isIOS = /iphone|ipad|ipod/.test(ua);
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    var installDismissed = Vue.ref(false);
    var showInstallGuide = Vue.computed(function () {
      return !isStandalone && !installDismissed.value;
    });

    function dismissInstall() {
      installDismissed.value = true;
    }

    var showEditSteps = Vue.ref(false);
    var editStepsValue = Vue.ref(store.steps.count);
    var showCallPopup = Vue.ref(false);
    var showNaniPopup = Vue.ref(false);

    // 计算在一起天数
    var daysTogether = Vue.computed(function () {
      return daysFromToday(store.settings.startDate);
    });

    // 今日穿搭
    var todayOutfit = Vue.computed(function () {
      var today = getToday();
      return store.outfits.find(function (o) { return o.date === today; }) || null;
    });

    // 步数鼓励语
    var stepsMessage = Vue.computed(function () {
      var count = store.steps.count;
      if (count < 3000) return '今天走得好少呀，出去散散步吧~ 🚶‍♀️';
      if (count < 6000) return '还不错哦，继续加油！💪';
      if (count < 10000) return '今天走了好多步，棒棒哒！🌟';
      if (count < 15000) return '哇，运动达人就是你！🏃‍♀️✨';
      return '太厉害了，今天暴走了！🏆🎉';
    });

    // 刷新步数
    function refreshSteps() {
      store.steps.count = Math.floor(Math.random() * 10001) + 5000;
      store.steps.lastUpdated = getToday();
    }

    // 保存编辑的步数
    function saveSteps() {
      if (editStepsValue.value >= 0 && editStepsValue.value <= 99999) {
        store.steps.count = editStepsValue.value;
        store.steps.lastUpdated = getToday();
        showEditSteps.value = false;
      }
    }

    // 呼叫男朋友
    function callBoyfriend() {
      showCallPopup.value = true;
      store.notifications.push({
        id: generateId(),
        type: 'call',
        message: '刚刚呼叫了男朋友 📞',
        timestamp: Date.now(),
        read: false
      });
    }

    // 拿捏女友
    function naniNvYou() {
      showNaniPopup.value = true;
      store.notifications.push({
        id: generateId(),
        type: 'nani',
        message: '刚刚被拿捏了 🐾',
        timestamp: Date.now(),
        read: false
      });
    }

    // 检查步数是否需要重置（新的一天）
    Vue.onMounted(function () {
      var today = getToday();
      if (store.steps.lastUpdated !== today) {
        refreshSteps();
      }
    });

    return {
      appStore: store,
      daysTogether: daysTogether,
      todayOutfit: todayOutfit,
      stepsMessage: stepsMessage,
      isAndroid: isAndroid,
      isIOS: isIOS,
      showInstallGuide: showInstallGuide,
      dismissInstall: dismissInstall,
      showEditSteps: showEditSteps,
      editStepsValue: editStepsValue,
      showCallPopup: showCallPopup,
      showNaniPopup: showNaniPopup,
      refreshSteps: refreshSteps,
      saveSteps: saveSteps,
      callBoyfriend: callBoyfriend,
      naniNvYou: naniNvYou,
      navigateTo: navigateTo,
      formatDate: formatDate,
      generateId: generateId
    };
  }
};
