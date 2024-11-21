const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { compareAsc } = require('date-fns');

const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'prasadd-rakbank';
const REPO_NAME = 'copilot-metrics-viewer';
const DATA_DIR = 'data/combined/org';
const TEAM_DIR = 'data/combined/team';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error('GitHub token is not set in the environment variables');
}

const fetchFileList = async (dirPath) => {
  const response = await axios.get(
    `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${dirPath}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
    },
  );
  return response.data.map((file) => file.path);
};

const fetchFileContent = async (filePath) => {
  const response = await axios.get(
    `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3.raw',
      },
    },
  );
  return response.data;
};

const extractTeamName = (fileName) => {
  const match = fileName.match(/copilot-data-(.*)-\d{4}-\d{2}-\d{2}\.json/);
  return match ? match[1] : '';
};

const combineMetrics = async (dirPath) => {
  const fileList = await fetchFileList(dirPath);
  const allMetrics = [];

  for (const filePath of fileList) {
    console.log('Fetching data from file:', filePath);
    const fileMetrics = await fetchFileContent(filePath);
    allMetrics.push(...fileMetrics);
  }

  return allMetrics.sort((a, b) =>
    compareAsc(new Date(a.day), new Date(b.day)),
  );
};

const combineTeamMetrics = async (dirPath) => {
  const fileList = await fetchFileList(dirPath);
  const groupedFiles = {};

  fileList.forEach((file) => {
    const teamName = extractTeamName(file);
    if (!groupedFiles[teamName]) {
      groupedFiles[teamName] = [];
    }
    groupedFiles[teamName].push(file);
  });

  console.log('Grouped Files:', groupedFiles);

  const teamsMetrics = await Promise.all(
    Object.keys(groupedFiles).map(async (team) => {
      const teamFiles = groupedFiles[team];
      const allMetrics = [];
      for (const filePath of teamFiles) {
        console.log('Fetching data from file:', filePath);
        let fileMetrics = await fetchFileContent(filePath);
        fileMetrics = await fileMetrics.map((metric) => {
          metric.team = team;
          return metric;
        });
        allMetrics.push(...fileMetrics);
      }
      return allMetrics.sort((a, b) =>
        compareAsc(new Date(a.day), new Date(b.day)),
      );
    }),
  );

  return teamsMetrics.flat();
};

const saveMetricsToFile = (metrics, outputPath) => {
  fs.writeFileSync(outputPath, JSON.stringify(metrics, null, 2));
};

const main = async () => {
  try {
    const currentDate = new Date().toISOString().split('T')[0];

    const orgMetrics = await combineMetrics(DATA_DIR);
    saveMetricsToFile(
      orgMetrics,
      path.join(
        __dirname,
        `${DATA_DIR}/combined-org-metrics-${currentDate}.json`,
      ),
    );

    const teamMetrics = await combineTeamMetrics(TEAM_DIR);
    saveMetricsToFile(
      teamMetrics,
      path.join(
        __dirname,
        `${TEAM_DIR}/combined-team-metrics-${currentDate}.json`,
      ),
    );

    console.log('Metrics combined and saved successfully.');
  } catch (error) {
    console.error('Error combining metrics:', error);
  }
};

main();
