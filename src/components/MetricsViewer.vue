<template>
  <div>
    <div class="text-h4 mt-3 mx-3 text-gray">License Usage Analysis</div>
    <div class="tiles-container mb-2">
      <ProgressCard
        :activeSeats="activeSeats"
        :totalSeats="totalSeats"
        :totalActiveUsers="totalActiveUsers"
        :selectedTeam="selectedTeam"
        :teams="teams"
        :currentMonth="currentMonth"
      />

      <StatusCard
        v-if="selectedTeam === null || selectedTeam === ''"
        :value="inactiveSeats"
        label="Inactive licenses"
        :month="currentMonth"
      />

      <StatusCard
        v-if="selectedTeam === null || selectedTeam === ''"
        :value="
          (inactiveSeats * copilotLicenseCost).toLocaleString('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })
        "
        label="Potential license cost reduction"
        month="by removing inactive licenses"
        currency="true"
        width="270px"
      />
    </div>

    <div class="text-h4 mt-3 mx-3 text-gray">Code Generation Analysis</div>

    <div class="tiles-container my-2">
      <StatusCard
        :value="cumulativeNumberLOCAccepted"
        label="Lines of code generated"
        :month="duration"
        width="220px"
      />

      <div class="text-h3 my-auto text-gray">&asymp;</div>

      <HoverStatusCard
        :value="
          ~~((totalGeneratedCode / cumulativeNumberLOCAccepted) * 100).toFixed(
            0,
          ) + '%'
        "
        label="development code *"
        :month="duration"
        :hoverText="`Approximation based on ${developmentLanguages.join(
          ', ',
        )} code. Java code is considered 50% for development and 50% for unit tests.`"
        width="185px"
        height="175px"
      />

      <HoverStatusCard
        :value="
          ~~((totalGenetedTests / cumulativeNumberLOCAccepted) * 100).toFixed(
            0,
          ) + '%'
        "
        label="unit tests *"
        :month="duration"
        :hoverText="`Approximation based on ${unitTestLanguages.join(
          ', ',
        )} code. Java code is considered 50% for development and 50% for unit tests.`"
        width="185px"
        height="175px"
      />

      <HoverStatusCard
        :value="
          ~~(
            (totalGeneratedConfigurations / cumulativeNumberLOCAccepted) *
            100
          ).toFixed(0) + '%'
        "
        label="configuration files *"
        :month="duration"
        :hoverText="`Approximation based on ${configurationLanguages.join(
          ', ',
        )} code.`"
        width="185px"
        height="175px"
      />

      <StatusCard
        :value="
          ~~(
            (totalOtherGeneratedCode / cumulativeNumberLOCAccepted) *
            100
          ).toFixed(0) + '%'
        "
        label="Non-code files"
        :month="duration"
        width="185px"
        height="175px"
      />
    </div>
  </div>
  <!-- <v-divider class="mx-3 border-opacity-50"></v-divider> -->
  <div class="text-h4 mt-3 mx-3 text-gray">Cost vs Benefit Analysis</div>
  <div class="tiles-container mb-2">
    <!-- <div class="text-h3 my-auto font-weight-bold">::</div> -->
    <HoverStatusCard
      :value="
        costAvoidance.toLocaleString('en-US', {
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      "
      label="Cost Avoided *"
      :month="duration"
      :hoverText="`Assumption: an engineer would have taken ${timePerLineInMinutes} minutes to write and unit test the same line of code manually. Engineer daily rate is assumed to be AED ${developerRatePerDay}`"
      width="230px"
      height="175px"
      currency="true"
    />

    <div class="text-h6 my-auto text-gray">Vs</div>
    <StatusCard
      :value="
        licenseCost.toLocaleString('en-US', {
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      "
      label="License Cost"
      :month="currentMonth"
      currency="true"
    />

    <div class="text-h3 my-auto font-weight-medium text-gray">=</div>

    <StatusCard
      :value="`${~~(
        ((costAvoidance - licenseCost) / licenseCost) *
        100
      ).toFixed(0)}%`"
      label="Return on Investment"
      :month="duration"
    />
  </div>

  <!-- <v-divider class="mx-3 border-opacity-50"></v-divider> -->
</template>

<script lang="ts">
import { defineComponent, ref, toRef, watch } from 'vue';
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
import { Team } from '@/model/Team';
import { format, formatDistanceStrict, addDays } from 'date-fns';
import StatusCard from './StatusCard.vue';
import HoverStatusCard from './HoverStatusCard.vue';
import ProgressCard from './ProgressCard.vue';

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
    teamMetrics: {
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
    selectedTeam: {
      type: String,
      required: true,
    },
    teams: {
      type: Array<Team>,
      required: true,
    },
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
  },
  components: {
    StatusCard,
    HoverStatusCard,
    ProgressCard,
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
    let duration = ref(
      formatDistanceStrict(
        new Date(props.start),
        addDays(new Date(props.end), 1),
      ),
    );
    console.log('Recalculating duration to be: ', duration);
    let currentMonth = ref(format(new Date(), 'MMMM yyyy'));

    //Acceptance Rate
    const acceptanceRateChartData = ref<{ labels: string[]; datasets: any[] }>({
      labels: [],
      datasets: [],
    });

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

    const refreshData = () => {
      const teamName = toRef(props, 'selectedTeam').value;

      console.log('Recalculating duration to be: ', duration.value);
      console.log('Refreshing for team: ', teamName);
      const data =
        teamName === null || teamName === ''
          ? toRef(props, 'metrics').value
          : toRef(props, 'teamMetrics').value.filter(
              (m: Metrics) => m.team === teamName,
            );

      console.log('data is: ', data, toRef(props, 'teamMetrics').value);
      if (data.length > 0) {
        duration.value =
          'in last ' +
          formatDistanceStrict(
            new Date(data[0].day),
            addDays(data[data.length - 1].day, 1),
          );
      } else {
        duration.value = '';
      }

      cumulativeNumberAcceptances.value = 0;
      data.map((m: Metrics) => {
        cumulativeNumberAcceptances.value += m.total_acceptances_count;
        return m.total_acceptances_count;
      });

      cumulativeNumberLOCAccepted.value = 0;
      const cumulativeLOCAcceptedData = data.map((m: Metrics) => {
        const total_lines_accepted = m.total_lines_accepted;
        cumulativeNumberLOCAccepted.value += total_lines_accepted;
        return total_lines_accepted;
      });

      totalActiveUsers.value = 0;
      data.map((m: Metrics) => {
        totalActiveUsers.value = Math.max(
          m.total_active_users,
          totalActiveUsers.value,
        );
        return m.total_active_users;
      });

      licenseCost.value =
        copilotLicenseCost *
        (teamName == null || teamName === ''
          ? props.totalSeats
          : totalActiveUsers.value);

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

      costAvoidance.value =
        ((cumulativeNumberLOCAccepted.value * timePerLineInMinutes) /
          (60 * 8)) *
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
    };

    // Initial call to setup data
    refreshData();

    // Watch for changes in selectedTeam prop
    watch(
      () => props.selectedTeam,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          refreshData();
        }
      },
    );

    return {
      chartData,
      chartOptions,
      totalActiveUsersChartData,
      totalActiveUsersChartOptions,
      acceptanceRateChartData,
      acceptanceRateAverage,
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
      currentMonth,
      duration,
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
