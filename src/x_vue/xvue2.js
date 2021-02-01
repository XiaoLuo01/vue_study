/**
 * 手写vue第二个版本，引入vnode
 */

function defineReative (obj, key, val) {
  // 如果val还是对象就需要递归遍历
  observe(val)

  const dep = new Dep()

  Object.defineProperty(obj, key, {
    get () {
      console.log('get', key)
      // 判断一个Dep.target是否存在，存在就收集依赖
      Dep.target && dep.addDep(Dep.target)
      return val
    },
    set (v) {
      if (v != val) {
        console.log('set', key, v)
        val = v
        // 小管家通知更新视图 update
        dep.notify()
      }
    }
  })
}

// 如果存在动态添加或者删除的属性也要重新变成响应式
function set (obj, key, val) {
  defineReative(obj, key, val)
}

// 对象响应式，对象里面的每一个值都需要处理成响应式
function observe (obj) {
  // 需要判断obj是否为对象，不是对象就退出
  if (typeof obj !== 'object' || obj === null) {
    return
  }

  // 需要一个政委，来管理传进来的是什么类型的数据，对应做相应的处理
  new Observer(obj)
}

class Observer {
  constructor (obj) {
    this.value = obj

    if (Array.isArray(obj)) {
      // TODO 数组响应式
      this.arr(obj)
    } else {
      // 对象的响应式
      this.walk(obj)
    }
  }

  arr (obj) {
    // 拷贝一份数组的原型，然后替换数组的7个原型方法
    const originalProto = Array.prototype
    const arrayProto = Object.create(originalProto)
    // 首先执行原始的数组操作，然后修改更新方法，使其可以通知更新
    const methods = [
      'push',
      'pop',
      'shift',
      'unshift',
      'slice',
      'splice',
      'concat'
    ]
    methods.forEach(method => {
      arrayProto[method] = function () {
        // 原始操作
        originalProto[method] && originalProto[method].apply(this, arguments)
        // 覆盖操作，通知更新
        console.log('set', method)
      }
    })
    // 将得到的新的原型方法设置到数组实例原型上
    obj.__proto__ = arrayProto
  }

  walk (obj) {
    Object.keys(obj).forEach(key => {
      defineReative(obj, key, obj[key])
    })
  }
}

// 将 $data 上的 key 全部代理到 vm 上，用户可以直接使用
function proxy (vm) {
  Object.keys(vm.$data).forEach(key => {
    Object.defineProperty(vm, key, {
      get () {
        return vm.$data[key]
      },
      set (v) {
        vm.$data[key] = v
      }
    })
  })
}

class XVue {
  constructor (options) {
    // 1. 响应式
    this.$options = options
    this.$data = options.data
    // 把data做响应式处理
    observe(this.$data)

    // 把this.$data上的选项都代理绑定到this上，就可以直接通过实例来访问到
    proxy(this)

    // 如果存在el，直接挂载
    if (options.el) {
      this.$mount(options.el)
    }
  }

  // 挂载
  $mount (el) {
    // 获取宿主
    this.$el = document.querySelector(el)
    // updateComponent
    const updateComponent = () => {
      // 执行 render
      const { render } = this.$options
      /* 用真实的dom */
      // const el = render.call(this)
      // // 获取宿主元素的父节点
      // const parent = this.$el.parentElement
      // // 把渲染出来的真实dom插入到宿主元素的下一个兄弟节点
      // parent.insertBefore(el, this.$el.nextSibling)
      // // 然后删除宿主元素
      // parent.removeChild(this.$el)
      // this.$el = el

      // 调用render函数获取vnode
      const vnode = render.call(this, this.$createElement)
      this._update(vnode)
    }
    // 创建 watcher 实例
    new Watcher(this, updateComponent)
  }

  // h函数
  $createElement (tag, props, children) {
    return { tag, props, children }
  }

