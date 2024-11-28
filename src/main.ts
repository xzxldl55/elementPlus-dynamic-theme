import './assets/style.scss';
import 'element-plus/theme-chalk/src/dark/css-vars.scss';
import { createApp } from 'vue';
import App from './App.vue';
import { setTheme } from './utils/theme';

setTheme();

createApp(App).mount('#app');
