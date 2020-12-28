<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <h1>Welcome to Your Vue.js App</h1>
    <div @click="$store.commit('AddCounter')">
      counter: {{ $store.state.counter }}
    </div>
    <div @click="$store.dispatch('AddCounter')">
      async counter: {{ $store.state.counter }}
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home'
}
</script>
