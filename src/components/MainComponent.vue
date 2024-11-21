<template>
  <v-card>
    <v-toolbar
      color="black"
      elevation="4"
    >
      <v-btn icon>
        <v-icon>mdi-github</v-icon>
      </v-btn>

      <v-toolbar-title>
        RAKBANK GitHub Copilot Metrics
        <small
          class="text-grey"
          v-if="!apiError && metricsReady"
          >{{ startDate }} to {{ endDate }}</small
        >
      </v-toolbar-title>
      <v-select
        class="my-auto"
        clearable
        chips
        label="Choose A Team (Leave Blank for All)"
        item-title="name"
        item-value="slug"
        :items="teams"
        v-model="selectedTeam"
        v-on:update:model-value="changeTeam"
        v-if="!apiError && metricsReady"
        ><template v-slot:item="{ props, item }">
          <v-list-item
            v-bind="props"
            :subtitle="(item.raw.copilotSeats || 0) + ' licenses'"
          ></v-list-item> </template
      ></v-select>
    </v-toolbar>

    <!-- API Error Message -->
    <div
      class="error-message"
      v-if="apiError"
    >
      <div v-html="apiError"></div>
      <div class="mt-2">
        If your token has expired, please click below to update your token.<br />
        <v-btn
          class="mt-1"
          @click="noToken = true"
        >
          Update GitHub Token
        </v-btn>
      </div>
    </div>

    <div v-if="!apiError">
      <div
        v-if="itemName === 'invalid'"
        class="error-message"
      >
        Invalid Scope in .env file. Please check the value of VUE_APP_SCOPE.
      </div>
      <div v-else>
        <v-progress-linear
          v-if="!metricsReady"
          indeterminate
          color="indigo"
        ></v-progress-linear>
        <v-window
          v-if="metricsReady"
          v-model="tab"
        >
          <v-window-item
            v-for="item in tabItems"
            :key="item"
            :value="item"
          >
            <v-card flat>
              <MetricsViewer
                v-if="item === itemName"
                :metrics="metrics"
                :teamMetrics="teamMetrics"
                :totalSeats="totalSeats"
                :activeSeats="activeSeats"
                :inactiveSeats="inactiveSeats"
                :selectedTeam="selectedTeam || ''"
                :teams="teams"
                :start="startDate"
                :end="endDate"
              />
              <LanguagesBreakdown
                v-if="item === 'languages'"
                :metrics="metrics"
              />
              <CopilotChatViewer
                v-if="item === 'copilot chat'"
                :metrics="metrics"
              />
              <ApiResponse
                v-if="item === 'api response'"
                :metrics="metrics"
              />
            </v-card>
          </v-window-item>
        </v-window>
      </div>
    </div>
  </v-card>

  <v-dialog
    max-width="500"
    v-model="noToken"
    persistent
  >
    <template v-slot:default="{}">
      <v-card title="We need your GitHub Token">
        <v-card-text>
          <v-row dense>
            <v-col
              cols="12"
              md="12"
              sm="12"
            >
              <p
                class="text-blue"
                style="margin-top: -16px; margin-bottom: 16px"
              >
                Don't worry. This is one time setup.
              </p>
            </v-col>
            <v-col
              cols="12"
              md="12"
              sm="12"
            >
              <v-text-field
                label="GitHub Token"
                required
                v-model="tokenValue"
              ></v-text-field>
            </v-col>
          </v-row>

          <small class="text-caption text-medium-emphasis"
            >Please contact IT DevOps if you don't have any GitHub Token or
            don't know how to generate one.</small
          >
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            text="Close"
            variant="plain"
            @click="noToken = false"
          ></v-btn>

          <v-btn
            color="primary"
            text="Save"
            variant="tonal"
            @click="saveToken"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import {
  getMetricsApi,
  getSeatsByTeam,
  getSeatsInformation,
  getTeams,
  getTeamsMetrics,
} from '../api/GitHubApi';
import { Metrics } from '../model/Metrics';

//Components
import MetricsViewer from './MetricsViewer.vue';
import LanguagesBreakdown from './LanguagesBreakdown.vue';
import CopilotChatViewer from './CopilotChatViewer.vue';
import ApiResponse from './ApiResponse.vue';
import { Team } from '@/model/Team';
import { formatDistanceToNowStrict } from 'date-fns';

