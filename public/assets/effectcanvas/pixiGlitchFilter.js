/**
 * init(canvas, element, store, PIXI) 初始化函数
 * play({relativeTime, duration, progress}) 播放动画函数
 * pause() 暂停
 * destroy() 销毁
 */
EModule.define('pixiGlitchFilter', [], function () {
  let filter = null;

  function init(cav, element, store, PIXI) {
    console.log('PIXI', PIXI);
    // 创建噪点滤镜 (strength, quality, resolution, kernelSize)
    filter = new store.filters.GlitchFilter({
      seed: 0.5,
      slices: 15,
      offset: 50,
      direction: 180,
      fillMode: 1,
    });
    filter.id = element.id;
    store.addFilter(filter);
  }

  // 播放特效
  function play({ relativeTime, duration, progress }) {
    filter.enabled = true;
    console.log('filter', filter);
    filter.slices = ~~(Math.sin(relativeTime) * 10) + 10; // [0.4~0.6]
    // filter.green.y = Math.sin(relativeTime) + 0; // [0.4~0.6]
  }

  // 停止特效
  function pause() {
    filter.enabled = false;
  }

  function randomID(randomLength = 8) {
    return Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36);
  }

  // 修改参数
  function setParams(params) {
    // for (let key in params) {
    //   if (params[key]) {
    //     filter[key] = params[key];
    //   }
    // }
  }

  // 销毁特效
  function destroy(store) {
    if (filter) {
      filter.enabled = false;
      store.deleteFilter(filter.id);
      filter.destroy();
      filter = null;
    }
  }

  return { init, play, pause, destroy, setParams };
});
