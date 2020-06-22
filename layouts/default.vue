<template>
  <div class="containerAll">
    <appHeader />
    <nuxt />
    <appFooter />
  </div>
</template>

<script>
import header from '@/components/header';
import footer from '@/components/footer';

export default {
  components: {
    appHeader : header,
    appFooter : footer,
  }
}
</script>
