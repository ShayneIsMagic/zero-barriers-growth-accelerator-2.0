// Test authentication bypass for immediate testing
export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export class TestAuthService {
  static async signIn(email: string, _password: string): Promise<TestUser | null> {
    // Accept any email/password combination for testing
    console.log('Test Auth: Sign in attempt with', email);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: 'test-user-' + Date.now(),
      email: email,
      name: email.split('@')[0] || 'Test User',
      role: 'SUPER_ADMIN'
    };
  }

  static async getCurrentUser(): Promise<TestUser | null> {
    return {
      id: 'test-user-current',
      email: 'test@example.com',
      name: 'Test User',
      role: 'SUPER_ADMIN'
    };
  }

  static async signOut(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}
