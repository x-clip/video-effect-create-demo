EModule.define('mtShadertoyTVFilter', [], function () {
  // 自定义shader特效类
  class ShadertoyTVFilter extends PIXI.Filter {
    constructor(options) {
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
            uniform vec2 iResolution;
            uniform float iTime;

            float rand(vec2 n) {
                return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
            }

            float noise(vec2 p) {
                float s = rand(vec2(1.0, 2.0*cos(iTime)) * iTime * 8.0 + p * 1.0);
                s *= s;
                return s;
            }

            float onOff(float a, float b, float c) {
                return step(c, sin(iTime + a * cos(iTime * b)));
            }

            float ramp(float y, float start, float end) {
                float inside = step(start, y) - step(end, y);
                float fact = (y - start) / (end - start) * inside;
                return (1.0 - fact) * inside;
            }

            float stripes(vec2 uv) {
                float noi = noise(uv * vec2(0.5, 1.0) + vec2(1.0, 3.0));
                return ramp(mod(uv.y * 4.0 + iTime / 2.0 + sin(iTime + sin(iTime * 0.63)), 1.0), 0.5, 0.6) * noi;
            }

            vec3 getVideo(vec2 uv) {
                vec2 look = uv;
                float window = 1.0 / (1.0 + 20.0 * (look.y - mod(iTime / 4.0, 1.0)) * (look.y - mod(iTime / 4.0, 1.0)));
                look.x = look.x + sin(look.y * 10.0 + iTime) / 50.0 * onOff(4.0, 4.0, 0.3) * (1.0 + cos(iTime * 80.0)) * window;
                float vShift = 0.4 * onOff(2.0, 3.0, 0.9) * (sin(iTime) * sin(iTime * 20.0) + (0.5 + 0.1 * sin(iTime * 200.0) * cos(iTime)));
                look.y = mod(look.y + vShift, 1.0);
                vec3 video = texture2D(uSampler, look).rgb;
                return video;
            }

            vec2 screenDistort(vec2 uv) {
                uv -= vec2(0.5, 0.5);
                uv = uv * 1.2 * (1.0 / 1.2 + 2.0 * uv.x * uv.x * uv.y * uv.y);
                uv += vec2(0.5, 0.5);
                return uv;
            }

            void main() {
                vec2 uv = vTextureCoord;
                uv = screenDistort(uv);
                vec3 video = getVideo(uv);
                float vigAmt = 3.0 + 0.3 * sin(iTime + 5.0 * cos(iTime * 5.0));
                float vignette = (1.0 - vigAmt * (uv.y - 0.5) * (uv.y - 0.5)) * (1.0 - vigAmt * (uv.x - 0.5) * (uv.x - 0.5));

                video += stripes(uv);
                video += noise(uv * 2.0) / 2.0;
                video *= vignette;
                video *= (12.0 + mod(uv.y * 30.0 + iTime, 1.0)) / 13.0;

                gl_FragColor = vec4(video, 1.0);
            }
        `;

      super(vertex, fragment, {
        iTime: 0,
        iResolution: [options.width, options.height],
      });
    }

    setTime(time) {
      this.uniforms.iTime = time;
    }
  }

  class Main {
    constructor() {
      this.filter = null;
    }

    init(cav, element, store, PIXI) {
      // 创建噪点滤镜
      this.filter = new ShadertoyTVFilter({
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
