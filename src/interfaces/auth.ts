export interface SignupRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  otp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginMFARequest {
  key: string;
  otp: string;
}

export interface LoginResponse {
  key: string;
  message: string;
}

export interface LoginMFAResponse {
  access_token: string;
  refresh_token: string;
}


export interface RefreshResponse {
  access_token: string
}