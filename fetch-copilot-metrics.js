const axios = require('axios');
const fs = require('fs');

async function fetchCopilotMetrics(daysToSubtract = 1) {
  const date = new Date();
  date.setDate(date.getDate() - daysToSubtract);
  const formattedDate = date.toISOString().split('T')[0];
  const fileName = `./data/org/copilot-data-${formattedDate}.json`;

  try {
    const response = await axios.get(
      'https://api.github.com/orgs/rakbank-internal/copilot/usage',
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        params: {
          since: formattedDate,
          until: formattedDate,
          per_page:1000,
        },
      },
    );

    fs.writeFileSync(fileName, JSON.stringify(response.data, null, 2));
    console.log(`Metrics saved to ${fileName}`);
  } catch (error) {
    console.error('Error fetching Copilot metrics:', error);
  }
}

async function getTeams(token) {
  try {
    const response = await axios.get(
      `https://api.github.com/orgs/rakbank-internal/teams`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
        params: {
          per_page:1000,
        },
      },
    );

    const teams = await Promise.all(
      response.data.map(async (team) => {
        const membersResponse = await axios.get(
          `https://api.github.com/orgs/rakbank-internal/teams/${team.slug}/members`,
          {
            headers: {
              Accept: 'application/vnd.github+json',
              Authorization: `Bearer ${token}`,
              'X-GitHub-Api-Version': '2022-11-28',
            },
            params: {
              per_page:1000,
            },            
          },
        );

        team.members = membersResponse.data;
        return team;
      }),
    );

    return teams;
  } catch (error) {
    console.error('Error fetching teams:', error);
  }
}

async function fetchTeamMetrics(daysToSubtract = 1) {
  const date = new Date();
  date.setDate(date.getDate() - daysToSubtract);
  const formattedDate = date.toISOString().split('T')[0];

  try {
    const teams = await getTeams(process.env.GITHUB_TOKEN);
    for (const team of teams) {
      const response = await axios.get(
        `https://api.github.com/orgs/rakbank-internal/teams/${team.slug}/copilot/usage`,
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
          params: {
            since: formattedDate,
            until: formattedDate,
            per_page:1000,
          },
        },
      );

      if (response.data && response.data.length > 0) {
        const fileName = `./data/team/copilot-data-${team.slug}-${formattedDate}.json`;
        fs.writeFileSync(fileName, JSON.stringify(response.data, null, 2));
        console.log(`Metrics for team ${team.slug} saved to ${fileName}`);
      } else {
        console.warn(
          `No data found for team ${team.slug} for date ${formattedDate}`,
        );
      }
    }
  } catch (error) {
    console.error('Error fetching team metrics:', error);
  }
}

const daysToSubtract = process.argv[2] ? parseInt(process.argv[2], 10) : 1;
fetchCopilotMetrics(daysToSubtract);
fetchTeamMetrics(daysToSubtract);
