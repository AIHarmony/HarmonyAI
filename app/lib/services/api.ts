import { User } from '../context/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Survey {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'draft';
  responses: number;
  created: Date;
}

interface Response {
  id: string;
  surveyTitle: string;
  reward: number;
  completed: Date;
}

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  reward: number;
  participants: number;
  status: 'active' | 'completed';
  createdAt: Date;
}

class ApiService {
  private static instance: ApiService;
  private token: string | null = null;

  private constructor() {
    // 从 localStorage 获取 token
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // 认证相关方法
  public async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('token', response.data.token);
    }

    return response;
  }

  public async register(username: string, email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (response.success && response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('token', response.data.token);
    }

    return response;
  }

  public logout(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  // 调查相关方法
  public async getSurveys(): Promise<ApiResponse<Survey[]>> {
    return this.request<Survey[]>('/surveys');
  }

  public async getSurveyById(id: string): Promise<ApiResponse<Survey>> {
    return this.request<Survey>(`/surveys/${id}`);
  }

  public async createSurvey(surveyData: Omit<Survey, 'id' | 'created'>): Promise<ApiResponse<Survey>> {
    return this.request<Survey>('/surveys', {
      method: 'POST',
      body: JSON.stringify(surveyData),
    });
  }

  public async updateSurvey(id: string, surveyData: Partial<Survey>): Promise<ApiResponse<Survey>> {
    return this.request<Survey>(`/surveys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(surveyData),
    });
  }

  public async deleteSurvey(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/surveys/${id}`, {
      method: 'DELETE',
    });
  }

  // 响应相关方法
  public async getResponses(): Promise<ApiResponse<Response[]>> {
    return this.request<Response[]>('/responses');
  }

  public async getResponseById(id: string): Promise<ApiResponse<Response>> {
    return this.request<Response>(`/responses/${id}`);
  }

  public async submitResponse(surveyId: string, responseData: any): Promise<ApiResponse<Response>> {
    return this.request<Response>(`/surveys/${surveyId}/responses`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  }

  // 研究项目相关方法
  public async getProjects(): Promise<ApiResponse<ResearchProject[]>> {
    return this.request<ResearchProject[]>('/projects');
  }

  public async getProjectById(id: string): Promise<ApiResponse<ResearchProject>> {
    return this.request<ResearchProject>(`/projects/${id}`);
  }

  public async createProject(projectData: Omit<ResearchProject, 'id' | 'createdAt'>): Promise<ApiResponse<ResearchProject>> {
    return this.request<ResearchProject>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  public async updateProject(id: string, projectData: Partial<ResearchProject>): Promise<ApiResponse<ResearchProject>> {
    return this.request<ResearchProject>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  public async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // 代币相关方法
  public async getTokenBalance(): Promise<ApiResponse<number>> {
    return this.request<number>('/tokens/balance');
  }

  public async transferTokens(toAddress: string, amount: number): Promise<ApiResponse<void>> {
    return this.request<void>('/tokens/transfer', {
      method: 'POST',
      body: JSON.stringify({ toAddress, amount }),
    });
  }
}

export const api = ApiService.getInstance(); 