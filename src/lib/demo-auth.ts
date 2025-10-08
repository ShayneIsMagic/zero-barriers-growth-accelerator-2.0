// Demo authentication service for static deployment
export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

export class DemoAuthService {
  private static readonly DEMO_USERS: DemoUser[] = [
    {
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'USER'
    },
    {
      id: 'admin-user',
      email: 'shayne@devpipeline.com',
      name: 'Shayne Roy',
      role: 'SUPER_ADMIN'
    },
    {
      id: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER'
    }
  ];

  static async signIn(email: string, password: string): Promise<DemoUser | null> {
    // In demo mode, accept any password for known emails
    const user = this.DEMO_USERS.find(u => u.email === email);
    
    if (user) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return user;
    }
    
    return null;
  }

  static async signUp(email: string, password: string, name: string): Promise<DemoUser | null> {
    // In demo mode, create a new user
    const newUser: DemoUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      role: 'USER'
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return newUser;
  }

  static async getCurrentUser(): Promise<DemoUser | null> {
    // Return the admin user by default in demo mode
    return this.DEMO_USERS.find(u => u.email === 'shayne@devpipeline.com') || this.DEMO_USERS[0] || null;
  }

  static async signOut(): Promise<void> {
    // In demo mode, just simulate delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  static isDemoMode(): boolean {
    return true; // Always true for static deployment
  }
}
