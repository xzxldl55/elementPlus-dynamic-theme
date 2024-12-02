具体项目详解可查看：

[基于elementPlus + Tailwindcss的动态主题配置方案](https://juejin.cn/post/7216217118588321853)

[elementPlus 自定义主题在暗黑模式下的问题探究](https://juejin.cn/post/7442573821444390949)

# 基于elementPlus + Tailwindcss的动态主题配置方案
 elementPlus + tailwind 动态主题色配置方案

## 依赖安装

### 1. tailwindcss安装

- 依赖安装

    > pnpm install -D tailwindcss@latest postcss@latest autoprefixer@latest

- 配置初始化

    > npx tailwindcss init -p

**上述操作将自动在项目添加 `postcss.config.js` 与 `tailwind.config.js` 配置文件，将 `tailwindcss` 引入项目，具体配置内容我们暂时无需修改使用默认的即可**

- 项目CSS中引入`tailwindcss`的样式内容

    ```css
    /* index.css(入口文件中引入该入口样式文件) */
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    /* ...其他样式 */
    ```

- 至此`tailwindcss`已经引入项目，但要使得其在我们的vue项目中生效还需要最后一步，在`tailwind.config.js`中修改`content`字段

    ```js
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      content: ['./src/**/*.{js,jsx,ts,tsx,vue}'], // 这里配置要使用Tailwind className的文件地址（tailwind亦将根据这些文件自动进行purge，移除未使用过的类名）
      theme: {
        extend: {},
      },
      plugins: []
    }
    
    ```

### 2. ElementPlus安装

- 依赖安装

> pnpm add element-plus

- 引入到项目

**这里我们用自动按需导入，从而可以引出另一个Tailwind + ElementPlus的问题**

> pnpm add -D unplugin-vue-components unplugin-auto-import

安装自动导入插件，并在`vite.config.ts`使用

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
});
```

到这里，我们就可以直接在项目中使用 `ElementPlus` 的组件了

**elementPlus与Tailwind冲突问题（最新版本无该问题）**

默认情况下`tailwind`会自动导入一份初始化的样式文件（类似我们常用的`reset.css`），其中对各种`html`标签样式进行了初始化。

该初始化文件对`button`标签做了样式处理，与`el-button`组件的样式出现冲突，且由于`tailwind`导入的初始化样式文件`preflight.css`时机要晚与`elementPlus`的样式导入时机，所以导致按钮样式出现问题（样式被`preflight.css`覆盖了）。

**解决方案：**禁止自动导入`preflight.css`，改为手动导入，将其时机提前解决覆盖问题即可。

> `tailwind.config.js`

```js
module.exports = {
  // ...
  corePlugins: {
    preflight: false // 禁用 Preflight
  }
}
```

> `index.css`

```css
/* 手动引入 preflight.css */
@import url("./preflight.css"); /* 可在我的github仓库查看，或在tailwind官网直接获取(https://tailwindcss.com/docs/preflight) */

