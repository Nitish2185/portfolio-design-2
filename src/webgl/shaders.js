// ---------------------------------------------------------------------------
// Canon F-1: every mesh writes its luminance + depth, the outline pass turns
// that into a sobel line drawing (grey for the body, orange for the hovered part)
// ---------------------------------------------------------------------------

export const cameraVertexShader = /* glsl */ `
varying vec3 vPosition;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    vPosition = modelPosition.xyz;
}`;

export const cameraFragmentShader = /* glsl */ `
#include <common>

varying vec3 vPosition;
uniform vec3 uColor;

float normalizeRange(float value, float oldMin, float oldMax, float newMin, float newMax) {
    float normalized = (value - oldMin) / (oldMax - oldMin);
    return newMin + (newMax - newMin) * normalized;
}

void main()
{
    float dist = distance(vPosition, cameraPosition);
    float l = luminance(uColor);

    gl_FragColor = vec4(vec3(l), normalizeRange(dist, 0., 20., 0., 1.));

    #include <colorspace_fragment>
}`;

const sobel = /* glsl */ `
float sobel(sampler2D tex, vec2 texel)
{
    const mat3 Gx = mat3(-1, -2, -1, 0, 0, 0, 1, 2, 1);
    const mat3 Gy = mat3(-1, 0, 1, -2, 0, 2, -1, 0, 1);

    float tx0y0 = texture2D(tex, vUv + texel * vec2(-1, -1)).r;
    float tx0y1 = texture2D(tex, vUv + texel * vec2(-1,  0)).r;
    float tx0y2 = texture2D(tex, vUv + texel * vec2(-1,  1)).r;
    float tx1y0 = texture2D(tex, vUv + texel * vec2( 0, -1)).r;
    float tx1y1 = texture2D(tex, vUv + texel * vec2( 0,  0)).r;
    float tx1y2 = texture2D(tex, vUv + texel * vec2( 0,  1)).r;
    float tx2y0 = texture2D(tex, vUv + texel * vec2( 1, -1)).r;
    float tx2y1 = texture2D(tex, vUv + texel * vec2( 1,  0)).r;
    float tx2y2 = texture2D(tex, vUv + texel * vec2( 1,  1)).r;

    float valueGx = Gx[0][0] * tx0y0 + Gx[1][0] * tx1y0 + Gx[2][0] * tx2y0 +
        Gx[0][1] * tx0y1 + Gx[1][1] * tx1y1 + Gx[2][1] * tx2y1 +
        Gx[0][2] * tx0y2 + Gx[1][2] * tx1y2 + Gx[2][2] * tx2y2;

    float valueGy = Gy[0][0] * tx0y0 + Gy[1][0] * tx1y0 + Gy[2][0] * tx2y0 +
        Gy[0][1] * tx0y1 + Gy[1][1] * tx1y1 + Gy[2][1] * tx2y1 +
        Gy[0][2] * tx0y2 + Gy[1][2] * tx1y2 + Gy[2][2] * tx2y2;

    return sqrt((valueGx * valueGx) + (valueGy * valueGy));
}`;

export const outlineVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const outlineFragmentShader = /* glsl */ `
uniform sampler2D tDiffuse;
uniform sampler2D tDiffuse1;
uniform sampler2D tDiffuse2;
uniform vec2 resolution;
uniform float uYprogress;
uniform vec3 uBackgroundColor;
uniform vec3 uSelectionColor;
varying vec2 vUv;

${sobel}

void main() {
    vec2 texel = vec2(1.0 / resolution.x, 1.0 / resolution.y);

    vec4 t = texture2D(tDiffuse, vUv);
    vec4 t1 = texture2D(tDiffuse1, vUv);
    vec4 t2 = texture2D(tDiffuse2, vUv);

    if (t1.a == 0.) t1.a = 1.;
    if (t2.a == 0.) t2.a = 1.;

    float G = sobel(tDiffuse1, texel);
    G = G > 0.001 ? 1. : 0.;
    float Gs = sobel(tDiffuse2, texel);
    Gs = Gs > 0.001 ? 1. : 0.;

    vec4 s1 = vec4(vec3(G), 1.);
    s1.rgb *= 0.4;

    vec4 s2 = vec4(vec3(Gs), 1.);
    s2.rgb *= uSelectionColor;

    vec4 sobelTexture = t1.a > t2.a ? s2 : s1;

    // Once the camera section is scrolled through, hand over to the regular render
    vec4 finalTexture = uYprogress >= 1. ? t : sobelTexture;

    if (t1.a == 1. && t2.a == 1. && uYprogress < 1.) {
        finalTexture.a = 0.;
    }
    if (finalTexture.a != 0. && finalTexture.rgb == vec3(0.)) {
        finalTexture.rgb = uBackgroundColor;
    }
    gl_FragColor = finalTexture;

    #include <colorspace_fragment>
}`;

