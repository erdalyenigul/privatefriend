<template>
  <div class="containerAll">
    <appHeader />
    <nuxt />
  </div>
</template>

<script>
import header from '@/components/header';

export default {
  components: {
    appHeader : header,
  }
}
</script>
