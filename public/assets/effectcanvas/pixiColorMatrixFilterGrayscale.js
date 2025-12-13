/**
 * init(canvas, element, store, PIXI) 初始化函数
 * play({relativeTime, duration, progress}) 播放动画函数
 * pause() 暂停
 * destroy() 销毁
 */
EModule.define('pixiColorMatrixFilterGrayscale', [], function () {
  let filter = null;

  function init(cav, element, store, PIXI) {
    console.log('----------->', PIXI, PIXI.filters);
    // 创建噪点滤镜 (strength, quality, resolution, kernelSize)
    filter = new PIXI.ColorMatrixFilter();
    /**
      @param scale value of the grey (0-1, where 0 is black)
      @param multiply if true, current matrix and matrix are multiplied. If false, just set the current matrix with @param matrix
     */
    filter.grayscale(0.5, true);
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
