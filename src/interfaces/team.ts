export interface FETCHED_TEAM {
  id: number;
  name: number;
}

export interface MEMBER {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_photo_url: string | null;
}

export interface TEAM_DETAILS {
  updated_at: string;
  id: null;
  deleted_at: string;
  name: string;
  org_id: number;
  created_at: string;
  members: MEMBER[];
}

export interface TEAM {
  label: string;
  value: number;
}