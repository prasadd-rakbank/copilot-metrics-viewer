<template>
  <v-card
    elevation="4"
    color="#e2e2e2"
    variant="elevated"
    class="mx-3 my-3"
    :style="{ width: '270px', height: '180px' }"
  >
    <v-card-item>
      <div class="my-2">
        <div
          class="text-gray"
          v-if="selectedTeam === null || selectedTeam === ''"
        >
          {{ activeSeats }} active out of {{ totalSeats }} licenses
        </div>
        <div
          class="text-gray"
          v-if="!(selectedTeam === null || selectedTeam === '')"
        >
          {{ totalActiveUsers }} active out of {{ teamSeats }} licenses
        </div>
        <v-progress-linear
          :location="null"
          bg-color="#333333"
          buffer-color="#e30613"
          buffer-opacity="1"
          :buffer-value="activeSeats"
          color="#a8050e"
          height="16"
          :max="totalSeats"
          min="0"
          :model-value="totalActiveUsers"
          rounded
          v-if="selectedTeam === null || selectedTeam === ''"
        >
        </v-progress-linear>
        <v-progress-linear
          :location="null"
          bg-color="#333333"
          color="#a8050e"
          height="16"
          :max="teamSeats"
          min="0"
          :model-value="totalActiveUsers"
          rounded
          v-if="!(selectedTeam === null || selectedTeam === '')"
        >
        </v-progress-linear>
        <div
          class="text-h3 font-weight-bold text-cyan-darken-4 mt-2 text-dark-red"
        >
          {{ totalActiveUsers }}
        </div>
        <div
          class="text-normal-1 mt-1 text-cyan-darken-2 font-weight-medium text-gray"
        >
          Max active engineers per day
        </div>
        <div class="text-caption text-grey-darken-3">in {{ currentMonth }}</div>
      </div>
    </v-card-item>
  </v-card>
</template>

<script>
export default {
  name: 'ProgressCard',
  props: {
    activeSeats: {
      type: Number,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    totalActiveUsers: {
      type: Number,
      required: true,
    },
    selectedTeam: {
      type: String,
      required: true,
    },
    teams: {
      type: Array,
      required: true,
    },
    currentMonth: {
      type: String,
      required: true,
    },
  },
  computed: {
    teamSeats() {
      const team = this.teams.find((t) => t.slug === this.selectedTeam);
      return team ? team.copilotSeats : 0;
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
</style>
