// 客户端认证管理
class AuthManager {
  private tokenKey = 'cs2_auth_token';
  
  // 保存 token
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }
  
  // 获取 token
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }
  
  // 删除 token
  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
  }
  
  // 检查是否已登录
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
  
  // 获取认证头
  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
    return {
      'Content-Type': 'application/json'
    };
  }
  
  // 带认证的 fetch
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      ...this.getAuthHeaders(),
      ...(options.headers || {})
    };
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // 如果返回 401，清除 token 并重定向到登录页
    if (response.status === 401) {
      this.removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return response;
  }
}

export const authManager = new AuthManager();
