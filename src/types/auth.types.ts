export interface IUser {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  role: 'superadmin' | 'admin' | 'user';
  isActive: boolean;
  billing: {
    plan: 'free' | 'basic' | 'pro';
    creditsRemaining: number;
    creditsUsed: number;
    stripeEnabled: boolean;
  };
  createdAt: string;
}

export interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dob?: string;
  gender?: string;
}
