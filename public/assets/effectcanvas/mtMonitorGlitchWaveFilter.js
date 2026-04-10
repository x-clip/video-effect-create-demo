EModule.define('mtMonitorGlitchWaveFilter', [], function () {
  // 自定义shader特效类
  // ==============================================
  // 显示器故障波动滤镜（time 时间驱动）
  // ==============================================
  class MonitorGlitchWaveFilter extends PIXI.Filter {
    constructor(options = {}) {
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

      // 片段着色器：完全由 time 控制动画
      const fragment = `
            precision highp float;
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            uniform float time;
            uniform float waveSpeed;
            uniform float waveAmplitude;
            uniform float rgbSplit;
            uniform float scanlineSpeed;
            uniform float glitchStrength;

            void main() {
                vec2 uv = vTextureCoord;
                float t = time;

                // 波动偏移
                float wave = sin(uv.y * 20.0 + t * waveSpeed) * waveAmplitude;
                uv.x += wave * glitchStrength;

                // RGB 色彩分离
                vec2 offset = vec2(rgbSplit * glitchStrength, 0.0);
                vec4 r = texture2D(uSampler, uv + offset);
                vec4 g = texture2D(uSampler, uv);
                vec4 b = texture2D(uSampler, uv - offset);
                vec4 color = vec4(r.r, g.g, b.b, (r.a + g.a + b.a) / 3.0);

                // 扫描线
                float scanline = sin(uv.y * 800.0 - t * scanlineSpeed) * 0.15 + 0.85;
                color.rgb *= scanline;

                // 轻微闪烁
                float flicker = sin(t * 9.0) * 0.1 + 1.0;
                color.rgb *= flicker;

                gl_FragColor = color;
            }
        `;

      // 默认参数
      const defaults = {
        time: 0, // 时间（自动增长）
        waveSpeed: 4, // 波动速度
        waveAmplitude: 0.02, // 波动幅度
        rgbSplit: 0.012, // 色彩偏移强度
        scanlineSpeed: 10, // 扫描线滚动速度
        glitchStrength: 1.0, // 故障整体强度 0~1
      };

      super(vertex, fragment, { ...defaults, ...options });
    }

    // 外部只需要更新这个 time 即可驱动动画
    setTime(t) {
      this.uniforms.time = t;
    }
  }

  class Main {
    constructor() {
      this.filter = null;
    }

    init(cav, element, store, PIXI) {
      // 创建噪点滤镜
      this.filter = new MonitorGlitchWaveFilter({
        waveSpeed: 4, // 波动速度
        waveAmplitude: 0.02, // 波动幅度
        rgbSplit: 0.012, // 色彩偏移
        scanlineSpeed: 10, // 扫描线速度
        glitchStrength: 1.2, // 整体强度
      });
      this.filter.id = element.id;
      store.addFilter(this.filter);
    }

    // 播放特效
    play({ relativeTime, duration, progress }) {
      this.filter.enabled = true;
      this.filter.setTime(relativeTime);
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
