import Vue from 'vue'
// import Vuex from 'vuex'
import Vuex from './x_vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    counter: 0
  },
  mutations: {
    AddCounter (state) {
      state.counter++
    }
  },
  actions: {
    AddCounter ({ commit }) {
      setTimeout(() => {
        commit('AddCounter')
      }, 300)
    }
  },
  getters: {
    doubleCounter (state) {
      return state.counter * 2
    }
  },
  modules: {}
})
