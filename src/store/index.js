import Vue from 'vue'
import Vuex from 'vuex'

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
      }, 1000)
    }
  },
  modules: {}
})