@tailwind base;
@tailwind components;
@tailwind utilities;
```

`最新版本的elementPlus + tailwindcss下，该问题已修复，如使用过往版本，复现该问题可使用这里的方案修改`

PS：同理，如果出现`tailwind`样式与其他库的样式出现冲突时，也可以使用该方案，修改 `preflight.css`

## 主题方案设计

### 方案选择背景

1. 一般而言，主题方案有几种：
   1. 预先定义好一批当前项目需要使用的颜色变量，后续各种组件颜色都直接使用变量，需要切换颜色时，直接修改变量即可。
   2. 设计好我们需要进行主题配置化的各个组件模块，从而定义 `theme.css` 在其中进行样式覆盖，通过加载不同的 `themeXXX.css`来实现主题替换，这种方案灵活性很高，可以通过修改`theme.css`实现各种定制化需求。
   3. `Vue3 SFC`中我们可以使用 `v-bind()`在 `<style>` 标签内为样式使用变量绑定，基于此我们可以在全局定义好一批颜色变量，然后在 `SFC` 中使用（这里基本理念与方案1一致）。

2. `tailwindcss`支持配置化修改/新增各种主题颜色，能够灵活的适配各种主题方案，这里方案选择上我们可以将其限制要求放到最低，最后考虑问题。

3. `elementPlus`主题配置官方有几种方案，但各有阻碍：

   1. 通过自定义一批`Scss`变量替换掉官方默认的，`elementPlus`的主题系统，会自动根据我们传入的基本颜色来生成一系列混合色来使用（如按钮 focus/actived/static 状态下颜色不同，如primary类型按钮，静止状态下是蓝色，hover时是浅蓝色，点击时是深蓝色）改方案在不进行动态变换时十分方便，毕竟我们只需要传入几个基础的颜色进去就可以了，几近于简单的配置化。

      ```scss
      // element-theme.scss
      /* 只需要重写你需要替换的主题色的即可 */
      /* 在element-plus/theme-chalk/src/common/var.scss内部，会使用我们传入的变量替换默认的进行混合色生成，混合色使用的ScssAPI mix() */
      @forward 'element-plus/theme-chalk/src/common/var.scss' with (
        $colors: (
          'primary': (
            'base': green,
          ),
        ),
      );
      
      // 如果只是按需导入，则可以忽略以下内容。
      // 如果你是全部导入，则添加下面语句:
      // @use "element-plus/theme-chalk/src/index.scss" as *;
      ```

      

   2. 通过`css`变量来一个个替换：这里其实承接了上一个方案，但是更加灵活，上面的方案我们说到 `elementPlus`会根据基础色生成一组混合色，然后它会讲这些颜色写入到一个个`css`变量中去，而各个组件编写时，直接取用这些`css`变量颜色。据此我们也可以通过修改这些`css`变量来进行主题色替换。

      ```css
      :root {
        --el-color-primary: green;
        /* ...其他要替换变量 */
      }
      ```

      但这种方案比较繁琐，我们需要对每一个变量进行替换，要满足我们的主题色替换，需要覆盖 35 个变量（不包含中性色）

综合上述几点，结合我们“动态主题”的需求，可以大致确定使用的方案：

1. 使用`CSS`变量（如存在定制化需求同样可以额外添加`theme.css`的方案，二者可互相配合）。
2. `elementPlus`则需要使用变量覆盖（覆盖35个主题色变量）。因为`Sass`变量覆盖的方法无法在变量中直接使用`CSS`变量（内部混合色算法需要有确定的已知的颜色才能进行，故无法使用不确定的变量），`Sass`变量覆盖的方案，只适用于固定预设好的一组组颜色主题切换方案。
3. 结合上述两点，我们的主题方案就确定了**“`CSS`变量” + “`Tailwind`直接配置变量” + “`elementPlus`基于css变量自行计算混合色覆盖`elementPlus`变量”**

### 主题色品牌设计（brand）

这里由于我们受制于`elementPlus`所以，必须在基于`elementPlus`的品牌色下进行设计

**`ElementPlus Colors`：**

- `primary`： 

  - <p style="color: #409eff;">主色</p>

- `success`：

  - <p style="color: #67c23a;">成功色</p>

- `warning`：

  - <p style="color: #e6a23c;">警告色</p>

- `danger`：

  - <p style="color: #f56c6c;">危险色</p>

- `info`：

  - <p style="color: #909399;">消息色</p>

这里我们没有更多的颜色需求，直接套用这一套品牌的设计

确定主题色外，我们还需要确定主题色的衍生色范围（深浅范围），这里我们参考并简化一下`Tailwind`的`Colors`设计，确立五个范围由浅到深： `lighter`, `light`, `DEFAULT(本身)`, `deep`, `deeper`

### 编码

#### 1. 新建文件`src/utils/theme.ts`统一处理主题色相关逻辑，定义好相关类型，与本地缓存方法，以供统一取用

```ts
// 主题配置类型定义
export type Theme = {
    // 这里留出可拓展空间（如banner图，背景图，文案，标题等），将主题色嵌套在对象内
    colors: {
        primary?: string;
        info?: string;
        warning?: string;
        success?: string;
        danger?: string;
    };
};

