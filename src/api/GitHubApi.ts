//Make a call to the GitHub API to get Copilot Metrics, the API is https://api.github.com/orgs/toussaintt/copilot/usage
//Add the header Accept: application/vnd.github+json to the request
//Add also the Authorization: Bearer <token> header where <token> is hardcoded for now
//Also add X-GitHub-Api-Version: 2022-11-28 header
//Return the response from the API
// test

import axios from 'axios';
import { Metrics } from '../model/Metrics';
import enterpriseMockedResponse from '../assets/enterprise_response_sample.json';

import { Team, TeamMember } from '@/model/Team';
import { compareDesc } from 'date-fns';

const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'prasadd-rakbank';
const REPO_NAME = 'copilot-metrics-viewer';
const DATA_DIR = 'data/combined/org';
const TEAM_DIR = 'data/combined/team';
const GITHUB_TOKEN = localStorage.getItem('token');

const fetchFileList = async (path: string): Promise<string[]> => {
  const response = await axios.get(
    `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
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
  const response = localStorage.getItem(filePath);
  //return cached response if available
  if (response) {
    return JSON.parse(response);
  }
  const apiResponse = await axios.get(
    `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3.raw',
      },
    },
  );
  //clear all stale files in localstorage
  let suffix = 'org';
  if (!filePath.includes(suffix)) {
    suffix = 'team';
  }
  Object.keys(localStorage).forEach((key) => {
    if (key.includes('combined-' + suffix)) {
      localStorage.removeItem(key);
    }
  });
  //cache the response
  localStorage.setItem(filePath, JSON.stringify(apiResponse.data));
  return apiResponse.data;
};

const combineMetrics = async (path: string = DATA_DIR): Promise<Metrics[]> => {
  const fileList = (await fetchFileList(path)).sort((a, b) =>
    compareDesc(extractDate(a), extractDate(b)),
  );
  const filePath = fileList[0];
  console.log('Fetching data from file:', filePath);
  const fileMetrics = await fetchFileContent(filePath);
  return fileMetrics;
};

const extractDate = (fileName: string) => {
  const match = fileName.match(
    /combined-(org|team)-metrics-(\d{4}-\d{2}-\d{2})\.json/,
  );
  return match ? match[2] : '';
};

const combineTeamMetrics = async (
  path: string = TEAM_DIR,
): Promise<Metrics[]> => {
  const fileList = (await fetchFileList(path)).sort((a, b) =>
    compareDesc(extractDate(a), extractDate(b)),
  );
  const filePath = fileList[0];
  console.log('Fetching data from file:', filePath);
  const fileMetrics = await fetchFileContent(filePath);
  return fileMetrics;
};

export const getMetricsApi = async (token: string): Promise<Metrics[]> => {
  let response;
  let metricsData;

  if (process.env.VUE_APP_MOCKED_DATA === 'true') {
    if (process.env.VUE_APP_SCOPE === 'organization') {
      response = await combineMetrics();
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

export const getTeamsMetrics = async (): Promise<Metrics[]> => {
  const metrics = await combineTeamMetrics(TEAM_DIR);
  console.log('Teams Metrics:', metrics);
  return metrics;
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
