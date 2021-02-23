<template>
  <div>
    <!-- 1. 实现label -->
    <label v-if="label">{{ label }}</label>
    <!-- 2. 实现插槽 -->
    <slot></slot>
    <!-- 3. 错误信息 -->
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import Schema from 'async-validator'

export default {
  inject: ['form'],
  data() {
    return {
      error: ''
    }
  },
  props: {
    label: {
      type: String,
      default: ''
    },
    prop: {
      type: String
    }
  },

  mounted() {
    this.$on('validate', () => {
      this.validate()
    });
  },
  methods: {
    validate() {
      const value = this.form.model[this.prop]
      const rules = this.form.rules[this.prop]

      // validator
      const validator = new Schema({ [this.prop]: rules })
      return validator.validate({ [this.prop]: value }, errors => {
        if (errors) {
          this.error = errors[0].message
        } else {
          this.error = ''
        }
      })
    }
  },
}
</script>

<style scoped>
.error {
  color: red;
  font-size: 12px;
  margin: 0;
}
</style>