export default defineComponent({
  name: 'MainComponent',
  components: {
    MetricsViewer,
    LanguagesBreakdown,
    CopilotChatViewer,
    ApiResponse,
  },
  methods: {
    saveToken() {
      localStorage.setItem('token', this.tokenValue);
      this.noToken = false;
      location.reload();
    },

    changeTeam(team: string | null) {
      console.log(team, this.selectedTeam);
    },
  },
  computed: {
    gitHubOrgName() {
      return process.env.VUE_APP_GITHUB_ORG;
    },
    itemName() {
      if (
        process.env.VUE_APP_SCOPE === 'enterprise' ||
        process.env.VUE_APP_SCOPE === 'organization'
      ) {
        return process.env.VUE_APP_SCOPE;
      } else {
        console.log('invalid');
        return 'invalid';
      }
    },
    capitalizedItemName() {
      return this.itemName.charAt(0).toUpperCase() + this.itemName.slice(1);
    },
  },
  data() {
    return {
      tabItems: ['languages', 'copilot chat', 'api response'],
      tab: null,
      selectedTeam: null,
      noToken: true,
      tokenValue: '',
    };
  },
  created() {
    if (this.itemName !== 'invalid') {
      this.tabItems.unshift(this.itemName);
    }
    this.tokenValue = localStorage.getItem('token') || '';
    this.noToken = this.tokenValue === '';
  },

  setup() {
    const metricsReady = ref(false);
    const metrics = ref<Metrics[]>([]);
    const teamMetrics = ref<Metrics[]>([]);
    const teams = ref<Team[]>([]);
    let startDate = ref<string>('');
    let endDate = ref<string>('');
    let duration = ref<string>('');
    let totalSeats = ref(0);
    let activeSeats = ref(0);
    let inactiveSeats = ref(0);

    // API Error Message
    const apiError = ref<string | undefined>(undefined);

    const token = localStorage.getItem('token') || '';

    getMetricsApi(token)
      .then((data) => {
        metrics.value = data;
        console.log('Metrics are: ', data);
        // Set metricsReady to true after the call completes.
        const formatDate = (dateStr: string) => {
          const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          };
          return new Date(dateStr).toLocaleDateString('en-ae', options);
        };

        startDate.value = formatDate(data[0].day);
        endDate.value = formatDate(data[data.length - 1].day);
        duration.value = formatDistanceToNowStrict(new Date(data[0].day));
      })
      .then(() => {
        return getSeatsInformation(token);
      })
      .then((data) => {
        totalSeats.value = data.seat_breakdown.total;
        activeSeats.value = data.seat_breakdown.active_this_cycle;
        inactiveSeats.value = data.seat_breakdown.inactive_this_cycle;
      })
      .then(() => {
        return getTeamsMetrics();
      })
      .then((teamMetricsData) => {
        teamMetrics.value = teamMetricsData;
      })
      .then(() => {
        return getTeams(token);
      })
      .then((teamsData) => {
        console.log('Teams are: ', teamsData);
        return getSeatsByTeam(token, teamsData);
      })
      .then((seatByTeamData) => {
        teams.value = seatByTeamData;
      })
      .catch((error) => {
        console.log('Error', error);
        apiError.value = handleError(error);
      })
      .finally(() => {
        metricsReady.value = true;
      });

    const handleError = (error: any): string => {
      console.log(error);
      let apiError = '';
      // Check the status code of the error response
      if (error.response && error.response.status) {
        switch (error.response.status) {
          case 401:
            apiError =
              '401 Unauthorized access - check if your token in the .env file is correct.';
            break;
          case 404:
            apiError = `404 Not Found - is the organization '${process.env.VUE_APP_GITHUB_ORG}' correct?`;
            break;
          default:
            apiError = error.response.data.message;
            break;
        }
      } else {
        // Update apiError with the error message
        apiError = error.message;
      }
      return apiError;
    };

    return {
      metricsReady,
      metrics,
      apiError,
      startDate,
      endDate,
      duration,
      totalSeats,
      activeSeats,
      inactiveSeats,
      teams,
      teamMetrics,
    };
  },
});
</script>

<style scoped>
.error-message {
  color: red;
  background-color: pink;
  padding: 8px;
}
</style>
