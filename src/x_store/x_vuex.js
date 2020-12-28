/**
 * 实现一个vuex的插件
 */

// 声明一个全局变量是避免打包的时候把vue打包进去，而这里只是对vue的引用，表示这是一个纯粹的插件
let Vue

// 声明一个store类
class Store {
  constructor (options) {
    // 1. 处理选项
    // this.$options = options
    this._mutations = options.mutations
    this._actions = options.actions
    // 2. 响应式处理state，可以直接利用vue里面的data来设置响应式数据
    this._vm = new Vue({
      data: {
        $$state: options.state
      }
    })

    // 由于在使用的时候有可能this会丢失，所以需要把this绑死
    this.commit = this.commit.bind(this)
    this.dispatch = this.dispatch.bind(this)
  }

  get state () {
    // 这样来获取是为了避免用户在外面直接可以修改到state的值
    return this._vm._data.$$state
  }

  set state (val) {
    console.error('please use replaceState to reset state')
  }

  // 实现commit修改state的值
  commit (type, payload) {
    const entry = this._mutations[type]

    if (!entry) {
      console.error('unkown mutation type')
      return
    }

    entry(this.state, payload)
  }

  // 实现dispatch
  dispatch (type, payload) {
    const entry = this._actions[type]

    if (!entry) {
      console.error('unkown mutation type')
      return
    }

    entry(this, payload)
  }
}

function install (_Vue) {
  Vue = _Vue
  Vue.mixin({
    beforeCreate () {
      // 在new vue的时候挂载store到vue的原型上
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store
      }
    }
  })
}

// {store} 这里就是vuex，外面才可以使用new Vuex.Store，同时还要暴露install方法
export default { Store, install }
