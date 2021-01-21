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
      // 对象的

      响应式
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
    observe(this.$data)

    // 把this.$data上的选项都代理绑定到this上，就可以直接通过实例来访问到
    proxy(this)

    // 2.编译，传入根节点和vue实例
    new Compile(options.el, this)
  }
}

class Compile {
  constructor (el, vm) {
    this.$vm = vm

    // 获取 el 节点然后编译
    this.$el = document.querySelector(el)
    this.complie(this.$el)
  }

  complie (el) {
    // 遍历 el 所有的子节点
    el.childNodes.forEach(node => {
      if (node.nodeType === 1) {
        // 1. 元素
        this.complieElement(node)
        // 判断如果还有子节点或者文本节点，则需要递归调用
        if (node.childNodes.length > 0) {
          this.complie(node)
        }
      } else if (this.isInter(node)) {
        // 2. 插值表达式 {{xxx}}
        this.complieText(node)
      }
    })
  }

  // 判断是否是插值表达式
  isInter (node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }

  // 判断是不是以 x- 开头的指令
  isDir (attrName) {
    return attrName.startsWith('x-')
  }

  // 判断是不是@开头的事件
  isEvent (attrName) {
    return attrName.startsWith('@')
  }

  // 给传入的node做初始化赋值以及创建watcher并负责其更新
  update (node, exp, dir) {
    const fn = this[dir + 'Updater']
    // 1. 初始化赋值
    fn && fn(node, this.$vm[exp])

    // 2. 创建watcher实例并执行更新操作
    new Watcher(this.$vm, exp, function (val) {
      fn && fn(node, val)
    })
  }

  // 编译插值表达式
  complieText (node) {
    this.update(node, RegExp.$1, 'text')
    // 从 vue 实例里面拿到插值表达式作为 key 的值设置给 Dom 就完成了初始化
    // node.textContent = this.$vm[RegExp.$1]
  }

  // 编译元素
  complieElement (node) {
    // 获取元素上所有的属性
    const nodeAttrs = node.attributes
    // 将所有的元素属性转化成数组之后遍历每一个属性然后判断
    Array.from(nodeAttrs).forEach(attr => {
      const attrName = attr.name // x-text
      const exp = attr.value // counter
      // 判断是否是指令
      if (this.isDir(attrName)) {
        // 获取指令执行函数并调用
        const dirName = attrName.slice(2)
        this[dirName] && this[dirName](node, exp)
      }
      // 判断是否是事件
      if (this.isEvent(attrName)) {
        const dirName = attrName.slice(1)
        this.eventHandler(node, exp, dirName)
      }
    })
  }

  // x-text
  text (node, exp) {
    // 将文本直接设置给元素的内容
    this.update(node, exp, 'text')
  }
  textUpdater (node, val) {
    node.textContent = val
  }

  // x-html
  html (node, exp) {
    // 也就是设置元素的html内容
    this.update(node, exp, 'html')
  }
  htmlUpdater (node, val) {
    node.innerHTML = val
  }

  // x-model
  model (node, exp) {
    // update方法只完成赋值和更新
    this.update(node, exp, 'model')

    // 还需要绑定表单的事件
    node.addEventListener('input', e => {
      // 把新的赋值给数据
      this.$vm[exp] = e.target.value
    })
  }
  modelUpdater (node, val) {
    // 把值设置给input的value
    node.value = val
  }

  // @click
  eventHandler (node, exp, dir) {
    // 获取到事件处理程序的函数
    const fn = this.$vm.$options.methods && this.$vm.$options.methods[exp]
    // 绑定事件
    node.addEventListener(dir, fn.bind(this.$vm))
  }
}

// 监听器：负责页面中一个依赖的更新
class Watcher {
  constructor (vm, key, updateFn) {
    this.vm = vm
    this.key = key
    this.updateFn = updateFn

    // 获取一下key的值触发它的get方法，添加一个静态属性，在那创建watcher实例和dep之间的映射关系
    Dep.target = this
    this.vm[this.key]
    Dep.target = null
  }

  update () {
    // 调用依赖自己的更新函数，传入上下文this和最新的值
    this.updateFn.call(this.vm, this.vm[this.key])
  }
}

// 小管家：收集依赖
class Dep {
  constructor () {
    this.deps = []
  }

  // 收集当前对应的所有watcher
  addDep (dep) {
    this.deps.push(dep)
  }

  // 通知更新
  notify () {
    this.deps.forEach(dep => dep.update())
  }
}
