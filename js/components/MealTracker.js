// ============================================
// 三餐记录组件 - 思炫宝宝的专属小窝
// ============================================

window.Components = window.Components || {};
window.Components.MealTracker = {
  template: `
    <div class="page meal-page">

      <!-- 顶部导航 -->
      <div class="meal-top-bar">
        <button class="btn btn-small btn-outline" @click="goBack" style="padding: 6px 12px;">
          ← 返回
        </button>
        <div style="font-size: 16px; font-weight: 700; color: var(--pink-dark);">
          🍚 按时吃饭
        </div>
        <div style="width: 60px;"></div>
      </div>

      <!-- 日期选择 -->
      <div class="card meal-date-bar">
        <button class="date-arrow" @click="changeDate(-1)">◀</button>
        <div class="date-display">
          <div style="font-size: 15px; font-weight: 600; color: var(--text-primary);">
            {{ dateLabel }}
          </div>
          <div style="font-size: 11px; color: var(--text-light); margin-top: 2px;">
            {{ currentDate }}
          </div>
        </div>
        <button class="date-arrow" @click="changeDate(1)" :disabled="isToday">▶</button>
      </div>

      <!-- 三餐板块 -->
      <div v-for="meal in mealTypes" :key="meal.type" class="card meal-section">
        <div class="meal-header">
          <span style="font-size: 24px;">{{ meal.icon }}</span>
          <div>
            <div style="font-size: 15px; font-weight: 600; color: var(--text-primary);">{{ meal.label }}</div>
            <div style="font-size: 11px; color: var(--text-light);">{{ meal.time }}</div>
          </div>
        </div>

        <!-- 已有照片 -->
        <div v-if="getMealPhoto(meal.type)" class="meal-photo-wrap">
          <img :src="getMealPhoto(meal.type).base64" class="meal-photo" @click="viewPhoto(getMealPhoto(meal.type).base64)">
          <div style="display: flex; gap: 8px; margin-top: 10px;">
            <button class="btn btn-small btn-outline" style="flex: 1; padding: 6px;" @click="uploadMeal(meal.type)">
              🔄 换一张
            </button>
            <button class="btn btn-small" style="flex: 1; padding: 6px; background: #FFE0E0; color: #E85555; border: none;" @click="deleteMeal(meal.type)">
              🗑️ 删除
            </button>
          </div>
        </div>

        <!-- 未上传 -->
        <div v-else class="meal-upload" @click="uploadMeal(meal.type)">
          <div style="font-size: 32px; margin-bottom: 6px;">📷</div>
          <div style="font-size: 13px; color: var(--text-secondary);">点击拍照 / 上传照片</div>
        </div>

        <!-- 提示语 -->
        <div class="meal-tip">
          <span class="decoration-bounce" style="display: inline-block;">{{ meal.tipIcon }}</span>
          {{ meal.tip }}
        </div>
      </div>

      <!-- 历史记录 -->
      <div class="card" v-if="historyDates.length > 0">
        <div class="card-title">📅 历史记录</div>
        <div class="history-grid">
          <div v-for="d in historyDates" :key="d"
               class="history-item"
               :class="{ 'history-today': d === todayStr }"
               @click="currentDate = d">
            <div style="font-size: 12px; font-weight: 600; color: var(--text-primary);">{{ formatShortDate(d) }}</div>
            <div class="history-icons">
              <span v-if="hasMeal(d, 'breakfast')" style="font-size: 14px;">🌅</span>
              <span v-if="hasMeal(d, 'lunch')" style="font-size: 14px;">☀️</span>
              <span v-if="hasMeal(d, 'dinner')" style="font-size: 14px;">🌙</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 隐藏文件输入 -->
      <input type="file" accept="image/*" capture="camera" ref="fileInput" class="hidden-input" @change="onFileChange">

      <!-- 查看大图弹窗 -->
      <div v-if="viewPhotoSrc" class="modal-overlay" @click.self="viewPhotoSrc = null">
        <div class="modal-content" style="padding: 12px; max-width: 360px;">
          <img :src="viewPhotoSrc" style="width: 100%; border-radius: var(--radius-md); display: block;">
          <div class="text-center mt-12">
            <button class="btn btn-outline btn-small" @click="viewPhotoSrc = null">关闭</button>
          </div>
        </div>
      </div>

    </div>
  `,
  setup: function () {
    var store = window.appStore;
    var fileInput = Vue.ref(null);
    var currentDate = Vue.ref(getToday());
    var uploadingType = Vue.ref('');
    var viewPhotoSrc = Vue.ref(null);
    var todayStr = getToday();

    var mealTypes = [
      { type: 'breakfast', label: '早餐', icon: '🌅', time: '7:00 - 9:00', tip: '要记得按时吃饭哦，早餐很重要~', tipIcon: '☀️' },
      { type: 'lunch', label: '午餐', icon: '☀️', time: '11:30 - 13:00', tip: '午餐要吃饱饱，下午才有力气~', tipIcon: '💪' },
      { type: 'dinner', label: '晚餐', icon: '🌙', time: '17:30 - 19:00', tip: '晚餐吃好一点，犒劳辛苦一天的自己~', tipIcon: '🌟' }
    ];

    // 日期标签
    var dateLabel = Vue.computed(function () {
      if (currentDate.value === todayStr) return '今天';
      var d = new Date(currentDate.value + 'T00:00:00');
      var today = new Date(todayStr + 'T00:00:00');
      var diff = Math.floor((today - d) / 86400000);
      if (diff === 1) return '昨天';
      if (diff === 2) return '前天';
      return formatDate(currentDate.value);
    });

    var isToday = Vue.computed(function () {
      return currentDate.value === todayStr;
    });

    // 获取某餐照片
    function getMealPhoto(type) {
      return store.meals.find(function (m) {
        return m.date === currentDate.value && m.type === type;
      }) || null;
    }

    // 上传某餐
    function uploadMeal(type) {
      uploadingType.value = type;
      fileInput.value.click();
    }

    // 文件选择回调
    async function onFileChange(e) {
      var files = e.target.files;
      if (!files || files.length === 0) return;
      var type = uploadingType.value;
      var base64 = await compressImage(files[0], 600, 0.55);

      // 查找是否已有该餐记录
      var existing = store.meals.findIndex(function (m) {
        return m.date === currentDate.value && m.type === type;
      });

      if (existing >= 0) {
        store.meals[existing].base64 = base64;
        store.meals[existing].createdAt = Date.now();
      } else {
        store.meals.push({
          id: generateId(),
          type: type,
          base64: base64,
          date: currentDate.value,
          createdAt: Date.now()
        });
      }

      // 清空 input
      e.target.value = '';
    }

    // 删除某餐
    function deleteMeal(type) {
      var idx = store.meals.findIndex(function (m) {
        return m.date === currentDate.value && m.type === type;
      });
      if (idx >= 0) {
        store.meals.splice(idx, 1);
      }
    }

    // 切换日期
    function changeDate(delta) {
      var d = new Date(currentDate.value + 'T00:00:00');
      d.setDate(d.getDate() + delta);
      var newDate = d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
      if (newDate <= todayStr) {
        currentDate.value = newDate;
      }
    }

    // 查看大图
    function viewPhoto(src) {
      viewPhotoSrc.value = src;
    }

    // 历史日期列表（最近 14 天有记录的）
    var historyDates = Vue.computed(function () {
      var dates = {};
      store.meals.forEach(function (m) {
        if (m.date !== todayStr) {
          dates[m.date] = true;
        }
      });
      return Object.keys(dates).sort().reverse().slice(0, 14);
    });

    // 某天是否有某餐
    function hasMeal(date, type) {
      return store.meals.some(function (m) {
        return m.date === date && m.type === type;
      });
    }

    // 格式化短日期
    function formatShortDate(dateStr) {
      var parts = dateStr.split('-');
      return parseInt(parts[1]) + '/' + parseInt(parts[2]);
    }

    // 返回主页
    function goBack() {
      navigateTo('#/home');
    }

    return {
      store: store,
      fileInput: fileInput,
      currentDate: currentDate,
      todayStr: todayStr,
      mealTypes: mealTypes,
      dateLabel: dateLabel,
      isToday: isToday,
      getMealPhoto: getMealPhoto,
      uploadMeal: uploadMeal,
      onFileChange: onFileChange,
      deleteMeal: deleteMeal,
      changeDate: changeDate,
      viewPhotoSrc: viewPhotoSrc,
      viewPhoto: viewPhoto,
      historyDates: historyDates,
      hasMeal: hasMeal,
      formatShortDate: formatShortDate,
      goBack: goBack,
      formatDate: formatDate,
      navigateTo: navigateTo
    };
  }
};
