<template>
  <v-card
    elevation="4"
    color="#e2e2e2"
    variant="elevated"
    class="mx-3 my-3"
    :style="{ width: width, height: height }"
  >
    <v-card-item>
      <div class="my-5">
        <div class="text-h3 font-weight-bold text-dark-red">
          <small
            class="text-button text-light-red"
            style="margin-right: -0.5rem"
            v-if="currency"
            >AED</small
          >
          {{ value }}
        </div>
        <div class="text-normal-1 mt-1 font-weight-medium text-gray">
          {{ label }}
        </div>
        <div class="text-caption text-grey-darken-3">in {{ month }}</div>
      </div>
    </v-card-item>
  </v-card>
</template>

<script>
export default {
  name: 'StatusCard',
  props: {
    value: {
      type: [String, Number],
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    width: {
      type: String,
      default: '220px',
    },
    height: {
      type: String,
      default: '180px',
    },
    currency: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.text-gray {
  color: #333333 !important;
}
.text-dark-red {
  color: #a8050e !important;
}
.text-light-red {
  color: #e30613 !important;
}
.bg-gray {
  background-color: #333333 !important;
}
.tiny-text {
  font-size: 0.65rem !important;
}
</style>
