// 生成颜色css变量名
function genSimilarColorsName(brandName) {
  return {
    lighter: `var(--${brandName}-lighter-color)`,
    light: `var(--${brandName}-light-color)`,
    DEFAULT: `var(--${brandName}-color)`,
    deep: `var(--${brandName}-deep-color)`,
    deeper: `var(--${brandName}-deeper-color)`
  };
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,vue}'],
  theme: {
    extend: {},
    colors: {
      white: '#fff',
      black: '#191919',
      transparent: 'transparent',
      // 直接使用css变量
      primary: genSimilarColorsName('primary'),
      info: genSimilarColorsName('info'),
      success: genSimilarColorsName('success'),
      warning: genSimilarColorsName('warning'),
      danger: genSimilarColorsName('danger')
    }
  },
  corePlugins: {
    preflight: false
  }
}