  // init和更新方法
  _update (vnode) {
    // 获取上一次的vnode
    const prevVnode = this._vnode

    if (!prevVnode) {
      // init 初始化
      this.__patch__(this.$el, vnode)
    } else {
      // update 更新
      this.__patch__(prevVnode, vnode)
    }
  }

  // diff,真正把vnode转化为真实dom
  __patch__ (oldVnode, vnode) {
    if (oldVnode.nodeType) {
      // 初始化 init，传入的是真实dom
      const parent = oldVnode.parentElement
      const refElm = oldVnode.nextSibling
      // 创建一颗dom树，递归遍历子节点
      const el = this.createElm(vnode)
      parent.insertBefore(el, refElm)
      parent.removeChild(oldVnode)
    } else {
      // 更新操作 update
      const el = (vnode.$elm = oldVnode.$elm)
      // props
      const oldProps = oldVnode.props || []
      const newProps = vnode.props || []
      for (const key in newProps) {
        el.setAttribute(key, newProps[key])
      }
      // 老的属性新的没有就删除
      for (const key in oldProps) {
        if (!(key in newProps)) {
          el.removeAttribute(key)
        }
      }

      // children
      const oldCh = oldVnode.children
      const newCh = vnode.children
      if (typeof newCh === 'string') {
        if (typeof oldCh === 'string') {
          // text
          if (newCh !== oldCh) {
            el.textContent = newCh
          }
        } else {
          // 老的没有文本
          el.textContent = newCh
        }
      } else {
        // children array
        if (typeof oldCh === 'string') {
          // 老的是文本，新的是元素, 则清空创建新节点
          el.innerHTML = ''
          newCh.forEach(child => {
            el.appendChild(this.createElm(child))
          })
        } else {
          // 重排
          this.updateChildren(el, oldCh, newCh)
        }
      }
    }

    // 保存新的vnode
    this._vnode = vnode
  }

  // dom操作
  createElm (vnode) {
    const el = document.createElement(vnode.tag)

    // props
    if (vnode.props) {
      for (const key in vnode.props) {
        const value = vnode.props[key]
        el.setAttribute(key, value)
      }
    }

    // children
    if (vnode.children) {
      if (typeof vnode.children === 'string') {
        // 文本
        el.textContent = vnode.children
      } else {
        // children array
        vnode.children.forEach(v => {
          const child = this.createElm(v)
          el.appendChild(child)
        })
      }
    }

    // 保存真实的dom
    vnode.$elm = el
    return el
  }

  updateChildren (el, oldCh, newCh) {
    const len = Math.min(oldCh.length, newCh.length)
    // 直接patch所有的
    for (let i = 0; i < len; i++) {
      this.__patch__(oldCh[i], newCh[i])
    }

    // 新的还有剩说明有新增
    if (newCh.length > oldCh.length) {
      newCh.slice(len).forEach(child => {
        el.appendChild(this.createElm(child))
      })
    }

    // 老的还有说明有删除
    else if (newCh.length < oldCh.length) {
      oldCh.slice(len).forEach(child => {
        el.removeChild(child.el)
      })
    }
  }
}

// 监听器：负责页面中一个依赖的更新
class Watcher {
  constructor (vm, updateFn) {
    this.vm = vm
    this.getter = updateFn

    this.get()
  }

  get () {
    // 获取一下key的值触发它的get方法，添加一个静态属性，在那创建watcher实例和dep之间的映射关系
    Dep.target = this
    this.getter.call(this.vm)
    Dep.target = null
  }

  update () {
    // 调用依赖自己的更新函数，传入上下文this和最新的值
    this.get()
  }
}

// 小管家：收集依赖
class Dep {
  constructor () {
    // 避免多次放入
    this.deps = new Set()
  }

  // 收集当前对应的所有watcher
  addDep (dep) {
    this.deps.add(dep)
  }

  // 通知更新
  notify () {
    this.deps.forEach(dep => dep.update())
  }
}
