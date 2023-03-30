import { createApp } from 'vue'
import './assets/style.scss'
import App from './App.vue'
import { setTheme } from './utils/theme';

setTheme();

createApp(App).mount('#app')
