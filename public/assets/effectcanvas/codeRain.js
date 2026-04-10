/**
 * 数码科技特效
 * init(canvas) 初始化函数
 * play({relativeTime, duration, progress}) 播放动画函数
 * pause() 暂停
 * destroy() 销毁
 */
EModule.define('codeRain', [], function () {
  class Main {
    constructor() {
      this.filter = null;
    }

    canvas = null;
    letters = Array(256).join(1).split('');
    ctx = null;

    // 双缓冲技术：使用离屏canvas保存上一帧
    bufferCanvas = null;
    bufferCtx = null;
    trailLength = 0.92; // 拖尾衰减系数 (0-1)

    designMatrix = neo => {
      var width = neo.width;
      var height = neo.height;

      // 1. 将上一帧内容复制到缓冲canvas，并做淡化处理
      this.bufferCtx.globalCompositeOperation = 'copy';
      this.bufferCtx.drawImage(canvas, 0, 0);

      // 清除画布为透明
      this.ctx.clearRect(0, 0, width, height);

      // 3. 绘制淡化后的上一帧内容
      this.ctx.globalAlpha = trailLength;
      this.ctx.drawImage(this.bufferCanvas, 0, 0);
      this.ctx.globalAlpha = 1.0;

      // ctx.fillStyle = 'rgba(0,0,0,.0)';
      // ctx.fillRect(0, 0, width, height);
      this.ctx.fillStyle = '#0F0';

      this.letters.map(function (position_y, index) {
        var text = String.fromCharCode(48 + Math.random() * 33);
        var position_x = index * 10;
        this.ctx.fillText(text, position_x, position_y);
        this.letters[index] = position_y > canvas.height + Math.random() * 1e4 ? 0 : position_y + 10;
      });
    };

    ////////////////////////////////////////////
    init(cav) {
      this.canvas = cav;
      this.ctx = canvas.getContext('2d', { alpha: true });
      this.letters = this.letters.map(() => Math.random() * canvas.height);

      const fontSize = 42;
      this.ctx.font = `${fontSize}px monospace`;

      // 创建离屏缓冲canvas
      this.bufferCanvas = document.createElement('canvas');
      this.bufferCanvas.width = canvas.width;
      this.bufferCanvas.height = canvas.height;
      this.bufferCtx = this.bufferCanvas.getContext('2d', { alpha: true });
    }

    play({ relativeTime, duration, progress }) {
      this.designMatrix(this.canvas);
    }

    pause() {
      console.log('pause');
    }
  }

  return Main;
});
