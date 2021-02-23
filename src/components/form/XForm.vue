<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  provide() {
    return {
      form: this
    }
  },
  props: {
    model: {
      type: Object,
      required: true
    },
    rules: {
      type: Object
    }
  },
  methods: {
    validate(cb) {
      // 获取所有的item并执行他们的validate
      const tasks = this.$children
        .filter(item => item.prop)  // 有prop属性才提交校验
        .map(item => item.validate())
      // 判断结果
      Promise.all(tasks).then(() => cb(true)).catch(() => cb(false))
    }
  },
}
</script>

<style lang="scss" scoped>
</style>