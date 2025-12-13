/**
 * 数码科技特效
 * init(canvas) 初始化函数
 * play({relativeTime, duration, progress}) 播放动画函数
 * pause() 暂停
 * destroy() 销毁
 */
EModule.define('codeRain', [], function () {
  let canvas = null;
  var letters = Array(256).join(1).split('');
  let ctx = null;

  // 双缓冲技术：使用离屏canvas保存上一帧
  let bufferCanvas = null;
  let bufferCtx = null;
  const trailLength = 0.92; // 拖尾衰减系数 (0-1)

  var designMatrix = function (neo) {
    var width = neo.width;
    var height = neo.height;

    // 1. 将上一帧内容复制到缓冲canvas，并做淡化处理
    bufferCtx.globalCompositeOperation = 'copy';
    bufferCtx.drawImage(canvas, 0, 0);

    // 清除画布为透明
    ctx.clearRect(0, 0, width, height);

    // 3. 绘制淡化后的上一帧内容
    ctx.globalAlpha = trailLength;
    ctx.drawImage(bufferCanvas, 0, 0);
    ctx.globalAlpha = 1.0;

    // ctx.fillStyle = 'rgba(0,0,0,.0)';
    // ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#0F0';

    letters.map(function (position_y, index) {
      var text = String.fromCharCode(48 + Math.random() * 33);
      var position_x = index * 10;
      ctx.fillText(text, position_x, position_y);
      letters[index] = position_y > canvas.height + Math.random() * 1e4 ? 0 : position_y + 10;
    });
  };

  ////////////////////////////////////////////
  function init(cav) {
    canvas = cav;
    ctx = canvas.getContext('2d', { alpha: true });
    letters = letters.map(() => Math.random() * canvas.height);

    const fontSize = 42;
    ctx.font = `${fontSize}px monospace`;

    // 创建离屏缓冲canvas
    bufferCanvas = document.createElement('canvas');
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;
    bufferCtx = bufferCanvas.getContext('2d', { alpha: true });
  }

  function play({ relativeTime, duration, progress }) {
    designMatrix(canvas);
  }

  function pause() {
    console.log('pause');
  }

  return { init, play, pause };
});
