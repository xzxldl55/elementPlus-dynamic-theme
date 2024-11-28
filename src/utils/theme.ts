/**
 * 主题色相关
 */

import { merge } from 'lodash-es';
import { genMixColor } from './gen-color';
import { useDark } from '@vueuse/core';

const THEME_KEY = 'theme';

export type Theme = {
  colors: {
    primary?: string;
    info?: string;
    warning?: string;
    success?: string;
    danger?: string;
  };
};

// 默认主题
export const defaultThemeConfig: Theme = {
  colors: {
    primary: '#409EFF',
    info: '#eeeeee',
    warning: '#fbbd23',
    danger: '#f87272',
    success: '#36d399',
  },
};

// 设置css变量
function setStyleProperty(propName: string, value: string) {
  document.documentElement.style.setProperty(propName, value);
}

function updateThemeColorVar({ colors }: Theme) {
  const isDark = useDark();

  // 遍历当前主题色，生成混合色，并更新到css变量（tailwind + elementPlus）
  for (const brand in colors) {
    updateBrandExtendColorsVar(
      colors[brand as keyof Theme['colors']] as string,
      brand
    );
  }

  function updateBrandExtendColorsVar(color: string, name: string) {
    let { DEFAULT, dark, light } = genMixColor(color, isDark.value);

    // 每种主题色由浅到深分为五个阶梯以供开发者使用。
    setStyleProperty(`--${name}-lighter-color`, light[5]);
    setStyleProperty(`--${name}-light-color`, light[3]);
    setStyleProperty(`--${name}-color`, DEFAULT);
    setStyleProperty(`--${name}-deep-color`, dark[2]);
    setStyleProperty(`--${name}-deeper-color`, dark[4]);

    // elementPlus主题色更新
    setStyleProperty(`--el-color-${name}`, DEFAULT);
    setStyleProperty(`--el-color-${name}-dark-2`, dark[2]);
    setStyleProperty(`--el-color-${name}-light-3`, light[3]);
    setStyleProperty(`--el-color-${name}-light-5`, light[5]);
    setStyleProperty(`--el-color-${name}-light-7`, light[7]);
    setStyleProperty(`--el-color-${name}-light-8`, light[8]);
    setStyleProperty(`--el-color-${name}-light-9`, light[9]);
  }
}

// 获取主题对象
export const getTheme = (): Theme => {
  const theme = localStorage.getItem(THEME_KEY);
  return theme ? JSON.parse(theme) : defaultThemeConfig;
};

export const setTheme = (data: Theme = defaultThemeConfig) => {
  const oldTheme = getTheme();

  // 将传入配置与旧的主题合并，以填补缺省的值
  data = merge(oldTheme, data || {});

  // 将缓存到浏览器
  localStorage.setItem(THEME_KEY, JSON.stringify(data));

  // 将主题更新到css变量中，使之生效
  updateThemeColorVar(data);
};
