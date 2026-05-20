// ============================================
// 专属回忆墙组件 - 思炫宝宝的专属小窝
// ============================================

window.Components = window.Components || {};
window.Components.MemoryWall = {
  template: `
    <div class="page memory-page">

      <!-- 顶部 -->
      <div class="memory-header">
        <div>
          <div style="font-size: 20px; font-weight: 700; color: var(--text-primary);">
            📸 专属回忆墙
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
            记录我们的每一个美好瞬间 💕
          </div>
        </div>
        <button class="btn btn-pink btn-small" @click="showUpload = true">
          ✨ 上传记忆
        </button>
      </div>

      <!-- 照片网格 -->
      <div v-if="sortedPhotos.length > 0" class="photo-grid">
        <div v-for="photo in sortedPhotos" :key="photo.id" class="photo-card" @click="viewPhoto(photo)">
          <img :src="photo.base64" :alt="photo.description">
          <div class="photo-info">
            <div class="photo-desc">{{ photo.description || '美好回忆~' }}</div>
            <div class="photo-date">🐾 {{ formatDate(photo.date) }}</div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">📸</div>
        <div class="empty-text">
          还没有记忆呢~<br>
          快去创造美好回忆吧 💕
        </div>
        <button class="btn btn-pink mt-16" @click="showUpload = true">
          ✨ 上传第一张照片
        </button>
      </div>

      <!-- 上传弹窗 -->
      <div v-if="showUpload" class="modal-overlay" @click.self="showUpload = false">
        <div class="modal-content" style="max-width: 360px;">
          <div class="modal-title">✨ 上传记忆</div>

          <!-- 照片预览 -->
          <div v-if="uploadPreviews.length > 0" class="upload-preview-grid">
            <div v-for="(src, idx) in uploadPreviews" :key="idx" class="upload-preview-item">
              <img :src="src">
              <button class="preview-remove" @click="removePreview(idx)">✕</button>
            </div>
          </div>

          <!-- 上传区域 -->
          <div v-if="uploadPreviews.length < 9" class="upload-area" @click="triggerUpload" style="margin-bottom: 14px;">
            <div class="upload-icon">📷</div>
            <div class="upload-text">点击选择照片（可多选）</div>
            <div style="font-size: 11px; color: var(--text-light); margin-top: 4px;">最多 9 张</div>
          </div>

          <input type="file" accept="image/*" multiple ref="uploadInput" class="hidden-input" @change="onFileSelect">

          <!-- 描述 -->
          <div class="form-group">
            <label class="form-label">📝 写点什么~</label>
            <textarea class="form-textarea" v-model="uploadDesc" placeholder="记录这个美好的瞬间..." rows="2"></textarea>
          </div>

          <!-- 日期 -->
          <div class="form-group">
            <label class="form-label">📅 日期</label>
            <input type="date" class="form-input" v-model="uploadDate">
          </div>

          <!-- 操作按钮 -->
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline btn-block" @click="cancelUpload">取消</button>
            <button class="btn btn-pink btn-block" @click="confirmUpload" :disabled="uploadPreviews.length === 0">
              保存 ({{ uploadPreviews.length }}张)
            </button>
          </div>
        </div>
      </div>

      <!-- 查看大图弹窗 -->
      <div v-if="viewingPhoto" class="modal-overlay" @click.self="viewingPhoto = null">
        <div class="modal-content" style="padding: 12px; max-width: 380px; position: relative;">
          <img :src="viewingPhoto.base64" style="width: 100%; border-radius: var(--radius-md); display: block;">
          <div style="padding: 10px 4px 4px;">
            <div style="font-size: 15px; color: var(--text-primary); font-weight: 500;">
              {{ viewingPhoto.description || '美好回忆~' }}
            </div>
            <div style="font-size: 12px; color: var(--text-light); margin-top: 4px;">
              🐾 {{ formatDate(viewingPhoto.date) }}
            </div>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button class="btn btn-outline btn-block btn-small" @click="viewingPhoto = null">关闭</button>
            <button class="btn btn-small btn-block" style="background: #FFE0E0; color: #E85555; border: none;" @click="deletePhoto(viewingPhoto.id)">
              🗑️ 删除
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  setup: function () {
    var store = window.appStore;
    var showUpload = Vue.ref(false);
    var uploadInput = Vue.ref(null);
    var uploadPreviews = Vue.ref([]);
    var uploadFiles = Vue.ref([]);
    var uploadDesc = Vue.ref('');
    var uploadDate = Vue.ref(getToday());
    var viewingPhoto = Vue.ref(null);

    // 按时间倒序排列
    var sortedPhotos = Vue.computed(function () {
      return store.photos.slice().sort(function (a, b) {
        return b.createdAt - a.createdAt;
      });
    });

    // 触发文件选择
    function triggerUpload() {
      uploadInput.value.click();
    }

    // 文件选择回调
    async function onFileSelect(e) {
      var files = Array.from(e.target.files);
      var remaining = 9 - uploadPreviews.value.length;
      var toProcess = files.slice(0, remaining);

      for (var i = 0; i < toProcess.length; i++) {
        var base64 = await compressImage(toProcess[i], 800, 0.6);
        uploadPreviews.value.push(base64);
      }

      e.target.value = '';
    }

    // 移除预览
    function removePreview(idx) {
      uploadPreviews.value.splice(idx, 1);
    }

    // 取消上传
    function cancelUpload() {
      showUpload.value = false;
      uploadPreviews.value = [];
      uploadDesc.value = '';
      uploadDate.value = getToday();
    }

    // 确认上传
    function confirmUpload() {
      if (uploadPreviews.value.length === 0) return;

      uploadPreviews.value.forEach(function (base64) {
        store.photos.push({
          id: generateId(),
          base64: base64,
          description: uploadDesc.value,
          date: uploadDate.value || getToday(),
          createdAt: Date.now()
        });
      });

      cancelUpload();
    }

    // 查看照片
    function viewPhoto(photo) {
      viewingPhoto.value = photo;
    }

    // 删除照片
    function deletePhoto(id) {
      var idx = store.photos.findIndex(function (p) { return p.id === id; });
      if (idx >= 0) {
        store.photos.splice(idx, 1);
      }
      viewingPhoto.value = null;
    }

    return {
      store: store,
      showUpload: showUpload,
      uploadInput: uploadInput,
      uploadPreviews: uploadPreviews,
      uploadDesc: uploadDesc,
      uploadDate: uploadDate,
      viewingPhoto: viewingPhoto,
      sortedPhotos: sortedPhotos,
      triggerUpload: triggerUpload,
      onFileSelect: onFileSelect,
      removePreview: removePreview,
      cancelUpload: cancelUpload,
      confirmUpload: confirmUpload,
      viewPhoto: viewPhoto,
      deletePhoto: deletePhoto,
      formatDate: formatDate
    };
  }
};
