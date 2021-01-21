function defineReative (obj, key, val) {
  // 如果val还是对象就需要递归遍历
  observe(val)

  Object.defineProperty(obj, key, {
    get () {
      console.log('get', key)
      return val
    },
    set (v) {
      if (v != val) {
        console.log('set', key)
        val = v
        // 更新视图
      }
    }
  })
}

// 对象响应式
function observe (obj) {
  // 需要判断obj是否为对象，不是对象就退出
  if (typeof obj !== 'object' || obj === null) {
    return
  }
  Object.keys(obj).forEach(key => {
    defineReative(obj, key, obj[key])
  })
}

// 如果存在动态添加或者删除的属性也要重新变成响应式
function set (obj, key, val) {
  defineReative(obj, key, val)
}

const obj = { name: 'carol' }
observe(obj)
obj.name
obj.name = 'xxx'
