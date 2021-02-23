<template>
  <div>
    <x-form :model="model" :rules="rules" ref="loginForm">
      <x-form-item label="用户名" prop="username">
        <x-input v-model="model.username" placeholder="请输入用户名"></x-input>
      </x-form-item>
      <x-form-item label="密码" prop="password">
        <x-input
          type="password"
          v-model="model.password"
          placeholder="请输入密码"
        ></x-input>
      </x-form-item>
      <x-form-item>
        <button @click="onLogin">登录</button>
      </x-form-item>
    </x-form>
    <p>{{ model }}</p>
  </div>
</template>

<script>
import NoticeVue from '../notice/Notice.vue'
import XForm from './XForm.vue'
import XFormItem from './XFormItem.vue'
import XInput from './XInput.vue'
import { create } from "../../utils/create";

export default {
  components: { XInput, XFormItem, XForm },
  data() {
    return {
      model: {
        username: 'carol',
        password: ''
      },
      rules: {
        username: [{ required: true, message: '用户名为必填项' }],
        password: [{ required: true, message: '密码为必填项' }]
      }
    }
  },
  methods: {
    onLogin() {
      this.$refs.loginForm.validate(isValid => {
        const notice = create(NoticeVue, {
          title: "社会你杨哥喊你来搬砖",
          message: isValid ? "请求登录!" : "校验失败!",
          duration: 1000
        })
        notice.show();
      })
    }
  },
}
</script>

<style lang="scss" scoped>
</style>