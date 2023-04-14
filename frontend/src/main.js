import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from "./store";
import config from "../package.json";
import { createI18n } from 'vue-i18n';
import messages from './i18n';
import { Quasar } from 'quasar';
const i18n = createI18n({
    locale: 'ko',
    fallbackLocale: 'en',
    messages
});
const app = createApp(App);
import '../public/css/common.css';
const $c = {
  formatDate: function(date, type) {
    date = new Date(date);
    let month = date.getMonth() + 1;
    month = month > 10 ? month : `0${month}`;
    let day = date.getDate();
    day = day > 10 ? day : `0${day}`;
    if(type == 'date') {
      return `${date.getFullYear()}-${month}-${day}`; 
    } else if (type == 'date_ko') {
      return `${date.getFullYear()}년 ${month}월 ${day}일`; 
    } else if (type == 'date_2') {
      return `${month}.${day}`; 
    }
  }
}
app.config.globalProperties.$store = store;
app.config.globalProperties.$c = $c;
app.config.globalProperties.$config = config;
console.error(`ybr version: ${config.version}`);

app.use(router);
app.use(store);
app.use(i18n);
app.use(Quasar);
app.mount('#app');


