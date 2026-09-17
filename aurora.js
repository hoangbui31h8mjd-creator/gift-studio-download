/* React Bits Aurora — David Haz. MIT + Commons Clause.
 * Shader supplied by the user, retained verbatim.
 * React/OGL lifecycle adapted to native WebGL2 for this static website.
 * See third-party/react-bits-LICENSE.txt and docs/third-party.md.
 */
(function () {
  'use strict';
const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
uniform float uLightMode;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);
  
  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);
  
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;
  
  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  
  vec3 auroraColor = intensity * rampColor;
  
  if (uLightMode > 0.5) {
    float energy = clamp(max(intensity, 0.0), 0.0, 1.0);
    float coverage = clamp(auroraAlpha * (0.55 + 0.45 * energy), 0.0, 0.86);
    vec3 chroma = pow(clamp(rampColor, 0.0, 1.0), vec3(1.2));
    float chromaPeak = max(chroma.r, max(chroma.g, chroma.b));
    chroma /= max(chromaPeak, 0.0001);
    fragColor = vec4(mix(vec3(1.0), chroma, min(coverage * 1.08, 0.94)), 1.0);
  } else {
    fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
  }
}
`;


  const host = document.querySelector('.aurora-background');
  if (!host) return;
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', {
    alpha: true, premultipliedAlpha: true, antialias: true
  });
  // Unsupported WebGL: leave the existing dark page fully usable.
  if (!gl) return;

  let program, buffer, vertexShader, fragmentShader;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      throw new Error('Aurora shader could not compile');
    }
    return shader;
  }
  function release() {
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
  }
  try {
    vertexShader = compile(gl.VERTEX_SHADER, VERT);
    fragmentShader = compile(gl.FRAGMENT_SHADER, FRAG);
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Aurora shader could not link');
    gl.useProgram(program);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  } catch (error) {
    release();
    return;
  }

  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const uniform = name => gl.getUniformLocation(program, name);
  const timeLocation = uniform('uTime');
  const sizeLocation = uniform('uResolution');
  gl.uniform1f(uniform('uAmplitude'), 1);
  gl.uniform1f(uniform('uBlend'), 0.5);
  gl.uniform1f(uniform('uLightMode'), 0);
  // The original three-stop ramp; only green is replaced with violet.
  gl.uniform3fv(uniform('uColorStops[0]'), new Float32Array([
    82 / 255, 39 / 255, 1,
    176 / 255, 107 / 255, 1,
    82 / 255, 39 / 255, 1
  ]));
  host.appendChild(canvas);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const forced = window.matchMedia('(forced-colors: active)');
  let frame = 0, lastTime = null, elapsed = 0, lastDraw = -Infinity;
  let inView = true, pageActive = true, disposed = false;
  function draw() {
    gl.uniform1f(timeLocation, elapsed * 0.001);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function resize() {
    const density = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(host.clientWidth * density));
    canvas.height = Math.max(1, Math.round(host.clientHeight * density));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(sizeLocation, canvas.width, canvas.height);
    draw();
  }
  function tick(now) {
    frame = 0;
    if (disposed) return;
    if (lastTime !== null) elapsed += now - lastTime;
    lastTime = now;
    // Cap background rendering at 30 FPS while preserving the original speed.
    if (now - lastDraw >= 1000 / 30) {
      draw();
      lastDraw = now;
    }
    frame = requestAnimationFrame(tick);
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = null;
    lastDraw = -Infinity;
  }
  function sync() {
    stop();
    if (disposed || document.hidden || !pageActive || !inView || forced.matches) return;
    draw();
    if (!reduced.matches) frame = requestAnimationFrame(tick);
  }
  function pageHide() { pageActive = false; sync(); }
  function pageShow() { pageActive = true; sync(); }
  function appearanceChange() {
    if (!forced.matches) resize();
    sync();
  }
  const observer = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); })
    : null;
  function dispose() {
    disposed = true;
    stop();
    observer?.disconnect();
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', sync);
    reduced.removeEventListener('change', sync);
    forced.removeEventListener('change', appearanceChange);
    window.removeEventListener('pagehide', pageHide);
    window.removeEventListener('pageshow', pageShow);
    release();
    canvas.remove();
  }
  // If the GPU context disappears, keep a clean dark fallback until reload.
  canvas.addEventListener('webglcontextlost', dispose, { once: true });
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  forced.addEventListener('change', appearanceChange);
  window.addEventListener('pagehide', pageHide);
  window.addEventListener('pageshow', pageShow);
  observer?.observe(host);
  resize();
  sync();
})();