// ---------------------------------------------------------------------------
// Film strip: a plane wrapped into a helix in the vertex shader, sprocket
// holes from an alpha map and negatives drawn from a baked image strip
// ---------------------------------------------------------------------------

export const filmVertexShader = /* glsl */ `
#define PI 3.14159265359

uniform float uPlaneWidth;
uniform float uXZfreq;
uniform float uYfreq;
uniform float uOffset;
uniform float uRadius;
varying vec2 vUv;
varying vec3 vPosition;

void main()
{
    vec3 np = position;
    float theta = -(PI * np.x) / (uPlaneWidth * 0.5);

    np.x = cos(uXZfreq * theta + uOffset) * uRadius;
    np.y += theta * uYfreq;
    np.z = sin(uXZfreq * theta + uOffset) * uRadius;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(np, 1.0);

    vUv = uv;
    vPosition = np;
}`;

export const filmFragmentShader = /* glsl */ `
uniform sampler2D uAlphaMap;
uniform sampler2D uImages;
uniform vec2 uAlphaMapResolution;
uniform float uImagesCount;
uniform vec3 uFilmColor;
uniform float uRepeatFactor;
varying vec2 vUv;

void main()
{
    vec2 cellUvs = vUv;
    vec2 imagesUvs = vUv;

    imagesUvs.x *= uRepeatFactor;

    float cellAspect = uAlphaMapResolution.x / uAlphaMapResolution.y;
    cellUvs.x *= cellAspect * uImagesCount;

    vec4 texel = texture2D(uAlphaMap, cellUvs);
    vec4 images = texture2D(uImages, imagesUvs);

    texel.a = texel.r;
    texel.rgb *= uFilmColor;

    // Render the frames as tinted negatives
    images.r = (1. - images.r) * ceil(images.r) * uFilmColor.r * 0.4;
    images.g = (1. - images.g) * ceil(images.g) * uFilmColor.g * 0.4;
    images.b = (1. - images.b) * ceil(images.b) * uFilmColor.b * 0.4;

    if (!gl_FrontFacing) {
        images.rgb *= 0.3;
        texel.rgb *= 0.6;
    }

    float imgMaxColor = max(max(images.r, images.g), images.b);
    vec3 color = step(0.01, imgMaxColor) * images.rgb + (1. - step(0.01, imgMaxColor)) * texel.rgb;

    gl_FragColor = vec4(color, texel.a);

    #include <colorspace_fragment>
}`;

// ---------------------------------------------------------------------------
// Scan: wipes top-to-bottom through negative → inverted → positive → graded
// ---------------------------------------------------------------------------

export const scanVertexShader = /* glsl */ `
varying vec2 vUv;

void main()
{
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    vUv = uv;
}`;

export const scanFragmentShader = /* glsl */ `
uniform sampler2D uTexture;
uniform vec3 uFilmColor;
uniform float uProgress;
varying vec2 vUv;

void main()
{
    vec4 texel = texture2D(uTexture, vUv);
    float grain = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);

    vec3 inverted = 1.0 - texel.rgb;

    vec3 filmNegative = mix(inverted, uFilmColor, 0.6);
    vec3 whiteBalanced = inverted;
    vec3 filmPositive = texel.rgb;
    vec3 colorsCorrected = texel.rgb;

    filmNegative += grain * 0.05;
    whiteBalanced += grain * 0.05;
    filmPositive += grain * 0.05;
    colorsCorrected += grain * 0.05;

    filmNegative = (filmNegative - 0.5) * 1.3 + 0.5;
    whiteBalanced = (whiteBalanced - 0.5) * 1.1 + 0.5;
    filmPositive = (filmPositive - 0.5) * 0.8 + 0.5;
    colorsCorrected = (colorsCorrected - 0.5) * 1.07 + 0.5;

    float progress = uProgress * 3.;

    filmNegative *= step(clamp(progress, 0., 1.), vUv.y);

    whiteBalanced *= 1. - step(clamp(progress, 0., 1.), vUv.y);
    whiteBalanced *= step(clamp(progress, 1., 2.) - 1., vUv.y);

    filmPositive *= 1. - step(clamp(progress, 1., 2.) - 1., vUv.y);
    filmPositive *= step(clamp(progress, 2., 3.) - 2., vUv.y);

    colorsCorrected *= 1. - step(clamp(progress, 2., 3.) - 2., vUv.y);

    gl_FragColor = vec4(filmNegative + whiteBalanced + filmPositive + colorsCorrected, 1.);
}`;
