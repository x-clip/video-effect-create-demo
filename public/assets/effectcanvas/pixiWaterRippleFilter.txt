EModule.define('pixiWaterRippleFilter', [], function () {
  // 自定义shader特效类
  // 水波纹滤镜（progress 0~1 控制动画）
  class WaterRippleFilter extends PIXI.Filter {
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
      uniform float progress;
      uniform vec2 center;
      uniform float amplitude;
      uniform float frequency;

      void main() {
        vec2 uv = vTextureCoord;
        vec2 distVec = uv - center;
        float dist = length(distVec);

        // 波纹动画公式
        float wave = sin(dist * frequency - progress * 12.0) 
                   * amplitude 
                   * (1.0 - progress);

        // UV 偏移
        vec2 offset = normalize(distVec) * wave;
        vec4 color = texture2D(uSampler, uv + offset);

        // ✅ 这里修复成正确的 gl_FragColor
        gl_FragColor = color;
      }
    `;

      super(vertex, fragment);

      // 默认参数
      this.uniforms.progress = 0;
      this.uniforms.center = { x: 0.5, y: 0.5 };
      this.uniforms.amplitude = 0.018;
      this.uniforms.frequency = 28.0;
    }

    // 0~1 控制波纹动画
    set progress(value) {
      this.uniforms.progress = value;
    }
    get progress() {
      return this.uniforms.progress;
    }

    // 设置波纹中心点
    setCenter(x, y) {
      this.uniforms.center.x = x;
      this.uniforms.center.y = y;
    }
  }

  class Main {
    constructor() {
      this.filter = null;
    }

    init(cav, element, store, PIXI) {
      // 创建噪点滤镜
      this.filter = new WaterRippleFilter();
      this.filter.id = element.id;
      store.addFilter(this.filter);
    }

    // 播放特效
    play({ relativeTime, duration, progress }) {
      this.filter.enabled = true;
      this.filter.progress = progress;
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
