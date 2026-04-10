/**
 * init(canvas, element, store, PIXI) 初始化函数
 * play({relativeTime, duration, progress}) 播放动画函数
 * pause() 暂停
 * destroy() 销毁
 */
EModule.define('pixiTwitFilter', [], function () {
  class Main {
    constructor() {
      this.filter = null;
      this.size = 0;
    }

    init(cav, element, store, PIXI) {
      this.size = Math.max(store.app.view.width, store.app.view.height);
      // 创建噪点滤镜
      this.filter = new store.filters.TwistFilter({
        radius: 0,
        offset: {
          x: store.app.view.width / 2,
          y: store.app.view.height / 2,
        },
      });
      this.filter.id = element.id;
      store.addFilter(this.filter);
    }

    // 播放特效
    play({ relativeTime, duration, progress }) {
      this.filter.enabled = true;
      this.filter.radius = this.size * progress;
      // if (progress <= 0.5) {
      //   filter.radius = size * progress * 2;
      // } else {
      //   filter.radius = size * (1 - progress) * 2;
      // }
    }

    randomID(randomLength = 8) {
      return Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36);
    }

    // 停止特效
    pause() {
      this.filter.enabled = false;
    }

    // 销毁特效
    destroy(store) {
      if (this.filter) {
        this.filter.enabled = false;
        store.deleteFilter(this.filter.id);
        this.filter.destroy();
        this.filter = null;
      }
    }
  }

  return Main;
});
