EModule.define('mtFireFilter', [], function () {
  // 自定义shader特效类
  class RetroMonitorFilter extends PIXI.Filter {
    constructor(options) {
      const vertex = `
      attribute vec2 aVertexPosition;
      attribute vec2 aTextureCoord;
      uniform mat3 projectionMatrix;
      varying vec2 vTextureCoord;

      void main() {
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
      }
    `;

      const fragment = `
      precision highp float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform float time;
      uniform vec2 iResolution;

      // 层B - 绿色荧光、色彩偏移、动态干扰
      vec4 layerB(vec2 uv, float iTime) {
        vec2 px = 3.0 / vec2(640.0, 360.0);
        vec4 tex = texture2D(uSampler, uv);
        float newG = min(tex.g, max(tex.r, tex.b));
        float d = abs(tex.g - newG);
        tex.g = newG * 0.9;

        if (d > 0.0) {
          vec2 off = uv;
          off -= 0.5 * px;
          vec4 tex2 = texture2D(uSampler, off);
          off += px;
          tex2 += texture2D(uSampler, off);
          
          off.x -= px.x - 0.018 * sin(iTime * 4.1 + tex2.r);
          off.y += px.y + 0.015 * cos(iTime * 4.1 + tex2.g);
          tex2 += texture2D(uSampler, off);
          
          off.y -= px.y;
          tex2 += texture2D(uSampler, off);
          
          tex2 /= 4.013;
          tex2 = clamp(tex2 * 1.02 - 0.012, 0.0, 1.0);
          tex = max(clamp(tex * (1.0 - d), 0.0, 1.0), mix(tex, tex2, smoothstep(-0.3, 0.23, d)));
        }
        return tex;
      }

      // 层A - 边缘发光、画面扭曲、黄色描边
      vec4 layerA(vec2 uv, float iTime) {
        vec2 px = 1.5 / vec2(640.0, 360.0);
        vec4 tx = texture2D(uSampler, uv);

        float dist = distance(tx, texture2D(uSampler, uv + px));
        px.y *= -1.0;
        dist += distance(tx, texture2D(uSampler, uv + px));
        px.x *= -1.0;
        dist += distance(tx, texture2D(uSampler, uv + px));
        px.y *= -1.0;
        dist += distance(tx, texture2D(uSampler, uv + px));

        uv *= mat2(0.99, 0.01, -0.001, 0.99);
        vec4 col = texture2D(uSampler, uv + 0.002) * vec4(0.91, 0.847, 0.0, 1.0);
        col += vec4(smoothstep(0.3, 0.8, dist), smoothstep(0.3, 1.4, dist), 0.0, 1.0) * 0.175;
        return col;
      }

      void main() {
        vec2 uv = vTextureCoord;
        float iTime = time;

        vec4 base = texture2D(uSampler, uv);
        vec4 b = layerB(uv, iTime);
        vec4 a = layerA(uv, iTime);
        vec4 final = max(b, a);

        gl_FragColor = final;
      }
    `;

      super(vertex, fragment, {
        time: 0,
        iResolution: [options.width, options.height],
      });
    }

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
      this.filter = new RetroMonitorFilter({
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
