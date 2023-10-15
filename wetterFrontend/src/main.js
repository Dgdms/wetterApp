import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import * as Vue from 'vue' 
import axios from 'axios'
import VueAxios from 'vue-axios'
import axiosInstance  from '../http/config'



import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


const vuetify = createVuetify({
    components,
    directives,
  })
const app = createApp(App)
app.use(VueAxios, axios)
app.use(router)
app.config.globalProperties.$http = axiosInstance;


app.use(vuetify).mount('#app')