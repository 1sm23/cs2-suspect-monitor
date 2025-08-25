// 客户端认证管理
class AuthManager {
  private apiKeyKey = 'cs2_steam_api_key';

  // 保存 Steam API Key
  setSteamApiKey(apiKey: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.apiKeyKey, apiKey);
    }
  }

  // 获取 Steam API Key
  getSteamApiKey(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.apiKeyKey);
    }
    return null;
  }

  // 删除 Steam API Key
  removeSteamApiKey(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.apiKeyKey);
    }
  }

  // 检查是否已设置API密钥
  isAuthenticated(): boolean {
    return this.getSteamApiKey() !== null;
  }

  // 获取认证头
  getAuthHeaders(isFileUpload: boolean = false): HeadersInit {
    const apiKey = this.getSteamApiKey();
    const headers: HeadersInit = {};

    if (apiKey) {
      headers['X-Steam-API-Key'] = apiKey;
    }

    // 文件上传时不设置Content-Type，让浏览器自动设置
    if (!isFileUpload) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  // 带认证的 fetch
  async authenticatedFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    // 检查是否是文件上传（包含FormData）
    const isFileUpload = options.body instanceof FormData;

    const headers = {
      ...this.getAuthHeaders(isFileUpload),
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 如果没有API密钥，重定向到登录页
    if (!this.isAuthenticated()) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return response;
  }
}

export const authManager = new AuthManager();
