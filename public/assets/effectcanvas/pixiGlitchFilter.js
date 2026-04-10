/**
 * init(canvas, element, store, PIXI) 初始化函数
 * play({relativeTime, duration, progress}) 播放动画函数
 * pause() 暂停
 * destroy() 销毁
 */
EModule.define('pixiGlitchFilter', [], function () {
  class Main {
    constructor() {
      this.filter = null;
    }

    init(cav, element, store, PIXI) {
      console.log('PIXI', PIXI);
      // 创建噪点滤镜 (strength, quality, resolution, kernelSize)
      this.filter = new store.filters.GlitchFilter({
        seed: 0.5,
        slices: 15,
        offset: 50,
        direction: 180,
        fillMode: 1,
      });
      this.filter.id = element.id;
      store.addFilter(this.filter);
    }

    // 播放特效
    play({ relativeTime, duration, progress }) {
      this.filter.enabled = true;
      console.log('filter', this.filter);
      this.filter.slices = ~~(Math.sin(relativeTime) * 10) + 10; // [0.4~0.6]
      // filter.green.y = Math.sin(relativeTime) + 0; // [0.4~0.6]
    }

    // 停止特效
    pause() {
      this.filter.enabled = false;
    }

    randomID(randomLength = 8) {
      return Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36);
    }

    // 修改参数
    setParams(params) {
      // for (let key in params) {
      //   if (params[key]) {
      //     this.filter[key] = params[key];
      //   }
      // }
    }

    // 销毁特效
    destroy(store) {
      console.log('destroy=====>', this.filter);
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
