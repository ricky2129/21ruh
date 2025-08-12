export interface USER {
  email: string;
  label: string;
  value: number;
}


export interface FETCHED_USER {
  first_name: string;
  last_name: string;
  email: string;
  id: number;
}


export interface ROLE {
  id?: number;
  key: string;
  value: string;
  name?: string
}

export interface PROFILE {
  org_id: number;
  last_name: string
  id: number;
  notification: boolean;
  first_name: string;
  email: string;
  profile_photo_url: null;
}