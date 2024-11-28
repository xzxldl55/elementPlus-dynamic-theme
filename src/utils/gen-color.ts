/**
 * 颜色生成
 */

type RGB = {
  r: number;
  g: number;
  b: number;
};
type HSL = {
  h: number;
  s: number;
  l: number;
};

type HEX_VALUE =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F';

// 组合字符串类型枚举的数量太多了，没办法限定了直接string
// type HEX =
//   | `#${HEX_VALUE}${HEX_VALUE}${HEX_VALUE}`
//   | `#${HEX_VALUE}${HEX_VALUE}${HEX_VALUE}${HEX_VALUE}${HEX_VALUE}${HEX_VALUE}`;
type HEX = string;

type GenColorList = {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
};

const RGBUnit = 255;
const HEX_MAP: Record<HEX_VALUE, number> = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  A: 10,
  B: 11,
  C: 12,
  D: 13,
  E: 14,
  F: 15,
};

// 归一化处理，统一返回 HEX 类型的颜色值
function normalizationColor(color: string): HEX {
  const prefix = /^(#|hsl|rgb|rgba)/i.exec(color)?.[1];

  if (!prefix) {
    throw new TypeError('color is invalid.');
  }

  const colorVal = color.replace(prefix, '').trim();
  if (prefix === '#') {
    return fixHexVal(colorVal);
  } else if (prefix.toLocaleLowerCase() === 'hsl') {
    return fixHslVal(colorVal);
  } else {
    return fixRgbVal(colorVal);
  }

  function fixHexVal(val: string) {
    const len = val.length;
    if (len === 8) {
      return `#${val.substring(0, 6)}`; // 舍弃掉透明度
    } else if (len === 6) {
      return `#${val}`;
    } else if (len === 3) {
      return val.split('').reduce((pre, cur) => `${pre}${cur + cur}`, '#');
    } else {
      throw new TypeError('hex color is invalid.');
    }
  }

  function fixHslVal(val: string) {
    const hslVal = val
      .substring(1, val.length - 1)
      .split(',')
      .map((v) => parseInt(v.trim()));
    return hslToHex({
      h: hslVal[0],
      s: hslVal[1],
      l: hslVal[2],
    });
  }

  function fixRgbVal(val: string) {
    const rgb = val
      .substring(1, val.length - 1)
      .split(',')
      .map((v) => parseInt(v.trim()));

    // 舍弃掉alphe
    return rgbToHex({
      r: rgb[0],
      g: rgb[1],
      b: rgb[2],
    });
  }
}

/**
 * RGB颜色转HSL颜色值
 * @param r 红色值
 * @param g 绿色值
 * @param b 蓝色值
 * @returns { h: [0, 360]; s: [0, 1]; l: [0, 1] }
 */
function rgbToHsl(rgb: RGB): HSL {
  let { r, g, b } = rgb;
  const hsl = {
    h: 0,
    s: 0,
    l: 0,
  };

  // 计算rgb基数 ∈ [0, 1]
  r /= RGBUnit;
  g /= RGBUnit;
  b /= RGBUnit;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  // 计算h
  if (max === min) {
    hsl.h = 0;
  } else if (max === r) {
    hsl.h = 60 * ((g - b) / (max - min)) + (g >= b ? 0 : 360);
  } else if (max === g) {
    hsl.h = 60 * ((b - r) / (max - min)) + 120;
  } else {
    hsl.h = 60 * ((r - g) / (max - min)) + 240;
  }
  hsl.h = hsl.h > 360 ? hsl.h - 360 : hsl.h;

  // 计算l
  hsl.l = (max + min) / 2;

  // 计算s
  if (hsl.l === 0 || max === min) {
    // 灰/白/黑
    hsl.s = 0;
  } else if (hsl.l > 0 && hsl.l <= 0.5) {
    hsl.s = (max - min) / (max + min);
  } else {
    hsl.s = (max - min) / (2 - (max + min));
  }

  return hsl;
}

/**
 * hsl -> rgb
 * @param h [0, 360]
 * @param s [0, 1]
 * @param l [0, 1]
 * @returns RGB
 */
function hslToRgb(hsl: HSL): RGB {
  const { h, s, l } = hsl;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hUnit = h / 360; // 色相转换为 [0, 1]

  const Cr = fillCircleVal(hUnit + 1 / 3);
  const Cg = fillCircleVal(hUnit);
  const Cb = fillCircleVal(hUnit - 1 / 3);

  // 保持 [0, 1] 环状取值
  function fillCircleVal(val: number): number {
    return val < 0 ? val + 1 : val > 1 ? val - 1 : val;
  }

  function computedRgb(val: number): number {
    let colorVal: number;
    if (val < 1 / 6) {
      colorVal = p + (q - p) * 6 * val;
    } else if (val >= 1 / 6 && val < 1 / 2) {
      colorVal = q;
    } else if (val >= 1 / 2 && val < 2 / 3) {
      colorVal = p + (q - p) * 6 * (2 / 3 - val);
    } else {
      colorVal = p;
    }
    return colorVal * 255;
  }

  return {
    r: Number(computedRgb(Cr).toFixed(0)),
    g: Number(computedRgb(Cg).toFixed(0)),
    b: Number(computedRgb(Cb).toFixed(0)),
  };
}

/**
 * 16进制颜色转换RGB
 * @param color #rrggbb
 * @returns RGB
 */
function hexToRGB(hex: HEX): RGB {
  hex = hex.toUpperCase();
  const hexRegExp = /^#([0-9A-F]{6})$/;
  if (!hexRegExp.test(hex)) {
    throw new Error('请传入合法的16进制颜色值，eg: #FF0000');
  }

  const hexValArr = (hexRegExp.exec(hex)?.[1] || '000000').split(
    ''
  ) as Array<HEX_VALUE>;

  return {
    r: HEX_MAP[hexValArr[0]] * 16 + HEX_MAP[hexValArr[1]],
    g: HEX_MAP[hexValArr[2]] * 16 + HEX_MAP[hexValArr[3]],
    b: HEX_MAP[hexValArr[4]] * 16 + HEX_MAP[hexValArr[5]],
  };
}

/**
 * rgb 转 16进制
 * @param rgb RGB
 * @returns #HEX{6}
 */
function rgbToHex(rgb: RGB): HEX {
  const HEX_MAP_REVERSE: Record<string, HEX_VALUE> = {};
  for (const key in HEX_MAP) {
    HEX_MAP_REVERSE[HEX_MAP[key as HEX_VALUE]] = key as HEX_VALUE;
  }
  function getRemainderAndQuotient(val: number): `${HEX_VALUE}${HEX_VALUE}` {
    val = Math.round(val);
    return `${HEX_MAP_REVERSE[Math.floor(val / 16)]}${
      HEX_MAP_REVERSE[val % 16]
    }`;
  }

  return `#${getRemainderAndQuotient(rgb.r)}${getRemainderAndQuotient(
    rgb.g
  )}${getRemainderAndQuotient(rgb.b)}`;
}

// hsl 转 16进制
function hslToHex(hsl: HSL): HEX {
  return rgbToHex(hslToRgb(hsl));
}

// 16进制 转 hsl
function hexToHsl(hex: HEX): HSL {
  return rgbToHsl(hexToRGB(hex));
}

// 混合基础色获取
function getMixColorFromVar(isDark?: boolean) {
  const VAR_WHITE = '--el-color-white';
  const VAR_BLACK = '--el-color-black';
  const VAR_BG = '--el-bg-color';

  let mixLightColor, mixDarkColor;

  if (isDark) {
    mixLightColor = getComputedStyle(document.documentElement)
      .getPropertyValue(VAR_BG)
      .trim();
    mixDarkColor = getComputedStyle(document.documentElement)
      .getPropertyValue(VAR_WHITE)
      .trim();
  } else {
    mixLightColor = getComputedStyle(document.documentElement)
      .getPropertyValue(VAR_WHITE)
      .trim();
    mixDarkColor = getComputedStyle(document.documentElement)
      .getPropertyValue(VAR_BLACK)
      .trim();
  }

  mixLightColor = hexToRGB(normalizationColor(mixLightColor));
  mixDarkColor = hexToRGB(normalizationColor(mixDarkColor));

  return {
    mixLightColor,
    mixDarkColor,
  };
}

// 生成混合色（混黑 + 混白）
function genMixColor(
  base: string,
  isDark?: boolean
): {
  DEFAULT: HEX;
  dark: GenColorList;
  light: GenColorList;
} {
  // 基准色统一转换为RGB
  base = normalizationColor(base);
  const rgbBase = hexToRGB(base);

  const { mixLightColor, mixDarkColor } = getMixColorFromVar(isDark);

  // 混合色
  function mix(color: RGB, mixColor: RGB, weight: number): RGB {
    return {
      r: color.r * (1 - weight) + mixColor.r * weight,
      g: color.g * (1 - weight) + mixColor.g * weight,
      b: color.b * (1 - weight) + mixColor.b * weight,
    };
  }

  return {
    DEFAULT: base,
    dark: {
      1: rgbToHex(mix(rgbBase, mixDarkColor, 0.1)),
      2: rgbToHex(mix(rgbBase, mixDarkColor, 0.2)),
      3: rgbToHex(mix(rgbBase, mixDarkColor, 0.3)),
      4: rgbToHex(mix(rgbBase, mixDarkColor, 0.4)),
      5: rgbToHex(mix(rgbBase, mixDarkColor, 0.5)),
      6: rgbToHex(mix(rgbBase, mixDarkColor, 0.6)),
      7: rgbToHex(mix(rgbBase, mixDarkColor, 0.7)),
      8: rgbToHex(mix(rgbBase, mixDarkColor, 0.8)),
      9: rgbToHex(mix(rgbBase, mixDarkColor, 0.9)),
    },
    light: {
      1: rgbToHex(mix(rgbBase, mixLightColor, 0.1)),
      2: rgbToHex(mix(rgbBase, mixLightColor, 0.2)),
      3: rgbToHex(mix(rgbBase, mixLightColor, 0.3)),
      4: rgbToHex(mix(rgbBase, mixLightColor, 0.4)),
      5: rgbToHex(mix(rgbBase, mixLightColor, 0.5)),
      6: rgbToHex(mix(rgbBase, mixLightColor, 0.6)),
      7: rgbToHex(mix(rgbBase, mixLightColor, 0.7)),
      8: rgbToHex(mix(rgbBase, mixLightColor, 0.8)),
      9: rgbToHex(mix(rgbBase, mixLightColor, 0.9)),
    },
  };
}

export {
  genMixColor,
  rgbToHsl,
  rgbToHex,
  hslToRgb,
  hslToHex,
  hexToRGB,
  hexToHsl,
};
