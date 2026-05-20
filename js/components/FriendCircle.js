// ============================================
// 专属朋友圈组件 - 思炫宝宝的专属小窝
// ============================================

window.Components = window.Components || {};
window.Components.FriendCircle = {
  template: `
    <div class="page circle-page">

      <!-- 顶部标题 -->
      <div class="circle-header">
        <div style="text-align: center; flex: 1;">
          <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">
            💕 思炫和小亮的朋友圈
          </div>
          <div style="font-size: 11px; color: var(--text-light); margin-top: 2px;">
            记录我们的小日子~
          </div>
        </div>
      </div>

      <!-- 发布按钮 -->
      <button class="fab-btn" @click="showPost = true">
        <span style="font-size: 24px;">✏️</span>
      </button>

      <!-- 动态列表 -->
      <div v-if="posts.length > 0">
        <div v-for="post in posts" :key="post.id" class="card post-card">
          <!-- 头部 -->
          <div class="post-top">
            <div class="post-avatar">🐱</div>
            <div style="flex: 1;">
              <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">思炫宝宝</div>
              <div style="font-size: 11px; color: var(--text-light);">{{ relativeTime(post.createdAt) }}</div>
            </div>
          </div>

          <!-- 文字 -->
          <div v-if="post.text" class="post-text">{{ post.text }}</div>

          <!-- 照片网格 -->
          <div v-if="post.images.length > 0" class="post-images" :class="'grid-' + Math.min(post.images.length, 9)">
            <div v-for="(img, idx) in post.images" :key="idx" class="post-img-wrap" @click="viewImage(img)">
              <img :src="img">
            </div>
          </div>

          <!-- 操作栏 -->
          <div class="post-actions">
            <button class="action-btn" @click="toggleLike(post)">
              <span :class="{ 'like-active': post.likes > 0 }">❤️</span>
              <span>{{ post.likes || '' }}</span>
            </button>
            <button class="action-btn" @click="startComment(post)">
              💬 评论
            </button>
          </div>

          <!-- 评论区 -->
          <div v-if="post.comments.length > 0" class="post-comments">
            <div v-for="(c, idx) in post.comments.slice(-2)" :key="c.id" class="comment-item">
              <span class="comment-author">{{ c.author }}：</span>
              <span class="comment-text">{{ c.text }}</span>
            </div>
            <div v-if="post.comments.length > 2" class="comment-more">
              查看全部{{ post.comments.length }}条评论
            </div>
          </div>

          <!-- 评论输入 -->
          <div v-if="commentingPost === post.id" class="comment-input-wrap">
            <input type="text" class="form-input" v-model="commentText" placeholder="写评论..."
                   @keyup.enter="submitComment(post)" style="font-size: 13px; padding: 8px 12px;">
            <button class="btn btn-pink btn-small" @click="submitComment(post)" style="padding: 8px 14px;">发送</button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">💕</div>
        <div class="empty-text">
          还没有动态呢~<br>
          发布第一条朋友圈吧！
        </div>
        <button class="btn btn-pink mt-16" @click="showPost = true">✏️ 发布动态</button>
      </div>

      <!-- 发布弹窗 -->
      <div v-if="showPost" class="modal-overlay" @click.self="cancelPost">
        <div class="modal-content" style="max-width: 360px;">
          <div class="modal-title">✏️ 发布动态</div>

          <!-- 文字输入 -->
          <div class="form-group">
            <textarea class="form-textarea" v-model="postText" placeholder="分享此刻的心情..." rows="3"
                      maxlength="140"></textarea>
            <div style="text-align: right; font-size: 11px; color: var(--text-light); margin-top: 4px;">
              {{ postText.length }}/140
            </div>
          </div>

          <!-- 照片预览 -->
          <div v-if="postImages.length > 0" class="upload-preview-grid">
            <div v-for="(src, idx) in postImages" :key="idx" class="upload-preview-item">
              <img :src="src">
              <button class="preview-remove" @click="postImages.splice(idx, 1)">✕</button>
            </div>
          </div>

          <!-- 添加照片 -->
          <div v-if="postImages.length < 9" class="upload-area" @click="$refs.postFileInput.click()" style="padding: 16px; margin-bottom: 14px;">
            <div style="font-size: 24px;">📷</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
              添加照片 ({{ postImages.length }}/9)
            </div>
          </div>

          <input type="file" accept="image/*" multiple ref="postFileInput" class="hidden-input" @change="onPostFileSelect">

          <!-- 发布按钮 -->
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline btn-block" @click="cancelPost">取消</button>
            <button class="btn btn-pink btn-block" @click="publishPost" :disabled="!postText.trim() && postImages.length === 0">
              发布
            </button>
          </div>
        </div>
      </div>

      <!-- 查看大图 -->
      <div v-if="viewingImage" class="modal-overlay" @click.self="viewingImage = null">
        <div class="modal-content" style="padding: 8px; max-width: 380px;">
          <img :src="viewingImage" style="width: 100%; border-radius: var(--radius-md); display: block;">
          <div class="text-center mt-8">
            <button class="btn btn-outline btn-small" @click="viewingImage = null">关闭</button>
          </div>
        </div>
      </div>

    </div>
  `,
  setup: function () {
    var store = window.appStore;
    var showPost = Vue.ref(false);
    var postText = Vue.ref('');
    var postImages = Vue.ref([]);
    var commentingPost = Vue.ref(null);
    var commentText = Vue.ref('');
    var viewingImage = Vue.ref(null);

    // 倒序排列
    var posts = Vue.computed(function () {
      return store.friendCircle.slice().sort(function (a, b) {
        return b.createdAt - a.createdAt;
      });
    });

    // 文件选择
    async function onPostFileSelect(e) {
      var files = Array.from(e.target.files);
      var remaining = 9 - postImages.value.length;
      var toProcess = files.slice(0, remaining);
      for (var i = 0; i < toProcess.length; i++) {
        var base64 = await compressImage(toProcess[i], 600, 0.5);
        postImages.value.push(base64);
      }
      e.target.value = '';
    }

    // 发布
    function publishPost() {
      if (!postText.value.trim() && postImages.value.length === 0) return;
      store.friendCircle.push({
        id: generateId(),
        text: postText.value.trim(),
        images: postImages.value.slice(),
        likes: 0,
        comments: [],
        createdAt: Date.now()
      });
      cancelPost();
    }

    function cancelPost() {
      showPost.value = false;
      postText.value = '';
      postImages.value = [];
    }

    // 点赞
    function toggleLike(post) {
      post.likes = post.likes > 0 ? 0 : 1;
    }

    // 评论
    function startComment(post) {
      commentingPost.value = commentingPost.value === post.id ? null : post.id;
      commentText.value = '';
    }

    function submitComment(post) {
      if (!commentText.value.trim()) return;
      post.comments.push({
        id: generateId(),
        author: '小亮',
        text: commentText.value.trim(),
        timestamp: Date.now()
      });
      commentText.value = '';
      commentingPost.value = null;
    }

    // 查看大图
    function viewImage(src) {
      viewingImage.value = src;
    }

    return {
      store: store,
      showPost: showPost,
      postText: postText,
      postImages: postImages,
      commentingPost: commentingPost,
      commentText: commentText,
      viewingImage: viewingImage,
      posts: posts,
      onPostFileSelect: onPostFileSelect,
      publishPost: publishPost,
      cancelPost: cancelPost,
      toggleLike: toggleLike,
      startComment: startComment,
      submitComment: submitComment,
      viewImage: viewImage,
      relativeTime: relativeTime
    };
  }
};
