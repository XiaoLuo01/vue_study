/**
 * 动态创建组件实例
 * 挂载到 body 上
 */
import Vue from 'vue'
export function create (Component, props) {
  // 1. 创建实例
  // 第一种方法：使用extend =》 Ctor =》 new Ctor
  const Ctor = Vue.extend(Component)
  const camp = new Ctor({ propsData: props }).$mount()
  document.body.appendChild(camp.$el)
  camp.remove = () => {
    document.body.removeChild(camp.$el)
    camp.$destroy()
  }

  // 第二种方法：借鸡生蛋 new Vue
  // const vm = new Vue({
  //   render (h) {
  //     return h(Component, { props })
  //   }
  // }).$mount() // 这里只挂载，不添加到宿主元素上，因为会删除页面原来的内容

  // 2. 手动追加到body上
  // document.body.appendChild(vm.$el)

  // 3. 获取生成的组件实例
  // const camp = vm.$children[0]

  // 4. 使用完了之后要移除
  // camp.remove = () => {
  //   document.body.removeChild(vm.$el)
  //   vm.$destroy()
  // }

  return camp
}
