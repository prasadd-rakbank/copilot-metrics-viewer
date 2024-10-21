<template>
  <div>
    <div class="text-h4 font-weight-bold mt-3 mx-3">Usage Analysis</div>
    <div class="tiles-container mb-2">
      <!-- Acceptance Rate Tile -->
      <v-card
        elevation="4"
        color="cyan-lighten-3"
        variant="elevated"
        class="mx-3 my-3"
        style="width: 250px; height: 180px"
      >
        <v-card-item>
          <div class="my-2">
            <div class="text-black font-weight-bold">
              {{ activeSeats }} active out of {{ totalSeats }} licenses
            </div>
            <v-progress-linear
              :location="null"
              bg-color="grey-darken-3"
              buffer-color="cyan-darken-1"
              buffer-opacity="1"
              :buffer-value="activeSeats"
              color="cyan-darken-4"
              height="16"
              :max="totalSeats"
              min="0"
              :model-value="totalActiveUsers"
              rounded
            >
            </v-progress-linear>
            <div class="text-h3 font-weight-bold text-cyan-darken-4 mt-2">
              {{ totalActiveUsers }}
            </div>
            <div class="text-normal-1 mt-1 text-cyan-darken-2 font-weight-bold">
              Max active engineers per day
            </div>
            <div class="text-caption text-grey-darken-3">in last 4 weeks</div>
          </div>
        </v-card-item>
      </v-card>

      <v-card
        elevation="4"
        :color="(inactiveSeats > 0 ? 'red' : 'green') + '-lighten-3'"
        variant="elevated"
        class="mx-3 my-3"
        style="width: 250px; height: 180px"
      >
        <v-card-item>
          <div class="my-5">
            <div
              :class="
                'text-h3 font-weight-bold text-' +
                (inactiveSeats > 0 ? 'red' : 'green') +
                '-darken-4'
              "
            >
              {{ inactiveSeats }}
            </div>
            <div
              :class="
                'text-normal-1 mt-1 text-' +
                (inactiveSeats > 0 ? 'red' : 'green') +
                '-darken-2 font-weight-bold'
              "
            >
              Inactive licenses
            </div>
            <div class="text-caption text-grey-darken-3">in last 4 weeks</div>
          </div>
        </v-card-item>
      </v-card>

      <v-card
        elevation="4"
        color="cyan-lighten-3"
        variant="elevated"
        class="mx-3 my-3"
        style="width: 250px; height: 180px"
      >
        <v-card-item>
          <div class="my-5">
            <div class="text-h3 font-weight-bold text-cyan-darken-4">
              {{ cumulativeNumberLOCAccepted }}
            </div>
            <div class="text-normal-1 mt-1 text-cyan-darken-2 font-weight-bold">
              Lines of code generated
            </div>
            <div class="text-caption text-grey-darken-3">in last 4 weeks</div>
          </div>
        </v-card-item>
      </v-card>
    </div>
    <v-divider class="mx-3 border-opacity-50"></v-divider>
    <div class="text-h4 font-weight-bold mt-3 mx-3">
      Cost vs Benefit Analysis
    </div>
    <div class="tiles-container mb-2">
      <!-- <div class="text-h3 my-auto font-weight-bold">::</div> -->
      <v-hover v-slot="{ isHovering, props }">
        <v-card
          elevation="4"
          color="brown-lighten-3"
          variant="elevated"
          class="mx-3 my-3"
          style="width: 220px; height: 175px"
          v-bind="props"
        >
          <v-card-item>
            <div class="my-5">
              <div class="text-h3 font-weight-bold text-brown-darken-4">
                <small
                  class="text-button font-weight-bold text-brown-darken-2"
                  style="margin-right: -0.5rem"
                  >AED</small
                >
                {{
                  costAvoidance.toLocaleString('en-US', {
                    style: 'decimal',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                }}
              </div>
              <div
                class="text-normal-1 mt-1 text-brown-darken-2 font-weight-bold"
              >
                Cost Avoided *
                <v-expand-transition>
                  <div
                    v-if="isHovering"
                    class="d-flex transition-fast-in-fast-out bg-brown-darken-3 text-caption px-3 py-3 rounded"
                    style="
                      height: 100%;
                      margin-top: -5.8rem;
                      margin-bottom: 1.25rem;
                    "
                  >
                    Assumption: an engineer would have taken
                    {{ timePerLineInMinutes }} minutes to write and unit test
                    the same line of code manually. Engineer daily rate is
                    assumed to be AED {{ developerRatePerDay }}
                  </div>
                </v-expand-transition>
              </div>
              <div
                class="text-caption text-grey-darken-3"
                v-if="!isHovering"
              >
                in last 4 weeks
              </div>
            </div>
          </v-card-item>
        </v-card>
      </v-hover>

      <div class="text-h6 my-auto">Vs</div>
      <v-card
        elevation="4"
        color="brown-lighten-3"
        variant="elevated"
        class="mx-3 my-3"
        style="width: 220px; height: 175px"
      >
        <v-card-item>
          <div class="my-5">
            <div class="text-h3 font-weight-bold text-brown-darken-4">
              <small
                class="text-button font-weight-bold text-brown-darken-2"
                style="margin-right: -0.5rem"
                >AED</small
              >
              {{
                (copilotLicenseCost * totalSeats).toLocaleString('en-US', {
                  style: 'decimal',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              }}
            </div>
            <div
              class="text-normal-1 mt-1 text-brown-darken-2 font-weight-bold"
            >
              License Cost
            </div>
            <div class="text-caption text-grey-darken-3">in last 4 weeks</div>
          </div>
        </v-card-item>
      </v-card>

      <div class="text-h3 my-auto font-weight-bold">=</div>
      <v-card
        elevation="4"
        color="green-lighten-3"
        variant="elevated"
        class="mx-3 my-3"
        style="width: 220px; height: 175px"
      >
        <v-card-item>
          <div class="my-5">
            <div class="text-h3 font-weight-bold text-green-darken-4">
              {{
                (
                  ((costAvoidance - copilotLicenseCost * totalSeats) /
                    (copilotLicenseCost * totalSeats)) *
                  100
                ).toFixed(0)
              }}%
            </div>
            <div
              class="text-normal-1 mt-1 text-green-darken-2 font-weight-bold"
            >
              Return on Investment
            </div>
            <div class="text-caption text-grey-darken-3">in last 4 weeks</div>
          </div>
        </v-card-item>
      </v-card>
      <v-card
        elevation="4"
        color="red-lighten-3"
        variant="elevated"
        class="mx-3 my-3"
        style="width: 260px; height: 175px"
      >
        <v-card-item>
          <div class="my-5">
            <div class="text-h3 font-weight-bold text-red-darken-4">
              <small
                class="text-button font-weight-bold text-red-darken-2"
                style="margin-right: -0.5rem"
                >AED</small
              >
              {{
                (inactiveSeats * copilotLicenseCost).toLocaleString('en-US', {
                  style: 'decimal',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              }}
            </div>
            <div class="text-normal-1 mt-1 text-red-darken-2 font-weight-bold">
              Potential license cost reduction
            </div>
            <div class="text-caption text-grey-darken-3">
              by removing inactive licenses
            </div>
          </div>
        </v-card-item>
      </v-card>
    </div>

    <v-divider class="mx-3 border-opacity-50"></v-divider>
    <div class="text-h4 font-weight-bold mt-3 mx-3">
      Code Generation Analysis
    </div>

    <div class="tiles-container my-2">
      <v-hover v-slot="{ isHovering, props }">
        <v-card
          elevation="4"
          color="red-lighten-3"
          variant="elevated"
          class="mx-3 my-3"
          style="width: 220px; height: 175px"
          v-bind="props"
        >
          <v-card-item>
            <div class="my-5">
              <div class="text-h3 font-weight-bold text-red-darken-4">
                {{
                  (
                    (totalGeneratedCode / cumulativeNumberLOCAccepted) *
                    100
                  ).toFixed(0)
                }}%
              </div>
              <div
                class="text-normal-1 font-weight-bold mt-1 text-red-darken-2"
              >
                development code *
                <v-expand-transition>
                  <div
                    v-if="isHovering"
                    class="d-flex transition-fast-in-fast-out bg-red-darken-3 text-caption px-1 py-1 rounded"
                    style="
                      height: 100%;
                      margin-top: -6.5rem;
                      margin-bottom: 1.25rem;
                    "
                  >
                    Approximation based on
                    {{ developmentLanguages.join(', ') }} code. Java code is
                    considered 50% for development and 50% for unit tests.
                  </div>
                </v-expand-transition>
              </div>
              <div
                class="text-caption text-grey-darken-3"
                v-if="!isHovering"
              >
                generated in last 4 weeks
              </div>
            </div>
          </v-card-item>
        </v-card>
      </v-hover>

      <v-hover v-slot="{ isHovering, props }">
        <v-card
          elevation="4"
          color="green-lighten-3"
          variant="elevated"
          class="mx-3 my-3"
          style="width: 220px; height: 175px"
          v-bind="props"
        >
          <v-card-item>
            <div class="my-5">
              <div class="text-h3 font-weight-bold text-green-darken-4">
                {{
                  (
                    (totalGenetedTests / cumulativeNumberLOCAccepted) *
                    100
                  ).toFixed(0)
                }}%
              </div>
              <div
                class="text-normal-1 font-weight-bold mt-1 text-green-darken-2"
              >
                unit tests *<v-expand-transition>
                  <div
                    v-if="isHovering"
                    class="d-flex transition-fast-in-fast-out bg-green-darken-3 text-caption px-2 py-2 rounded"
                    style="
                      height: 100%;
                      margin-top: -6rem;
                      margin-bottom: 1.25rem;
                    "
                  >
                    Approximation based on
                    {{ unitTestLanguages.join(', ') }} code. Java code is
                    considered 50% for development and 50% for unit tests.
                  </div>
                </v-expand-transition>
              </div>
              <div
                class="text-caption text-grey-darken-3"
                v-if="!isHovering"
              >
                generated in last 4 weeks
              </div>
            </div>
          </v-card-item>
        </v-card>
      </v-hover>

      <v-hover v-slot="{ isHovering, props }">
        <v-card
          elevation="4"
          color="purple-lighten-3"
          variant="elevated"
          class="mx-3 my-3"
          style="width: 220px; height: 175px"
          v-bind="props"
        >
          <v-card-item>
            <div class="my-5">
              <div class="text-h3 font-weight-bold text-purple-darken-4">
                {{
                  (
                    (totalGeneratedConfigurations /
                      cumulativeNumberLOCAccepted) *
                    100
                  ).toFixed(0)
                }}%
              </div>
              <div
                class="text-normal-1 font-weight-bold mt-1 text-purple-darken-2"
              >
                configuration files *<v-expand-transition>
                  <div
                    v-if="isHovering"
                    class="d-flex transition-fast-in-fast-out bg-purple-darken-3 text-caption px-2 py-2 rounded"
                    style="
                      height: 100%;
                      margin-top: -6rem;
                      margin-bottom: 1.25rem;
                    "
                  >
                    Approximation based on
                    {{ configurationLanguages.join(', ') }} code.
                  </div>
                </v-expand-transition>
              </div>
              <div
                class="text-caption text-grey-darken-3"
                v-if="!isHovering"
              >
                generated in last 4 weeks
              </div>
            </div>
          </v-card-item>
        </v-card>
      </v-hover>

      <v-card
        elevation="4"
        color="purple-lighten-3"
        variant="elevated"
        class="mx-3 my-3"
        style="width: 220px; height: 175px"
      >
        <v-card-item>
          <div class="my-5">
            <div class="text-h3 font-weight-bold text-purple-darken-4">
              {{
                (
                  (totalOtherGeneratedCode / cumulativeNumberLOCAccepted) *
                  100
                ).toFixed(0)
              }}%
            </div>
            <div
              class="text-normal-1 font-weight-bold mt-1 text-purple-darken-2"
            >
              Non-code files
            </div>
            <div class="text-caption text-grey-darken-3">
              generated in last 4 weeks
            </div>
          </div>
        </v-card-item>
      </v-card>
    </div>

    <!-- <v-main
      class="p-1"
      style="min-height: 300px"
    >
      <v-container
        style="min-height: 300px"
        class="px-4 elevation-2"
      >
        <h2>Acceptance rate (%)</h2>
        <Bar
          :data="acceptanceRateChartData"
          :options="chartOptions"
        />

        <h2>Total Suggestions Count | Total Acceptances Count</h2>
        <Line
          :data="totalSuggestionsAndAcceptanceChartData"
          :options="chartOptions"
        />

        <h2>Total Lines Suggested | Total Lines Accepted</h2>
        <Line
          :data="chartData"
          :options="chartOptions"
        />

        <h2>Total Active Users</h2>
        <Bar
          :data="totalActiveUsersChartData"
          :options="totalActiveUsersChartOptions"
        />
      </v-container>
    </v-main> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRef } from 'vue';
import { Metrics } from '../model/Metrics';
import { Language } from '../model/Language';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export default defineComponent({
  name: 'MetricsViewer',
  props: {
    metrics: {
      type: Object,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    activeSeats: {
      type: Number,
      required: true,
    },
    inactiveSeats: {
      type: Number,
      required: true,
    },
  },
  components: {
    // Line,
    // Bar,
  },
  data() {
    return {
      data: {
        labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
        datasets: [
          {
            backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
            data: [40, 20, 80, 10],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    };
  },

  setup(props) {
    //Constants
    const timePerLineInMinutes = 2;
    const developerRatePerDay = 1500;
    const copilotLicenseCost = 70;
    const developmentLanguages = [
      'typescriptreact',
      'javascriptreact',
      'python',
      'java',
      'c#',
      'html',
      'css',
      'sql',
      'hcl',
      'ruby',
      'json with comments',
      'scss',
      'objective-cpp',
    ];
    const unitTestLanguages = ['javascript', 'typescript', 'java'];
    const configurationLanguages = [
      'json',
      'yaml',
      'xml',
      'properties',
      'ini',
      'env',
      'dockerfile',
      'shell',
      'bash',
      'makefile',
      'cmake',
      'gradle',
      'maven',
      'ant',
      'dotnev',
      'rakefile',
      'coffeescript',
      'powershell',
      'groovy',
    ];

    //Tiles
    let acceptanceRateAverage = ref(0);
    let cumulativeNumberSuggestions = ref(0);
    let cumulativeNumberAcceptances = ref(0);
    let cumulativeNumberLOCAccepted = ref(0);
    let totalActiveUsers = ref(0);
    let costAvoidance = ref(0);
    let licenseCost = ref(0);
    let returnOnInvestment = ref(0);
    let totalGeneratedCode = ref(0);
    let totalGenetedTests = ref(0);
    let totalGeneratedConfigurations = ref(0);
    let totalOtherGeneratedCode = ref(0);

    //Acceptance Rate
    const acceptanceRateChartData = ref<{ labels: string[]; datasets: any[] }>({
      labels: [],
      datasets: [],
    });

    //Total Suggestions Count | Total Acceptance Counts
    const totalSuggestionsAndAcceptanceChartData = ref<{
      labels: string[];
      datasets: any[];
    }>({ labels: [], datasets: [] });

    //Total Lines Suggested | Total Lines Accepted
    const chartData = ref<{ labels: string[]; datasets: any[] }>({
      labels: [],
      datasets: [],
    });

    //Total Active Users
    const totalActiveUsersChartData = ref<{
      labels: string[];
      datasets: any[];
    }>({ labels: [], datasets: [] });

    // Create an empty map to store the languages.
    const languages = new Map<string, Language>();

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      height: 300,
      width: 300,
      layout: {
        padding: {
          left: 150,
          right: 150,
          top: 20,
          bottom: 40,
        },
      },
    };

    const totalActiveUsersChartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
      layout: {
        padding: {
          left: 50,
          right: 50,
          top: 50,
          bottom: 50,
        },
      },
    };

    const data = toRef(props, 'metrics').value;

    cumulativeNumberSuggestions.value = 0;
    const cumulativeSuggestionsData = data.map((m: Metrics) => {
      cumulativeNumberSuggestions.value += m.total_suggestions_count;
      return m.total_suggestions_count;
    });

    cumulativeNumberAcceptances.value = 0;
    const cumulativeAcceptancesData = data.map((m: Metrics) => {
      cumulativeNumberAcceptances.value += m.total_acceptances_count;
      return m.total_acceptances_count;
    });

    totalSuggestionsAndAcceptanceChartData.value = {
      labels: data.map((m: Metrics) => m.day),
      datasets: [
        {
          label: 'Total Suggestions',
          data: cumulativeSuggestionsData,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
        },
        {
          label: 'Total Acceptance',
          data: cumulativeAcceptancesData,
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
        },
      ],
    };

    cumulativeNumberLOCAccepted.value = 0;
    const cumulativeLOCAcceptedData = data.map((m: Metrics) => {
      const total_lines_accepted = m.total_lines_accepted;
      cumulativeNumberLOCAccepted.value += total_lines_accepted;
      return total_lines_accepted;
    });

    totalActiveUsers.value = 0;
    const totalActiveUsersData = data.map((m: Metrics) => {
      totalActiveUsers.value = Math.max(
        m.total_active_users,
        totalActiveUsers.value,
      );
      return m.total_active_users;
    });

    licenseCost.value = copilotLicenseCost * props.totalSeats;

    chartData.value = {
      labels: data.map((m: Metrics) => m.day),
      datasets: [
        {
          label: 'Total Lines Suggested',
          data: data.map((m: Metrics) => m.total_lines_suggested),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
        },
        {
          label: 'Total Lines Accepted',
          data: cumulativeLOCAcceptedData,
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
        },
      ],
    };

    let sum = 0;
    const acceptanceRates = data.map((m: Metrics) => {
      const rate =
        m.total_lines_suggested !== 0
          ? (m.total_lines_accepted / m.total_lines_suggested) * 100
          : 0;
      sum += rate;
      return rate;
    });
    acceptanceRateAverage.value = sum / data.length;

    acceptanceRateChartData.value = {
      labels: data.map((m: Metrics) => m.day),
      datasets: [
        {
          type: 'line', // This makes the dataset a line in the chart
          label: 'Acceptance Rate',
          data: acceptanceRates,
          backgroundColor: 'rgba(173, 216, 230, 0.2)', // light blue
          borderColor: 'rgba(173, 216, 230, 1)', // darker blue
          fill: false, // This makes the area under the line not filled
        },
      ],
    };

    totalActiveUsersChartData.value = {
      labels: data.map((m: Metrics) => m.day),
      datasets: [
        {
          label: 'Total Active Users',
          data: data.map((m: Metrics) => m.total_active_users),
          backgroundColor: 'rgba(0, 0, 139, 0.2)', // dark blue with 20% opacity
          borderColor: 'rgba(255, 99, 132, 1)',
        },
      ],
    };

    // Process the language breakdown separately
    data.forEach((m: Metrics) =>
      m.breakdown.forEach((breakdown) => {
        const languageName = breakdown.language;
        let language = languages.get(languageName);

        if (!language) {
          // Create a new Language object if it does not exist
          language = new Language({
            name: languageName,
            acceptedPrompts: breakdown.acceptances_count,
            suggestedLinesOfCode: breakdown.lines_suggested,
            acceptedLinesOfCode: breakdown.lines_accepted,
          });
          languages.set(languageName, language);
        } else {
          // Update the existing Language object
          language.acceptedPrompts += breakdown.acceptances_count;
          language.suggestedLinesOfCode += breakdown.lines_suggested;
          language.acceptedLinesOfCode += breakdown.lines_accepted;
        }
        // Recalculate the acceptance rate
        language.acceptanceRate =
          language.suggestedLinesOfCode !== 0
            ? (language.acceptedLinesOfCode / language.suggestedLinesOfCode) *
              100
            : 0;
      }),
    );

    //Sort languages map by accepted lines of code
    languages[Symbol.iterator] = function* () {
      yield* [...this.entries()].sort(
        (a, b) => b[1].acceptedLinesOfCode - a[1].acceptedLinesOfCode,
      );
    };

    costAvoidance.value =
      ((cumulativeNumberLOCAccepted.value * timePerLineInMinutes) / (60 * 8)) *
      developerRatePerDay;

    returnOnInvestment.value =
      ((costAvoidance.value - licenseCost.value) / licenseCost.value) * 100;

    totalGeneratedCode.value = data
      .map((m: Metrics) => {
        let total = 0;
        m.breakdown.forEach((breakdown) => {
          if (developmentLanguages.includes(breakdown.language)) {
            total +=
              breakdown.language === 'java'
                ? breakdown.lines_accepted / 2
                : breakdown.lines_accepted;
          }
        });
        return total;
      })
      .reduce((a: number, b: number) => a + b, 0);

    totalGenetedTests.value = data
      .map((m: Metrics) => {
        let total = 0;
        m.breakdown.forEach((breakdown) => {
          if (unitTestLanguages.includes(breakdown.language)) {
            total +=
              breakdown.language === 'java'
                ? breakdown.lines_accepted / 2
                : breakdown.lines_accepted;
          }
        });
        return total;
      })
      .reduce((a: number, b: number) => a + b, 0);

    totalGeneratedConfigurations.value = data
      .map((m: Metrics) => {
        let total = 0;
        m.breakdown.forEach((breakdown) => {
          if (configurationLanguages.includes(breakdown.language)) {
            total += breakdown.lines_accepted;
          }
        });
        return total;
      })
      .reduce((a: number, b: number) => a + b, 0);

    totalOtherGeneratedCode.value = data
      .map((m: Metrics) => {
        let total = 0;
        m.breakdown.forEach((breakdown) => {
          if (
            !developmentLanguages.includes(breakdown.language) &&
            !unitTestLanguages.includes(breakdown.language) &&
            !configurationLanguages.includes(breakdown.language)
          ) {
            total += breakdown.lines_accepted;
          }
        });
        return total;
      })
      .reduce((a: number, b: number) => a + b, 0);

    return {
      totalSuggestionsAndAcceptanceChartData,
      chartData,
      chartOptions,
      totalActiveUsersChartData,
      totalActiveUsersChartOptions,
      acceptanceRateChartData,
      acceptanceRateAverage,
      cumulativeNumberSuggestions,
      cumulativeNumberAcceptances,
      cumulativeNumberLOCAccepted,
      languages,
      totalActiveUsers,
      costAvoidance,
      licenseCost,
      returnOnInvestment,
      totalGeneratedCode,
      totalGenetedTests,
      totalGeneratedConfigurations,
      totalOtherGeneratedCode,
      developmentLanguages,
      unitTestLanguages,
      configurationLanguages,
      timePerLineInMinutes,
      developerRatePerDay,
      copilotLicenseCost,
    };
  },
});
</script>

<style scoped>
.tiles-container {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
}
</style>
