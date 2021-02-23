import Vue from 'vue'
import App from './App.vue'

import router from './router/index'
// import router from './x_router'

import store from './store'
// import store from './x_store'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
