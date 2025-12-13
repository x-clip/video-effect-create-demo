/**
 * init(canvas, element, store, PIXI) 初始化函数
 * play({relativeTime, duration, progress}) 播放动画函数
 * pause() 暂停
 * destroy() 销毁
 */
EModule.define('pixiTwitFilter', [], function () {
  let filter = null;
  let size = 0;

  function init(cav, element, store, PIXI) {
    size = Math.max(store.app.view.width, store.app.view.height);
    // 创建噪点滤镜
    filter = new store.filters.TwistFilter({
      radius: 0,
      offset: {
        x: store.app.view.width / 2,
        y: store.app.view.height / 2,
      },
    });
    filter.id = element.id;
    store.addFilter(filter);
  }

  // 播放特效
  function play({ relativeTime, duration, progress }) {
    filter.enabled = true;
    filter.radius = size * progress;
    // if (progress <= 0.5) {
    //   filter.radius = size * progress * 2;
    // } else {
    //   filter.radius = size * (1 - progress) * 2;
    // }
  }

  function randomID(randomLength = 8) {
    return Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36);
  }

  // 停止特效
  function pause() {
    filter.enabled = false;
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
