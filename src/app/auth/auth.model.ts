export interface LoginResponse {
  access_token: string;
  expires_in: number;
  user?: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
}
