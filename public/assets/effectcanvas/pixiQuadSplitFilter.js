EModule.define("pixiQuadSplitFilter", [], function () {
  // 自定义shader特效类
  class QuadSplitFilter extends PIXI.Filter {
    constructor() {
      // 顶点着色器（默认即可）
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

      // 片段着色器 → 核心：把 UV 坐标 *2 取小数，实现 2x2 平铺
      const fragment = `
      precision highp float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;

      void main() {
          // 把坐标放大 2 倍，只取小数部分 → 自动分成 2×2
          vec2 uv = fract(vTextureCoord * 2.0);
          
          // 采样纹理
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
      this.filter = new QuadSplitFilter();
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