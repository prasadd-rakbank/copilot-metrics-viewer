export class Team {
  description: string;
  html_url: string;
  id: number;
  members_url: string;
  name: string;
  node_id: string;
  notification_setting: string;
  permission: string;
  privacy: string;
  repositories_url: string;
  slug: string;
  url: string;
  copilotSeats: number;
  members: TeamMember[] = [];

  constructor(data: any) {
    this.description = data.description;
    this.html_url = data.html_url;
    this.id = data.id;
    this.members_url = data.members_url;
    this.name = data.name;
    this.node_id = data.node_id;
    this.notification_setting = data.notification_setting;
    this.permission = data.permission;
    this.privacy = data.privacy;
    this.repositories_url = data.repositories_url;
    this.slug = data.slug;
    this.url = data.url;
    this.copilotSeats = 0;
  }
}

export class TeamMember {
  avatar_url: string;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: string;
  html_url: string;
  id: number;
  login: string;
  node_id: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;

  constructor(data: any) {
    this.avatar_url = data.avatar_url;
    this.events_url = data.events_url;
    this.followers_url = data.followers_url;
    this.following_url = data.following_url;
    this.gists_url = data.gists_url;
    this.gravatar_id = data.gravatar_id;
    this.html_url = data.html_url;
    this.id = data.id;
    this.login = data.login;
    this.node_id = data.node_id;
    this.organizations_url = data.organizations_url;
    this.received_events_url = data.received_events_url;
    this.repos_url = data.repos_url;
    this.site_admin = data.site_admin;
    this.starred_url = data.starred_url;
    this.subscriptions_url = data.subscriptions_url;
    this.type = data.type;
    this.url = data.url;
  }
}

export class TeamSeats {
  team: string;
  seats: number;

  constructor(data: any) {
    this.team = data.team;
    this.seats = data.seats;
  }
}
