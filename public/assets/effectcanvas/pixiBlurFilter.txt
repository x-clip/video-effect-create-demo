/**
 * init(canvas, element, store, PIXI) 初始化函数
 * play({relativeTime, duration, progress}) 播放动画函数
 * pause() 暂停
 * destroy() 销毁
 */
EModule.define('pixiBlurFilter', [], function () {
  
  class Main {
    constructor() {
      this.filter = null;
    }
    init(cav, element, store, PIXI) {
      console.log('----------->', PIXI, PIXI.filters);
      // 创建噪点滤镜 (strength, quality, resolution, kernelSize)
      this.filter = new PIXI.BlurFilter(10, 4);
      this.filter.id = element.id;
      store.addFilter(this.filter);
    }

    // 播放特效
    play({ relativeTime, duration, progress }) {
      this.filter.enabled = true;
      // filter.scale.x = 30 * Math.sin(relativeTime);
      // filter.scale.y = 30 * Math.cos(relativeTime);
    }

    // 停止特效
    pause() {
      this.filter.enabled = false;
    }

    randomID(randomLength = 8) {
      return Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36);
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
