// ============================================
// 穿搭照片墙组件 - 思炫宝宝的专属小窝
// ============================================

window.Components = window.Components || {};
window.Components.OutfitWall = {
  template: `
    <div class="page outfit-page">

      <!-- 顶部导航 -->
      <div class="page-top-bar">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">‹</span> 返回
        </button>
        <div class="page-top-title">👗 今日穿搭</div>
        <div class="page-top-right"></div>
      </div>

      <!-- 今日穿搭 -->
      <div class="card outfit-today">
        <div v-if="todayOutfit" style="border-radius: var(--radius-lg); overflow: hidden;">
          <img :src="todayOutfit.base64" class="outfit-today-img" @click="viewPhoto(todayOutfit.base64)">
          <div style="display: flex; gap: 8px; margin-top: 10px;">
            <button class="btn btn-small btn-outline" style="flex: 1;" @click="uploadOutfit">🔄 换一套</button>
            <button class="btn btn-small" style="flex: 1; background: #FFE0E0; color: #E85555; border: none;" @click="deleteToday">🗑️ 删除</button>
          </div>
        </div>
        <div v-else class="upload-area" @click="uploadOutfit" style="padding: 30px;">
          <div class="upload-icon">👗</div>
          <div class="upload-text">还没拍呢，今天穿什么可爱衣服呀~</div>
          <div style="font-size: 11px; color: var(--text-light); margin-top: 6px;">点击上传今日穿搭</div>
        </div>
      </div>

      <!-- 日历视图 -->
      <div class="card calendar-card">
        <div class="calendar-header">
          <button class="date-arrow" @click="changeMonth(-1)">◀</button>
          <div style="font-size: 16px; font-weight: 600; color: var(--text-primary);">
            {{ calendarYear }}年{{ calendarMonth + 1 }}月
          </div>
          <button class="date-arrow" @click="changeMonth(1)">▶</button>
        </div>

        <!-- 星期头部 -->
        <div class="calendar-grid">
          <div v-for="w in weekdays" :key="w" class="calendar-weekday">{{ w }}</div>
          <!-- 日期格子 -->
          <div v-for="(day, idx) in calendarDays" :key="idx"
               class="calendar-day"
               :class="{
                 empty: day.empty,
                 today: day.isToday,
                 'has-photo': day.outfit
               }"
               @click="day.date && clickDay(day)">
            <span v-if="!day.empty" class="day-number">{{ day.day }}</span>
            <img v-if="day.outfit" :src="day.outfit.base64" class="day-thumb">
            <span v-else-if="!day.empty && day.isPast" class="day-dot"></span>
          </div>
        </div>
      </div>

      <!-- 隐藏文件输入 -->
      <input type="file" accept="image/*" capture="camera" ref="fileInput" class="hidden-input" @change="onFileChange">

      <!-- 查看大图 -->
      <div v-if="viewPhotoSrc" class="modal-overlay" @click.self="viewPhotoSrc = null">
        <div class="modal-content" style="padding: 12px; max-width: 380px;">
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
    var viewPhotoSrc = Vue.ref(null);
    var todayStr = getToday();

    var calendarYear = Vue.ref(new Date().getFullYear());
    var calendarMonth = Vue.ref(new Date().getMonth());

    var weekdays = ['日', '一', '二', '三', '四', '五', '六'];

    // 今日穿搭
    var todayOutfit = Vue.computed(function () {
      return store.outfits.find(function (o) { return o.date === todayStr; }) || null;
    });

    // 日历数据
    var calendarDays = Vue.computed(function () {
      var year = calendarYear.value;
      var month = calendarMonth.value;
      var firstDay = new Date(year, month, 1).getDay();
      var daysInMonth = new Date(year, month + 1, 0).getDate();
      var result = [];

      // 填充空格
      for (var i = 0; i < firstDay; i++) {
        result.push({ empty: true });
      }

      for (var d = 1; d <= daysInMonth; d++) {
        var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        var outfit = store.outfits.find(function (o) { return o.date === dateStr; }) || null;
        result.push({
          day: d,
          date: dateStr,
          isToday: dateStr === todayStr,
          isPast: dateStr <= todayStr,
          outfit: outfit
        });
      }

      return result;
    });

    // 上传穿搭
    function uploadOutfit() {
      fileInput.value.click();
    }

    async function onFileChange(e) {
      var files = e.target.files;
      if (!files || files.length === 0) return;
      var base64 = await compressImage(files[0], 800, 0.6);

      var existing = store.outfits.findIndex(function (o) { return o.date === todayStr; });
      if (existing >= 0) {
        store.outfits[existing].base64 = base64;
        store.outfits[existing].createdAt = Date.now();
      } else {
        store.outfits.push({
          id: generateId(),
          base64: base64,
          date: todayStr,
          createdAt: Date.now()
        });
      }
      e.target.value = '';
    }

    function deleteToday() {
      var idx = store.outfits.findIndex(function (o) { return o.date === todayStr; });
      if (idx >= 0) store.outfits.splice(idx, 1);
    }

    function changeMonth(delta) {
      var m = calendarMonth.value + delta;
      if (m < 0) { calendarMonth.value = 11; calendarYear.value--; }
      else if (m > 11) { calendarMonth.value = 0; calendarYear.value++; }
      else { calendarMonth.value = m; }
    }

    function clickDay(day) {
      if (day.outfit) {
        viewPhotoSrc.value = day.outfit.base64;
      }
    }

    function viewPhoto(src) {
      viewPhotoSrc.value = src;
    }

    return {
      store: store,
      fileInput: fileInput,
      viewPhotoSrc: viewPhotoSrc,
      todayOutfit: todayOutfit,
      calendarYear: calendarYear,
      calendarMonth: calendarMonth,
      weekdays: weekdays,
      calendarDays: calendarDays,
      uploadOutfit: uploadOutfit,
      onFileChange: onFileChange,
      deleteToday: deleteToday,
      changeMonth: changeMonth,
      clickDay: clickDay,
      viewPhoto: viewPhoto,
      goBack: function () { navigateTo('#/home'); }
    };
  }
};
