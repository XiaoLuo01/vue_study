/**
 * 实现一个vue-router的插件，处理选项、监控url变化，动态渲染等
 */
let Vue
// 需要在这里使用到Vue实例
class VueRouter {
  constructor (options) {
    // 1. 处理传进来的router选项
    this.$options = options

    // 3.需要响应式的，否则下面的render函数只会执行一次，
    // 可以借助vue暴露的defineReactive方法来设置响应式数据
    const initial = window.location.hash.slice(1) || '/'
    Vue.util.defineReactive(this, 'current', initial)

    // 2. 监听 hashchange 变化
    window.addEventListener('hashchange', this.onHashChange.bind(this))
  }

  onHashChange () {
    // 从 # 号后面开始截取url
    this.current = window.location.hash.slice(1)
  }
}

// 插件必须实现一个install方法, 会自动传入一个Vue实例
VueRouter.install = function (_Vue) {
  // 将传进来的Vue实例存储到全局
  Vue = _Vue

  // 因为use方法调用install是在new VueRouter之前，所以利用全局混入来延迟调用后续代码
  Vue.mixin({
    beforeCreate () {
      // 1. 挂载 $router 到vue原型上
      // 后续每一个组件都会调用这个方法, 此时的this指向当前组件实例
      if (this.$options.router) {
        Vue.prototype.$router = this.$options.router
      }
    }
  })

  // 2. 注册两个全局组件
  Vue.component('router-link', {
    props: {
      to: {
        type: String,
        required: true
      }
    },
    render (h) {
      // <router-link to="/about">abc</router-link> ==> <a href="/about">abc</a>
      return h('a', { attrs: { href: '#' + this.to } }, this.$slots.default)
    }
  })
  Vue.component('router-view', {
    render (h) {
      let component = null
      // 根据当前的url的hash值找到route里面对应的组件，然后渲染
      const route = this.$router.$options.routes.find(
        // this.$router 就是new VueRouter 这个实例
        route => route.path === this.$router.current
      )
      if (route) {
        component = route.component
      }
      return h(component)
    }
  })
}

export default VueRouter
