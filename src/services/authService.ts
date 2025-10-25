export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    email: string;
    name: string;
  };
  message?: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      user: {
        email: data.email || 'demo@example.com',
        name: (data.email || 'demo@example.com').split('@')[0],
      },
    };
  },
};
