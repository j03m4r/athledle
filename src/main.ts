import './assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { library } from "@fortawesome/fontawesome-svg-core";
import { faMagnifyingGlass, faArrowUp, faX, faShare, faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import ToastPlugin from 'vue-toast-notification';
// Import one of the available themes
//import 'vue-toast-notification/dist/theme-default.css';
import 'vue-toast-notification/dist/theme-bootstrap.css';

library.add(faMagnifyingGlass);
library.add(faArrowUp)
library.add(faX)
library.add(faShare)
library.add(faArrowRightFromBracket)

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ToastPlugin)
app.component("font-awesome-icon", FontAwesomeIcon)

app.mount('#app')
