//Make a call to the GitHub API to get Copilot Metrics, the API is https://api.github.com/orgs/toussaintt/copilot/usage
//Add the header Accept: application/vnd.github+json to the request
//Add also the Authorization: Bearer <token> header where <token> is hardcoded for now
//Also add X-GitHub-Api-Version: 2022-11-28 header
//Return the response from the API

import axios from 'axios';
import { Metrics } from '../model/Metrics';
import organizationMockedResponse from '../assets/organization_response_sample.json';
import enterpriseMockedResponse from '../assets/enterprise_response_sample.json';

import { Team, TeamMember } from '@/model/Team';

const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'prasadd-rakbank';
const REPO_NAME = 'copilot-metrics-viewer';
const DATA_DIR = 'data';
const GITHUB_TOKEN = localStorage.getItem('token');

const fetchFileList = async (): Promise<string[]> => {
  const response = await axios.get(
    `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_DIR}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        accept: 'application/vnd.github+json',
      },
    },
  );
  return response.data.map((file: any) => file.path);
};

const fetchFileContent = async (filePath: string): Promise<Metrics[]> => {
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

const combineMetrics = async (): Promise<Metrics[]> => {
  const fileList = await fetchFileList();
  const allMetrics: Metrics[] = [];

  for (const filePath of fileList) {
    console.log('Fetching data from file:', filePath);
    const fileMetrics = await fetchFileContent(filePath);
    allMetrics.push(...fileMetrics);
  }

  return allMetrics;
};

export const getMetricsApi = async (token: string): Promise<Metrics[]> => {
  let response;
  let metricsData;

  if (process.env.VUE_APP_MOCKED_DATA === 'true') {
    if (process.env.VUE_APP_SCOPE === 'organization') {
      response = await combineMetrics();
      // .then((combinedMetrics) => {
      //   return combinedMetrics;
      //   // response = combinedMetrics;
      //   // metricsData = response.map((item: any) => new Metrics(item));
      //   // console.log(JSON.stringify(combinedMetrics, null, 2));
      // })
      // .catch((error) => {
      //   console.error('Error combining metrics:', error);
      // });
      //response = organizationMockedResponse;
    } else if (process.env.VUE_APP_SCOPE === 'enterprise') {
      response = enterpriseMockedResponse;
    } else {
      throw new Error(
        `Invalid VUE_APP_SCOPE value: ${process.env.VUE_APP_SCOPE}. Expected "organization" or "enterprise".`,
      );
    }
    console.log;
    metricsData = response?.map((item: any) => new Metrics(item));
  } else {
    if (process.env.VUE_APP_SCOPE === 'organization') {
      response = await axios.get(
        `https://api.github.com/orgs/${process.env.VUE_APP_GITHUB_ORG}/copilot/usage`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
      );
    } else if (process.env.VUE_APP_SCOPE === 'enterprise') {
      response = await axios.get(
        `https://api.github.com/enterprises/${process.env.VUE_APP_GITHUB_ENT}/copilot/usage`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
      );
    } else {
      throw new Error(
        `Invalid VUE_APP_SCOPE value: ${process.env.VUE_APP_SCOPE}. Expected "organization" or "enterprise".`,
      );
    }

    metricsData = response.data.map((item: any) => new Metrics(item));
  }
  return metricsData;
};

export const getTeams = async (token: string): Promise<Team[]> => {
  const response = await axios.get(
    `https://api.github.com/orgs/${process.env.VUE_APP_GITHUB_ORG}/teams`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  );

  const teams = await Promise.all(
    response.data.map(async (team: Team) => {
      const response = await axios.get(
        `https://api.github.com/orgs/${process.env.VUE_APP_GITHUB_ORG}/teams/${team.slug}/members`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
      );

      team.members = response.data.map((item: any) => new TeamMember(item));
      return team;
    }),
  );

  return teams.flat();
};

export const getTeamsMetrics = async (token: string): Promise<Metrics[]> => {
  const teams = await getTeams(token);
  // console.log(teams);

  const teamsMetrics = await Promise.all(
    teams.map(async (team: Team) => {
      const response = await axios.get(
        `https://api.github.com/orgs/${process.env.VUE_APP_GITHUB_ORG}/team/${team.slug}/copilot/usage`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
      );

      return response.data.map((item: any) => {
        const metric = new Metrics(item);
        metric.team = team.name;
        return metric;
      });
    }),
  );

  return teamsMetrics.flat();
};

export const getSeatsInformation = async (
  token: string,
): Promise<CopilotOrganizationDetails> => {
  const response = await axios.get(
    `https://api.github.com/orgs/${process.env.VUE_APP_GITHUB_ORG}/copilot/billing`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  );

  return response.data;
};

export const getSeatsByTeam = async (
  token: string,
  teams: Team[],
): Promise<Team[]> => {
  const response = await axios.get(
    `https://api.github.com/orgs/${process.env.VUE_APP_GITHUB_ORG}/copilot/billing/seats`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  );

  response.data.seats.map((item: any) => {
    const user: TeamMember = item.assignee;
    //loop through each team in the teams array and find this user. If found, increment the seat count for the team by 1
    teams.forEach((team) => {
      if (team.members.find((member) => member.id === user.id)) {
        // console.log(team.name, team.copilotSeats);
        team.copilotSeats = ~~team.copilotSeats + 1;
      }
    });
  });
  return teams;
};
