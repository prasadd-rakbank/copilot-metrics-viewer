<template>
  <v-app>
    <v-main>
      <MainComponent />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MainComponent from './components/MainComponent.vue';

export default defineComponent({
  name: 'App',

  components: {
    MainComponent,
  },

  data() {
    return {
      //
    };
  },
});
</script>
<style>
body {
  font-family: 'Helvetica Neue', Arial, sans-serif !important;
}
.text-h4,
.text-h3,
.text-caption {
  font-family: 'Helvetica Neue', Arial, sans-serif !important;
}
</style>
