// ============================================
// 纪念日管理组件 - 思炫宝宝的专属小窝
// ============================================

window.Components = window.Components || {};
window.Components.Anniversary = {
  template: `
    <div class="page anniversary-page">

      <!-- 主纪念日卡片 -->
      <div class="card anniversary-main-card">
        <div style="font-size: 13px; color: var(--text-secondary);">💝 我们在一起已经</div>
        <div class="anniversary-big-number">{{ daysTogether }}</div>
        <div style="font-size: 14px; color: var(--text-secondary);">天 ❤️</div>
        <div style="font-size: 12px; color: var(--text-light); margin-top: 8px;">
          {{ formatDate(store.settings.startDate) }} 至今
        </div>
        <button class="btn btn-small btn-outline mt-12" @click="showEditStart = true" style="font-size: 12px;">
          ✏️ 修改开始日期
        </button>
      </div>

      <!-- 生日倒计时 -->
      <div class="card">
        <div class="card-title">🎂 生日倒计时</div>
        <div class="birthday-card" style="padding: 0; margin-bottom: 10px;">
          <span class="birthday-icon">👧</span>
          <div class="birthday-info">
            <div class="birthday-name">思炫宝宝的生日</div>
            <div v-if="store.settings.girlfriendBirthday" class="birthday-countdown">
              <template v-if="girlfriendDaysLeft === 0">🎉 今天是你的生日！生日快乐！🎂</template>
              <template v-else>还有 {{ girlfriendDaysLeft }} 天 🎂</template>
            </div>
            <div v-else style="font-size: 12px; color: var(--text-light);">未设置</div>
          </div>
          <button class="btn btn-small btn-outline" @click="editBirthday('girlfriend')" style="font-size: 11px; padding: 4px 10px;">
            ✏️
          </button>
        </div>
        <div class="birthday-card" style="padding: 0;">
          <span class="birthday-icon">👦</span>
          <div class="birthday-info">
            <div class="birthday-name">小亮的生日</div>
            <div v-if="store.settings.boyfriendBirthday" class="birthday-countdown">
              <template v-if="boyfriendDaysLeft === 0">🎉 今天是我的生日！</template>
              <template v-else>还有 {{ boyfriendDaysLeft }} 天 🎂</template>
            </div>
            <div v-else style="font-size: 12px; color: var(--text-light);">未设置</div>
          </div>
          <button class="btn btn-small btn-outline" @click="editBirthday('boyfriend')" style="font-size: 11px; padding: 4px 10px;">
            ✏️
          </button>
        </div>
      </div>

      <!-- 自定义纪念日 -->
      <div class="card">
        <div class="flex-between mb-12">
          <div class="card-title" style="margin-bottom: 0;">📅 重要纪念日</div>
          <button class="btn btn-pink btn-small" @click="showAddModal = true" style="font-size: 12px; padding: 6px 14px;">
            + 添加
          </button>
        </div>

        <div v-if="store.anniversaries.length === 0" class="empty-state" style="padding: 20px;">
          <div class="empty-icon">📅</div>
          <div class="empty-text">还没有纪念日呢~<br>添加一个吧！</div>
        </div>

        <div v-else>
          <div v-for="ann in sortedAnniversaries" :key="ann.id"
               class="anniversary-item"
               :class="{ nearby: isNearby(ann.date) }">
            <span class="anniversary-icon">{{ ann.isBirthday ? '🎂' : '💝' }}</span>
            <div class="anniversary-info">
              <div class="anniversary-title">{{ ann.title }}</div>
              <div class="anniversary-date">{{ formatDate(ann.date) }}</div>
            </div>
            <div class="anniversary-days">
              <template v-if="getDaysStatus(ann.date).future">
                {{ getDaysStatus(ann.date).days }}天后
              </template>
              <template v-else-if="getDaysStatus(ann.date).days === 0">
                🎉 今天！
              </template>
              <template v-else>
                {{ getDaysStatus(ann.date).days }}天前
              </template>
            </div>
            <div class="anniversary-actions">
              <button @click="editAnniversary(ann)">✏️</button>
              <button @click="deleteAnniversary(ann.id)">🗑️</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 修改开始日期弹窗 -->
      <div v-if="showEditStart" class="modal-overlay" @click.self="showEditStart = false">
        <div class="modal-content">
          <div class="modal-title">💝 修改恋爱开始日期</div>
          <div class="form-group">
            <input type="date" class="form-input" v-model="editStartDate">
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline btn-block" @click="showEditStart = false">取消</button>
            <button class="btn btn-pink btn-block" @click="saveStartDate">确定</button>
          </div>
        </div>
      </div>

      <!-- 修改生日弹窗 -->
      <div v-if="showEditBirthday" class="modal-overlay" @click.self="showEditBirthday = false">
        <div class="modal-content">
          <div class="modal-title">🎂 修改生日</div>
          <div class="form-group">
            <input type="date" class="form-input" v-model="editBirthdayValue">
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline btn-block" @click="showEditBirthday = false">取消</button>
            <button class="btn btn-pink btn-block" @click="saveBirthday">确定</button>
          </div>
        </div>
      </div>

      <!-- 添加/编辑纪念日弹窗 -->
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
        <div class="modal-content">
          <div class="modal-title">{{ editingAnn ? '✏️ 编辑纪念日' : '💝 添加纪念日' }}</div>
          <div class="form-group">
            <label class="form-label">标题</label>
            <input type="text" class="form-input" v-model="addTitle" placeholder="如：第一次约会">
          </div>
          <div class="form-group">
            <label class="form-label">日期</label>
            <input type="date" class="form-input" v-model="addDate">
          </div>
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-secondary); cursor: pointer;">
              <input type="checkbox" v-model="addIsBirthday" style="accent-color: var(--pink-dark);">
              这是生日
            </label>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline btn-block" @click="closeAddModal">取消</button>
            <button class="btn btn-pink btn-block" @click="saveAnniversary">保存</button>
          </div>
        </div>
      </div>

    </div>
  `,
  setup: function () {
    var store = window.appStore;
    var todayStr = getToday();

    var showEditStart = Vue.ref(false);
    var editStartDate = Vue.ref(store.settings.startDate);

    var showEditBirthday = Vue.ref(false);
    var editingBirthdayType = Vue.ref('');
    var editBirthdayValue = Vue.ref('');

    var showAddModal = Vue.ref(false);
    var editingAnn = Vue.ref(null);
    var addTitle = Vue.ref('');
    var addDate = Vue.ref('');
    var addIsBirthday = Vue.ref(false);

    // 在一起天数
    var daysTogether = Vue.computed(function () {
      return daysFromToday(store.settings.startDate);
    });

    // 思炫生日倒计时
    var girlfriendDaysLeft = Vue.computed(function () {
      if (!store.settings.girlfriendBirthday) return null;
      return daysUntilNext(store.settings.girlfriendBirthday);
    });

    // 小亮生日倒计时
    var boyfriendDaysLeft = Vue.computed(function () {
      if (!store.settings.boyfriendBirthday) return null;
      return daysUntilNext(store.settings.boyfriendBirthday);
    });

    // 计算距下一次生日天数
    function daysUntilNext(birthday) {
      var today = new Date(todayStr + 'T00:00:00');
      var bday = new Date(birthday + 'T00:00:00');
      var thisYear = today.getFullYear();
      var nextBday = new Date(thisYear, bday.getMonth(), bday.getDate());
      if (nextBday < today) {
        nextBday = new Date(thisYear + 1, bday.getMonth(), bday.getDate());
      }
      return Math.floor((nextBday - today) / 86400000);
    }

    // 排序的纪念日列表
    var sortedAnniversaries = Vue.computed(function () {
      return store.anniversaries.slice().sort(function (a, b) {
        return a.date.localeCompare(b.date);
      });
    });

    // 是否临近（3天内）
    function isNearby(date) {
      var status = getDaysStatus(date);
      return status.future && status.days <= 3;
    }

    // 获取天数状态
    function getDaysStatus(date) {
      var diff = daysBetween(todayStr, date);
      return { days: Math.abs(diff), future: diff >= 0 };
    }

    // 保存开始日期
    function saveStartDate() {
      store.settings.startDate = editStartDate.value;
      showEditStart.value = false;
    }

    // 编辑生日
    function editBirthday(type) {
      editingBirthdayType.value = type;
      editBirthdayValue.value = type === 'girlfriend' ? store.settings.girlfriendBirthday : store.settings.boyfriendBirthday;
      showEditBirthday.value = true;
    }

    function saveBirthday() {
      if (editingBirthdayType.value === 'girlfriend') {
        store.settings.girlfriendBirthday = editBirthdayValue.value;
      } else {
        store.settings.boyfriendBirthday = editBirthdayValue.value;
      }
      showEditBirthday.value = false;
    }

    // 添加/编辑纪念日
    function closeAddModal() {
      showAddModal.value = false;
      editingAnn.value = null;
      addTitle.value = '';
      addDate.value = '';
      addIsBirthday.value = false;
    }

    function editAnniversary(ann) {
      editingAnn.value = ann;
      addTitle.value = ann.title;
      addDate.value = ann.date;
      addIsBirthday.value = ann.isBirthday;
      showAddModal.value = true;
    }

    function saveAnniversary() {
      if (!addTitle.value.trim() || !addDate.value) return;
      if (editingAnn.value) {
        editingAnn.value.title = addTitle.value.trim();
        editingAnn.value.date = addDate.value;
        editingAnn.value.isBirthday = addIsBirthday.value;
      } else {
        store.anniversaries.push({
          id: generateId(),
          title: addTitle.value.trim(),
          date: addDate.value,
          isBirthday: addIsBirthday.value
        });
      }
      closeAddModal();
    }

    function deleteAnniversary(id) {
      var idx = store.anniversaries.findIndex(function (a) { return a.id === id; });
      if (idx >= 0) store.anniversaries.splice(idx, 1);
    }

    return {
      store: store,
      showEditStart: showEditStart,
      editStartDate: editStartDate,
      showEditBirthday: showEditBirthday,
      editBirthdayValue: editBirthdayValue,
      showAddModal: showAddModal,
      editingAnn: editingAnn,
      addTitle: addTitle,
      addDate: addDate,
      addIsBirthday: addIsBirthday,
      daysTogether: daysTogether,
      girlfriendDaysLeft: girlfriendDaysLeft,
      boyfriendDaysLeft: boyfriendDaysLeft,
      sortedAnniversaries: sortedAnniversaries,
      isNearby: isNearby,
      getDaysStatus: getDaysStatus,
      saveStartDate: saveStartDate,
      editBirthday: editBirthday,
      saveBirthday: saveBirthday,
      closeAddModal: closeAddModal,
      editAnniversary: editAnniversary,
      saveAnniversary: saveAnniversary,
      deleteAnniversary: deleteAnniversary,
      formatDate: formatDate
    };
  }
};
