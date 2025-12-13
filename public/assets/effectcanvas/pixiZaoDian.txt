/**
 * init(canvas, element, store, PIXI) 初始化函数
 * play({relativeTime, duration, progress}) 播放动画函数
 * pause() 暂停
 * destroy() 销毁
 */
EModule.define('pixiZaoDian', [], function () {
  let filter = null;

  function init(cav, element, store, PIXI) {
    // 创建噪点滤镜
    filter = new store.filters.CRTFilter();
    filter.id = element.id;
    store.addFilter(filter);
  }

  // 播放特效
  function play({ relativeTime, duration, progress }) {
    filter.enabled = true;
  }

  // 停止特效
  function pause() {
    filter.enabled = false;
  }

  function randomID(randomLength = 8) {
    return Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36);
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

  return { init, play, pause, destroy };
});
