EModule.define('mtOldTVFlter', [], function () {
  // 自定义shader特效类
  // ==============================================
  // 显示器故障波动滤镜（time 时间驱动）
  // ==============================================
  // 2. 【无晃动】老电视CRT滤镜 (time控制动画)
  class OldTVFilter extends PIXI.Filter {
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

      // 老电视核心Shader —— 已删除所有画面偏移、晃动、波动代码
      const fragment = `
            precision highp float;
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            uniform float time;
            uniform vec2 screenSize;

            // 随机函数 (用于噪点)
            float rand(vec2 n) {
                return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
            }

            void main() {
                vec2 uv = vTextureCoord;
                vec2 px = 1.0 / screenSize;
                float t = time;

                // 直接采样原图 —— 无任何晃动、偏移、扭曲
                vec4 color = texture2D(uSampler, uv);

                // 1. 水平扫描线 (经典CRT)
                float scanline = sin(uv.y * screenSize.y * 0.5) * 0.1 + 0.9;
                color.rgb *= scanline;

                // 2. 垂直条纹
                float stripe = sin(uv.x * screenSize.x * 0.3) * 0.05 + 0.95;
                color.rgb *= stripe;

                // 3. 静态噪点 (老电视质感)
                float grain = rand(uv * 50.0 + t) * 0.06;
                color.rgb += grain;

                // 4. 轻微色彩分离
                vec4 r = texture2D(uSampler, uv + vec2(px.x * 0.5, 0.0));
                vec4 b = texture2D(uSampler, uv - vec2(px.x * 0.5, 0.0));
                color.r = mix(color.r, r.r, 0.06);
                color.b = mix(color.b, b.b, 0.06);

                // 5. 边缘暗角
                vec2 center = vec2(0.5, 0.5);
                float vignette = 1.0 - distance(uv, center) * 0.7;
                color.rgb *= vignette;

                // 6. 极轻微亮度闪烁 (无画面偏移)
                float flicker = sin(t * 10.0) * 0.03 + 0.97;
                color.rgb *= flicker;

                gl_FragColor = color;
            }
        `;

      const defaults = {
        time: 0,
        screenSize: [options.width, options.height],
      };

      super(vertex, fragment, { ...defaults, ...options });
    }

    // 时间控制
    setTime(timeSeconds) {
      this.uniforms.time = timeSeconds;
    }
  }

  class Main {
    constructor() {
      this.filter = null;
    }

    init(cav, element, store, PIXI) {
      // 创建噪点滤镜
      this.filter = new OldTVFilter({
        width: cav.width,
        height: cav.height,
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
