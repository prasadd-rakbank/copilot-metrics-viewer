const axios = require('axios');
const fs = require('fs');

async function fetchCopilotMetrics(daysToSubtract = 1) {
  const date = new Date();
  date.setDate(date.getDate() - daysToSubtract);
  const formattedDate = date.toISOString().split('T')[0];
  const fileName = `./data/copilot-data-${formattedDate}.json`;

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
        },
      },
    );

    fs.writeFileSync(fileName, JSON.stringify(response.data, null, 2));
    console.log(`Metrics saved to ${fileName}`);
  } catch (error) {
    console.error('Error fetching Copilot metrics:', error);
  }
}

const daysToSubtract = process.argv[2] ? parseInt(process.argv[2], 10) : 1;
fetchCopilotMetrics(daysToSubtract);