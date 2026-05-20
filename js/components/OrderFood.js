// ============================================
// 点餐栏目组件 - 思炫宝宝的专属小窝
// ============================================

window.Components = window.Components || {};
window.Components.OrderFood = {
  template: `
    <div class="page order-page">

      <div class="order-header">
        <div style="font-size: 20px; font-weight: 700; color: var(--text-primary);">🍰 今天想吃什么？</div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">选好了下次见面就带你去~ 💖</div>
      </div>

      <!-- 食物网格 -->
      <div class="card">
        <div class="food-grid">
          <div v-for="food in foods" :key="food.name" class="food-item" @click="selectFood(food)">
            <span class="food-emoji">{{ food.emoji }}</span>
            <span class="food-name">{{ food.name }}</span>
          </div>
        </div>
      </div>

      <!-- 心愿清单 -->
      <div class="card">
        <div class="card-title">💖 心愿清单</div>
        <div v-if="store.wishList.length === 0" class="empty-state" style="padding: 20px;">
          <div class="empty-icon">🍰</div>
          <div class="empty-text">还没有想吃的东西呢~<br>快选一个吧！</div>
        </div>
        <div v-else>
          <div v-for="wish in [...store.wishList].reverse()" :key="wish.id" class="wish-item">
            <span class="wish-emoji">{{ getFoodEmoji(wish.food) }}</span>
            <div class="wish-info">
              <div class="wish-food">{{ wish.food }}</div>
              <div class="wish-date">{{ relativeTime(wish.createdAt) }}添加</div>
            </div>
            <button class="wish-delete" @click="deleteWish(wish.id)">🗑️</button>
          </div>
        </div>
      </div>

      <!-- 选择食物弹窗 -->
      <div v-if="selectedFood" class="modal-overlay" @click.self="selectedFood = null">
        <div class="modal-content" style="text-align: center;">
          <div style="font-size: 56px; margin-bottom: 12px;" class="decoration-bounce">{{ selectedFood.emoji }}</div>
          <div style="font-size: 17px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
            {{ selectedFood.name }}
          </div>
          <div style="font-size: 15px; color: var(--pink-dark); line-height: 1.8; margin-bottom: 20px;">
            已为你记录，<br>下次见面就带你去吃<br>
            <span style="font-weight: 700;">{{ selectedFood.name }}</span> 💖
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline btn-block" @click="selectedFood = null">再看看</button>
            <button class="btn btn-pink btn-block" @click="confirmFood">好耶！</button>
          </div>
        </div>
      </div>

    </div>
  `,
  setup: function () {
    var store = window.appStore;
    var selectedFood = Vue.ref(null);

    var foods = [
      { emoji: '🧋', name: '奶茶' },
      { emoji: '🍢', name: '烤肠' },
      { emoji: '🍲', name: '麻辣烫' },
      { emoji: '🍲', name: '海底捞' },
      { emoji: '🍚', name: '米村拌饭' },
      { emoji: '🍿', name: '零食' },
      { emoji: '🍦', name: '雪糕' },
      { emoji: '🍰', name: '蛋糕' }
    ];

    function selectFood(food) {
      selectedFood.value = food;
    }

    function confirmFood() {
      if (!selectedFood.value) return;
      store.wishList.push({
        id: generateId(),
        food: selectedFood.value.emoji + selectedFood.value.name,
        createdAt: Date.now()
      });
      selectedFood.value = null;
    }

    function deleteWish(id) {
      var idx = store.wishList.findIndex(function (w) { return w.id === id; });
      if (idx >= 0) store.wishList.splice(idx, 1);
    }

    function getFoodEmoji(food) {
      var emoji = food.match(/^[\p{Emoji_Presentation}\p{Emoji}️‍\u{1F1E0}-\u{1F1FF}]+/u);
      return emoji ? emoji[0] : '🍴';
    }

    return {
      store: store,
      selectedFood: selectedFood,
      foods: foods,
      selectFood: selectFood,
      confirmFood: confirmFood,
      deleteWish: deleteWish,
      getFoodEmoji: getFoodEmoji,
      relativeTime: relativeTime
    };
  }
};