// 默认主题配置
export const defaultThemeConfig: Theme = {
    colors: {
        primary: '#FF6A00',
        info: '#eeeeee',
        warning: '#fbbd23',
        danger: '#f87272',
        success: '#36d399',
    },
};

// 本地缓存 key
const THEME_KEY = 'theme';

// 获取本地缓存主题
export const getTheme = (): Theme => {
    const theme = localStorage.getItem(THEME_KEY);
    return theme ? JSON.parse(theme) : defaultThemeConfig;
};

// 设置主题
export const setTheme = (data: Theme = defaultThemeConfig) => {
    const oldTheme = getTheme();

    // 将传入配置与旧的主题合并，以填补缺省的值
    data = merge(oldTheme, data || {});

    // 将缓存到浏览器
    localStorage.setItem(THEME_KEY, JSON.stringify(data));

    // TODO:将主题更新到css变量中，使之生效
};
```

#### 2. 编写`CSS`变量覆盖方法

```ts
import { genMixColor } from './gen-color.ts'

// ...

// 设置css变量
function setStyleProperty(propName: string, value: string) {
    document.documentElement.style.setProperty(propName, value);
}

// 更新主题色到css变量
function updateThemeColorVar({ colors }: Theme) {
    // 遍历当前主题色，生成混合色，并更新到css变量（tailwind + elementPlus）
    for (const brand in colors) {
        updateBrandExtendColorsVar(
            colors[brand as keyof Theme['colors']] as string,
            brand
        );
    }

    function updateBrandExtendColorsVar(color: string, name: string) {
        // TODO:生成混合色
        const { DEFAULT, dark, light } = genMixColor(color);
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

// ...

// 设置主题
export const setTheme = (data: Theme = defaultThemeConfig) => {
    //...

    // 将主题更新到css变量中，使之生效
    updateThemeColorVar(data);
};
```

#### 3. 完成混合色生成算法`genMixColor`，接受一个参数 `base` 基础色，支持 `hsl/rgb/hex` 三种类型，输出一个基于此的深浅混合色系列。该算法参考`Sass API mix(color, mixColor, weight)`与`elementPlus`相同。

```ts
// src/utils/gen-color.ts

// 定义颜色类型
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
type HEX =
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

const RGBUnit = 255;
const HEX_MAP: Record<HEX, number> = {
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
const rgbWhite = {
    r: 255,
    g: 255,
    b: 255,
};
const rgbBlack = {
    r: 0,
    g: 0,
    b: 0,
};

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
function hexToRGB(hex: string): RGB {
    hex = hex.toUpperCase();
    const hexRegExp = /^#([0-9A-F]{6})$/;
    if (!hexRegExp.test(hex)) {
        throw new Error('请传入合法的16进制颜色值，eg: #FF0000');
    }

    const hexValArr = (hexRegExp.exec(hex)?.[1] || '000000').split(
        ''
    ) as Array<HEX>;

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
function rgbToHex(rgb: RGB): string {
    const HEX_MAP_REVERSE: Record<string, HEX> = {};
    for (const key in HEX_MAP) {
        HEX_MAP_REVERSE[HEX_MAP[key as HEX]] = key as HEX;
    }
    function getRemainderAndQuotient(val: number): string {
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
function hslToHex(hsl: HSL): string {
    return rgbToHex(hslToRgb(hsl));
}

// 16进制 转 hsl
function hexToHsl(hex: string): HSL {
    return rgbToHsl(hexToRGB(hex));
}

// 生成混合色（混黑 + 混白）
function genMixColor(base: string | RGB | HSL): {
    DEFAULT: string;
    dark: {
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
    light: {
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
} {
    // 基准色统一转换为RGB，方便进行混合色生成
    if (typeof base === 'string') {
        base = hexToRGB(base);
    } else if ('h' in base) {
        base = hslToRgb(base);
    }

    // 混合色（这里参考Sass mix函数逻辑）
    function mix(color: RGB, mixColor: RGB, weight: number): RGB {
        return {
            r: color.r * (1 - weight) + mixColor.r * weight,
            g: color.g * (1 - weight) + mixColor.g * weight,
            b: color.b * (1 - weight) + mixColor.b * weight,
        };
    }

    return {
        DEFAULT: rgbToHex(base),
        dark: {
            1: rgbToHex(mix(base, rgbBlack, 0.1)),
            2: rgbToHex(mix(base, rgbBlack, 0.2)),
            3: rgbToHex(mix(base, rgbBlack, 0.3)),
            4: rgbToHex(mix(base, rgbBlack, 0.4)),
            5: rgbToHex(mix(base, rgbBlack, 0.5)),
            6: rgbToHex(mix(base, rgbBlack, 0.6)),
            7: rgbToHex(mix(base, rgbBlack, 0.7)),
            8: rgbToHex(mix(base, rgbBlack, 0.78)),
            9: rgbToHex(mix(base, rgbBlack, 0.85)),
        },
        light: {
            1: rgbToHex(mix(base, rgbWhite, 0.1)),
            2: rgbToHex(mix(base, rgbWhite, 0.2)),
            3: rgbToHex(mix(base, rgbWhite, 0.3)),
            4: rgbToHex(mix(base, rgbWhite, 0.4)),
            5: rgbToHex(mix(base, rgbWhite, 0.5)),
            6: rgbToHex(mix(base, rgbWhite, 0.6)),
            7: rgbToHex(mix(base, rgbWhite, 0.7)),
            8: rgbToHex(mix(base, rgbWhite, 0.78)),
            9: rgbToHex(mix(base, rgbWhite, 0.85)),
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
```

#### 4. 项目入口初始化设置主题色

```ts
// src/main.ts
import { createApp } from 'vue'
import './assets/style.scss'
import App from './App.vue'
import { setTheme } from './utils/theme';

setTheme();

createApp(App).mount('#app')
```

#### 5. 编写预览代码查看效果

```vue
<!--App.vue-->
<script setup lang="ts">
import { Operation } from '@element-plus/icons-vue';
import ElementBox from './components/element-box.vue';
</script>

<template>
    <div class="w-screen h-screen flex flex-col">
        <el-button type="primary">primary 按钮</el-button>
        <el-button type="success">success 按钮</el-button>
        <el-button type="danger">danger 按钮</el-button>
        <el-button type="info">info 按钮</el-button>
        <el-button type="warning">warning 按钮</el-button>
    </div>
</template>

<style scoped>
.footer {
    @apply flex-shrink-0 h-40 p-6 bg-black;
}
</style>
```


![image-20230329172450904.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/66b9de233e5b4fb4a126f93b48cf3111~tplv-k3u1fbpfcp-watermark.image?)

可以看到，按钮颜色正是我们配置的主题色。

#### 6. `Tailwind` 引用主题色

想要在项目里舒舒服服的使用主题色，我们还差了临门一脚 —— 在 `TailwindCss` 引用主题色变量。

```js
// tailwind.config.js
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
  // ...
  theme: {
    // ...
    // 修改Tailwind主题色配置，使用我们设计的这一套颜色
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
  // ...
}
```

在项目中预览效果

```vue
<!--App.vue-->
...

<template>
	...
	<span
        class="bg-gradient-to-r from-primary-lighter to-primary-deeper bg-clip-text text-transparent text-3xl font-bold"
    >
        我只是个渐变色
    </span>
</template>
...
```


![image-20230329173016354.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/038cee21be944ffea1f28cb65b97df01~tplv-k3u1fbpfcp-watermark.image?)

这样就完成了整个项目中的动态主题使用了，我们可以编写一个简单的页面来查看效果。

### 编写预览代码

```vue
<!--element-box.vue-->
<template>
    <el-row class="mb-2" :gutter="24">
        <el-col :span="2">
            <p class="title">按钮：</p>
        </el-col>
        <el-col :span="4">
            <el-button type="primary">primary 按钮</el-button>
        </el-col>
        <el-col :span="4">
            <el-button type="success">success 按钮</el-button>
        </el-col>
        <el-col :span="4">
            <el-button type="danger">danger 按钮</el-button>
        </el-col>
        <el-col :span="4">
            <el-button type="info">info 按钮</el-button>
        </el-col>
        <el-col :span="4">
            <el-button type="warning">warning 按钮</el-button>
        </el-col>
    </el-row>
    <p class="title">表单：</p>
    <el-form :label-width="120" label-position="left">
        <el-form-item label="Activity name">
            <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Activity zone">
            <el-select
                v-model="form.region"
                placeholder="please select your zone"
            >
                <el-option label="Zone one" value="shanghai" />
                <el-option label="Zone two" value="beijing" />
            </el-select>
        </el-form-item>
        <el-form-item label="Activity time">
            <el-date-picker
                v-model="form.date1"
                type="date"
                placeholder="Pick a date"
            />
            <span class="text-info-deeper mr-8">-</span>
            <el-time-picker v-model="form.date2" placeholder="Pick a time" />
        </el-form-item>
        <el-form-item label="Instant delivery">
            <el-switch v-model="form.delivery" />
        </el-form-item>
        <el-form-item label="Activity type">
            <el-checkbox-group v-model="form.type">
                <el-checkbox label="Online activities" name="type" />
                <el-checkbox label="Promotion activities" name="type" />
                <el-checkbox label="Offline activities" name="type" />
                <el-checkbox label="Simple brand exposure" name="type" />
            </el-checkbox-group>
        </el-form-item>
        <el-form-item label="Resources">
            <el-radio-group v-model="form.resource">
                <el-radio label="Sponsor" />
                <el-radio label="Venue" />
            </el-radio-group>
        </el-form-item>
        <el-form-item label="Activity form">
            <el-input v-model="form.desc" type="textarea" />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="onSubmit">Create</el-button>
            <el-button>Cancel</el-button>
        </el-form-item>
    </el-form>
    <p class="title">标签：</p>
    <div class="tag-group my-2 flex flex-wrap gap-1 items-center">
        <span class="tag-group__title m-1 line-height-2">Dark</span>
        <el-tag
            v-for="item in items"
            :key="item.label"
            :type="item.type"
            class="mx-1"
            effect="dark"
        >
            {{ item.label }}
        </el-tag>
        <el-tag
            v-for="item in items"
            :key="item.label"
            :type="item.type"
            class="mx-1"
            effect="dark"
            closable
        >
            {{ item.label }}
        </el-tag>
    </div>
    <div class="tag-group my-2 flex flex-wrap gap-1 items-center">
        <span class="tag-group__title m-1">Light</span>
        <el-tag
            v-for="item in items"
            :key="item.label"
            class="mx-1"
            :type="item.type"
            effect="light"
        >
            {{ item.label }}
        </el-tag>
        <el-tag
            v-for="item in items"
            :key="item.label"
            class="mx-1"
            :type="item.type"
            effect="light"
            closable
        >
            {{ item.label }}
        </el-tag>
    </div>
    <div class="tag-group my-2 flex flex-wrap gap-1 items-center">
        <span class="tag-group__title m-1">Plain</span>
        <el-tag
            v-for="item in items"
            :key="item.label"
            class="mx-1"
            :type="item.type"
            effect="plain"
        >
            {{ item.label }}
        </el-tag>
        <el-tag
            v-for="item in items"
            :key="item.label"
            class="mx-1"
            :type="item.type"
            effect="plain"
            closable
        >
            {{ item.label }}
        </el-tag>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { ref } from 'vue';
import type { TagProps } from 'element-plus';

const form = reactive({
    name: '',
    region: '',
    date1: '',
    date2: '',
    delivery: false,
    type: [],
    resource: '',
    desc: '',
});
const onSubmit = () => {
    console.log('submit!');
};

type Item = { type: TagProps['type']; label: string };

const items = ref<Array<Item>>([
    { type: '', label: 'Tag 1' },
    { type: 'success', label: 'Tag 2' },
    { type: 'info', label: 'Tag 3' },
    { type: 'danger', label: 'Tag 4' },
    { type: 'warning', label: 'Tag 5' },
]);
</script>

<style lang="scss" scoped>
.title {
    @apply leading-8 text-base font-bold;
}
</style>
```


![image-20230330143346504.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c3c108453e6e4cd9b92b27edc717e69c~tplv-k3u1fbpfcp-watermark.image?)

### 编写测试主题切换代码

这里在前端简单编写一个修改主题颜色的组件，来测试我们的动态主题效果。

真实业务逻辑中，该功能也许在后台管理系统中，配置完成后，保存到数据库，前端在初始化时，通过接口来获取主题再调用`setTheme(theme)`设置主题。

```vue
<!-- settings-modal -->
<template>
    <el-dialog
        v-model="dialogVisible"
        title="主题配置"
        width="640px"
        draggable
        :close-on-click-modal="false"
    >
        <el-form label-position="left" :label-width="80">
            <el-form-item label="主色：">
                <el-color-picker v-model="themeConfig.colors.primary" />
            </el-form-item>
            <el-form-item label="消息色：">
                <el-color-picker v-model="themeConfig.colors.info" />
            </el-form-item>
            <el-form-item label="成功色：">
                <el-color-picker v-model="themeConfig.colors.success" />
            </el-form-item>
            <el-form-item label="警告色：">
                <el-color-picker v-model="themeConfig.colors.warning" />
            </el-form-item>
            <el-form-item label="危险色：">
                <el-color-picker v-model="themeConfig.colors.danger" />
            </el-form-item>
            <el-button type="primary" @click="updateTheme">适用配置</el-button>
        </el-form>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Theme, getTheme, setTheme } from '../utils/theme';

const dialogVisible = ref(false);

const themeConfig = ref<Theme>(Object.assign({}, getTheme()));

const updateTheme = () => setTheme(themeConfig.value);

defineExpose({
    openModal() {
        dialogVisible.value = true;
    },
});
</script>

<style></style>
```

`App.vue`调用组件

```vue
<!--App.vue-->
<template>
    <div class="w-screen h-screen flex flex-col">
        <header
            class="flex-shrink-0 h-16 bg-white px-6 flex justify-between items-center"
        >
            <p class="text-black text-xl font-bold">动态主题色方案</p>
            <el-button type="primary" :icon="Operation" circle @click="settingsModalRef?.openModal()" />
            <settings-modal ref="settingsModalRef" />
        </header>
        <article class="flex-1 overflow-y-auto p-6">
            <element-box />
        </article>
        <footer class="flex-shrink-0 h-40 p-6 bg-black">
            <span
                class="bg-gradient-to-r from-primary-lighter to-primary-deeper bg-clip-text text-transparent text-3xl font-bold"
            >
                我只是个渐变色
            </span>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { Operation } from '@element-plus/icons-vue';
import { ref } from 'vue';
import ElementBox from './components/element-box.vue';
import SettingsModal from './components/settings-modal.vue';

const settingsModalRef = ref<typeof SettingsModal>();
</script>
```

![image-20230330143821084.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b79cbe5530e74de5b634f0846d325daf~tplv-k3u1fbpfcp-watermark.image?)

我们尝试修改一下主题色：

修改一套紫色主题色，保存，查看效果，可以看到已经修改为我们期待的颜色了。

![image-20230330144347135.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dced07b68a07400582492f2d06a8930a~tplv-k3u1fbpfcp-watermark.image?)
**这样，我们的主题切换系统就完成啦！**
