// ============================================
// 情侣设置中心 - 思炫宝宝的专属小窝
// ============================================

window.Components = window.Components || {};
window.Components.Profile = {
  template: `
    <div class="page profile-page">

      <!-- 情侣头像区域 -->
      <div class="card couple-card">
        <div class="couple-avatars">
          <div class="avatar-wrap" @click="uploadAvatar('boyfriend')">
            <div class="avatar-circle" :class="'avatar-boy'">
              <img v-if="store.settings.boyfriendAvatar" :src="store.settings.boyfriendAvatar" class="avatar-img">
              <span v-else>🐱</span>
            </div>
            <div class="avatar-name">{{ store.settings.boyfriendName }}</div>
            <div class="avatar-hint">点击更换</div>
          </div>
          <div class="couple-heart">
            <span class="decoration-heart" style="font-size: 32px;">💕</span>
            <div class="couple-days">{{ daysTogether }}天</div>
          </div>
          <div class="avatar-wrap" @click="uploadAvatar('girlfriend')">
            <div class="avatar-circle" :class="'avatar-girl'">
              <img v-if="store.settings.girlfriendAvatar" :src="store.settings.girlfriendAvatar" class="avatar-img">
              <span v-else>🐰</span>
            </div>
            <div class="avatar-name">{{ store.settings.girlfriendName }}</div>
            <div class="avatar-hint">点击更换</div>
          </div>
        </div>
        <div class="couple-status">
          <span class="decoration-bounce">💑</span>
          我们已经在一起 <span style="color: var(--pink-dark); font-weight: 700;">{{ daysTogether }}</span> 天啦~
        </div>
      </div>

      <!-- 隐藏文件输入 -->
      <input type="file" accept="image/*" ref="avatarInput" class="hidden-input" @change="onAvatarChange">

      <!-- 情侣信息管理 -->
      <div class="card">
        <div class="card-title">💑 情侣信息</div>
        <div class="settings-list">
          <div class="settings-item" @click="editField('boyfriendName')">
            <span class="settings-icon">🐱</span>
            <span class="settings-label">男朋友昵称</span>
            <span class="settings-value">{{ store.settings.boyfriendName }}</span>
            <span class="settings-arrow">›</span>
          </div>
          <div class="settings-item" @click="editField('girlfriendName')">
            <span class="settings-icon">🐰</span>
            <span class="settings-label">女朋友昵称</span>
            <span class="settings-value">{{ store.settings.girlfriendName }}</span>
            <span class="settings-arrow">›</span>
          </div>
          <div class="settings-item" @click="editDate('startDate')">
            <span class="settings-icon">💝</span>
            <span class="settings-label">恋爱开始日</span>
            <span class="settings-value">{{ formatDate(store.settings.startDate) }}</span>
            <span class="settings-arrow">›</span>
          </div>
          <div class="settings-item" @click="editDate('boyfriendBirthday')">
            <span class="settings-icon">🎂</span>
            <span class="settings-label">小亮的生日</span>
            <span class="settings-value">{{ store.settings.boyfriendBirthday ? formatDate(store.settings.boyfriendBirthday) : '未设置' }}</span>
            <span class="settings-arrow">›</span>
          </div>
          <div class="settings-item" @click="editDate('girlfriendBirthday')">
            <span class="settings-icon">🎂</span>
            <span class="settings-label">思炫的生日</span>
            <span class="settings-value">{{ store.settings.girlfriendBirthday ? formatDate(store.settings.girlfriendBirthday) : '未设置' }}</span>
            <span class="settings-arrow">›</span>
          </div>
        </div>
      </div>

      <!-- 我们的小窝统计 -->
      <div class="card">
        <div class="card-title">🏠 我们的小窝</div>
        <div class="stats-grid">
          <div class="stat-box" @click="navigateTo('#/memory')">
            <div class="stat-num">{{ store.photos.length }}</div>
            <div class="stat-label">📸 回忆照片</div>
          </div>
          <div class="stat-box" @click="navigateTo('#/circle')">
            <div class="stat-num">{{ store.friendCircle.length }}</div>
            <div class="stat-label">💕 朋友圈</div>
          </div>
          <div class="stat-box" @click="navigateTo('#/meals')">
            <div class="stat-num">{{ store.meals.length }}</div>
            <div class="stat-label">🍚 餐食记录</div>
          </div>
          <div class="stat-box" @click="navigateTo('#/outfit')">
            <div class="stat-num">{{ store.outfits.length }}</div>
            <div class="stat-label">👗 穿搭照片</div>
          </div>
          <div class="stat-box" @click="navigateTo('#/order')">
            <div class="stat-num">{{ store.wishList.length }}</div>
            <div class="stat-label">🍰 心愿美食</div>
          </div>
          <div class="stat-box" @click="navigateTo('#/anniversary')">
            <div class="stat-num">{{ store.anniversaries.length }}</div>
            <div class="stat-label">📅 纪念日</div>
          </div>
        </div>
      </div>

      <!-- 个性化设置 -->
      <div class="card">
        <div class="card-title">🎨 个性化</div>
        <div class="settings-list">
          <div class="settings-item">
            <span class="settings-icon">🌈</span>
            <span class="settings-label">主题风格</span>
            <div class="theme-switch">
              <button v-for="t in themes" :key="t.value"
                      class="theme-btn" :class="{ active: store.settings.theme === t.value }"
                      :style="{ background: t.color }"
                      @click="store.settings.theme = t.value">
                {{ t.icon }}
              </button>
            </div>
          </div>
          <div class="settings-item" @click="editField('welcomeText')">
            <span class="settings-icon">💬</span>
            <span class="settings-label">欢迎语</span>
            <span class="settings-value" style="max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ store.settings.welcomeText }}</span>
            <span class="settings-arrow">›</span>
          </div>
          <div class="settings-item">
            <span class="settings-icon">🔔</span>
            <span class="settings-label">通知提醒</span>
            <label class="toggle-switch">
              <input type="checkbox" v-model="store.settings.enableNotifications">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="card">
        <div class="card-title">💾 数据管理</div>
        <div class="settings-list">
          <div class="settings-item">
            <span class="settings-icon">📊</span>
            <span class="settings-label">存储使用量</span>
            <span class="settings-value">{{ storageSize }}</span>
          </div>
          <div class="settings-item" @click="exportData">
            <span class="settings-icon">📤</span>
            <span class="settings-label">导出数据</span>
            <span class="settings-arrow">›</span>
          </div>
          <div class="settings-item" @click="$refs.importInput.click()">
            <span class="settings-icon">📥</span>
            <span class="settings-label">导入数据</span>
            <span class="settings-arrow">›</span>
          </div>
          <div class="settings-item" @click="clearData" style="color: #E85555;">
            <span class="settings-icon">🗑️</span>
            <span class="settings-label" style="color: #E85555;">清除所有数据</span>
            <span class="settings-arrow" style="color: #E85555;">›</span>
          </div>
        </div>
        <input type="file" accept=".json" ref="importInput" class="hidden-input" @change="importData">
      </div>

      <!-- 云端同步 -->
      <div class="card">
        <div class="card-title">☁️ 云端同步</div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.6;">
          配置后，数据自动同步到 GitHub，换手机或多人共享都 OK~
        </div>

        <div class="settings-list">
          <div class="settings-item">
            <span class="settings-icon">🔑</span>
            <span class="settings-label">GitHub Token</span>
            <span class="settings-value" style="max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              {{ store.settings.githubToken ? '已配置' : '未配置' }}
            </span>
          </div>
        </div>

        <div class="form-group" style="margin-top: 10px;">
          <input type="password" class="form-input" v-model="tokenInput"
                 placeholder="粘贴你的 GitHub Personal Access Token"
                 style="font-size: 13px;">
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="btn btn-pink btn-small" style="flex: 1;" @click="saveToken">
            💾 保存 Token
          </button>
          <button class="btn btn-outline btn-small" style="flex: 1;" @click="manualSync"
                          :disabled="syncing">
            {{ syncing ? '⏳ 同步中...' : '🔄 手动同步' }}
          </button>
        </div>

        <div v-if="syncStatusText" style="text-align: center; margin-top: 8px; font-size: 12px;"
             :style="{ color: syncStatusText.includes('成功') ? '#4CAF50' : syncStatusText.includes('失败') ? '#E85555' : 'var(--text-secondary)' }">
          {{ syncStatusText }}
        </div>

        <div style="margin-top: 10px; padding: 10px; background: var(--pink-soft); border-radius: var(--radius-sm); font-size: 11px; color: var(--text-secondary); line-height: 1.8;">
          <b>获取 Token 步骤：</b><br>
          1. 打开 github.com → 登录 → 右上角头像 → Settings<br>
          2. 左下角 Developer settings → Personal access tokens → Tokens (classic)<br>
          3. Generate new token → 勾选 <b>repo</b> 权限 → 生成<br>
          4. 复制 token 粘贴到上面的输入框
        </div>
      </div>

      <!-- 关于 -->
      <div class="card about-card">
        <div style="font-size: 32px; margin-bottom: 8px;" class="decoration-bounce">💕</div>
        <div style="font-size: 16px; font-weight: 700; color: var(--pink-dark); margin-bottom: 4px;">
          思炫宝宝的专属小窝
        </div>
        <div style="font-size: 12px; color: var(--text-light); line-height: 1.8;">
          Version 1.0.0<br>
          由小亮用心制作 💖<br>
          专属于我们的小世界
        </div>
        <div style="margin-top: 12px; font-size: 20px;">
          <span class="decoration-paw">🐱</span>
          <span class="decoration-heart">💕</span>
          <span class="decoration-bounce">🐰</span>
        </div>
      </div>

      <!-- 编辑文字弹窗 -->
      <div v-if="showEditField" class="modal-overlay" @click.self="showEditField = false">
        <div class="modal-content">
          <div class="modal-title">✏️ {{ editFieldLabel }}</div>
          <div class="form-group">
            <input type="text" class="form-input" v-model="editFieldValue" :placeholder="'请输入' + editFieldLabel">
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline btn-block" @click="showEditField = false">取消</button>
            <button class="btn btn-pink btn-block" @click="saveField">保存</button>
          </div>
        </div>
      </div>

      <!-- 编辑日期弹窗 -->
      <div v-if="showEditDate" class="modal-overlay" @click.self="showEditDate = false">
        <div class="modal-content">
          <div class="modal-title">📅 {{ editDateLabel }}</div>
          <div class="form-group">
            <input type="date" class="form-input" v-model="editDateValue">
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline btn-block" @click="showEditDate = false">取消</button>
            <button class="btn btn-pink btn-block" @click="saveDate">保存</button>
          </div>
        </div>
      </div>

    </div>
  `,
  setup: function () {
    var store = window.appStore;
    var avatarInput = Vue.ref(null);
    var editingAvatarType = Vue.ref('');

    // 编辑文字字段
    var showEditField = Vue.ref(false);
    var editingFieldKey = Vue.ref('');
    var editFieldValue = Vue.ref('');
    var editFieldLabel = Vue.ref('');

    // 编辑日期字段
    var showEditDate = Vue.ref(false);
    var editingDateKey = Vue.ref('');
    var editDateValue = Vue.ref('');
    var editDateLabel = Vue.ref('');

    // 主题选项
    var themes = [
      { value: 'pink', color: 'linear-gradient(135deg, #FFB6C1, #FF69B4)', icon: '🌸' },
      { value: 'purple', color: 'linear-gradient(135deg, #D8B4FE, #A855F7)', icon: '💜' },
      { value: 'blue', color: 'linear-gradient(135deg, #93C5FD, #3B82F6)', icon: '💙' }
    ];

    // 在一起天数
    var daysTogether = Vue.computed(function () {
      return daysFromToday(store.settings.startDate);
    });

    var storageSize = Vue.computed(function () {
      return getStorageSizeText();
    });

    // 上传头像
    function uploadAvatar(type) {
      editingAvatarType.value = type;
      avatarInput.value.click();
    }

    async function onAvatarChange(e) {
      var files = e.target.files;
      if (!files || files.length === 0) return;
      var base64 = await compressImage(files[0], 200, 0.7);
      if (editingAvatarType.value === 'boyfriend') {
        store.settings.boyfriendAvatar = base64;
      } else {
        store.settings.girlfriendAvatar = base64;
      }
      e.target.value = '';
    }

    // 编辑文字字段
    var fieldLabels = {
      boyfriendName: '男朋友昵称',
      girlfriendName: '女朋友昵称',
      welcomeText: '欢迎语'
    };

    function editField(key) {
      editingFieldKey.value = key;
      editFieldValue.value = store.settings[key] || '';
      editFieldLabel.value = fieldLabels[key] || key;
      showEditField.value = true;
    }

    function saveField() {
      if (editFieldValue.value.trim()) {
        store.settings[editingFieldKey.value] = editFieldValue.value.trim();
      }
      showEditField.value = false;
    }

    // 编辑日期字段
    var dateLabels = {
      startDate: '恋爱开始日期',
      boyfriendBirthday: '小亮的生日',
      girlfriendBirthday: '思炫的生日'
    };

    function editDate(key) {
      editingDateKey.value = key;
      editDateValue.value = store.settings[key] || '';
      editDateLabel.value = dateLabels[key] || key;
      showEditDate.value = true;
    }

    function saveDate() {
      store.settings[editingDateKey.value] = editDateValue.value;
      showEditDate.value = false;
    }

    // 云端同步
    var tokenInput = Vue.ref(store.settings.githubToken || '');
    var syncing = Vue.ref(false);
    var syncStatusText = Vue.ref('');

    function saveToken() {
      store.settings.githubToken = tokenInput.value.trim();
      if (store.settings.githubToken) {
        syncStatusText.value = 'Token 已保存，页面刷新后自动同步';
        setTimeout(function () { syncStatusText.value = ''; }, 3000);
      }
    }

    function manualSync() {
      if (!store.settings.githubToken) {
        syncStatusText.value = '请先配置 Token';
        return;
      }
      syncing.value = true;
      syncStatusText.value = '正在同步...';

      pushToGithub().then(function (ok) {
        if (ok) {
          syncStatusText.value = '✅ 同步成功！其他人刷新页面即可看到最新数据';
        } else {
          syncStatusText.value = '❌ 同步失败，请检查 Token 是否正确';
        }
        syncing.value = false;
        setTimeout(function () { syncStatusText.value = ''; }, 5000);
      });
    }

    // 导出数据
    function exportData() {
      var data = JSON.stringify(store, null, 2);
      var blob = new Blob([data], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = '思炫宝宝的小窝_备份_' + getToday() + '.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    // 导入数据
    function importData(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        try {
          var data = JSON.parse(ev.target.result);
          if (confirm('确定要导入数据吗？\n当前数据会被覆盖哦~')) {
            Object.assign(store.settings, data.settings || {});
            store.photos = data.photos || [];
            store.meals = data.meals || [];
            store.outfits = data.outfits || [];
            store.notifications = data.notifications || [];
            store.friendCircle = data.friendCircle || [];
            store.wishList = data.wishList || [];
            store.anniversaries = data.anniversaries || [];
            store.steps = data.steps || { count: 8888, lastUpdated: null };
            alert('导入成功！🎉');
          }
        } catch (err) {
          alert('导入失败，文件格式不正确~ 😢');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    }

    // 清除数据
    function clearData() {
      if (confirm('确定要清除所有数据吗？\n这个操作不可恢复哦~ 😢')) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    }

    return {
      store: store,
      avatarInput: avatarInput,
      showEditField: showEditField,
      editFieldValue: editFieldValue,
      editFieldLabel: editFieldLabel,
      showEditDate: showEditDate,
      editDateValue: editDateValue,
      editDateLabel: editDateLabel,
      themes: themes,
      daysTogether: daysTogether,
      storageSize: storageSize,
      tokenInput: tokenInput,
      syncing: syncing,
      syncStatusText: syncStatusText,
      uploadAvatar: uploadAvatar,
      onAvatarChange: onAvatarChange,
      editField: editField,
      saveField: saveField,
      editDate: editDate,
      saveDate: saveDate,
      saveToken: saveToken,
      manualSync: manualSync,
      exportData: exportData,
      importData: importData,
      clearData: clearData,
      formatDate: formatDate,
      navigateTo: navigateTo
    };
  }
};
