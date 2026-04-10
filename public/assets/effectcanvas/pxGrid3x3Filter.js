EModule.define('pxGrid3x3Filter', [], function () {
  // 自定义shader特效类
  class Grid3x3Filter extends PIXI.Filter {
    constructor() {
      const vertex = `
      attribute vec2 aVertexPosition;
      attribute vec2 aTextureCoord;
      uniform mat3 projectionMatrix;
      varying vec2 vTextureCoord;

      void main(void) {
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
      }
    `;

      const fragment = `
      precision highp float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;

      void main() {
        // 核心：坐标 ×3，取小数 = 3x3 重复
        vec2 uv = fract(vTextureCoord * 3.0);
        gl_FragColor = texture2D(uSampler, uv);
      }
    `;

      super(vertex, fragment);
    }
  }

  class Main {
    constructor() {
      this.filter = null;
    }

    init(cav, element, store, PIXI) {
      // 创建噪点滤镜
      this.filter = new Grid3x3Filter();
      this.filter.id = element.id;
      store.addFilter(this.filter);
    }

    // 播放特效
    play({ relativeTime, duration, progress }) {
      this.filter.enabled = true;
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
