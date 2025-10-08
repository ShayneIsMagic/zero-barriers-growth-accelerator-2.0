'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestLoginPage() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleQuickLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const success = await signIn(email, password);
      if (success) {
        router.push('/dashboard');
      } else {
        alert('Login failed');
      }
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">🔧 Test Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Click any button below to login instantly for testing:
          </p>
          
          <Button
            onClick={() => handleQuickLogin('test@example.com', 'anypassword')}
            disabled={loading}
            className="w-full"
            variant="default"
          >
            {loading ? 'Logging in...' : 'Login as Test User'}
          </Button>
          
          <Button
            onClick={() => handleQuickLogin('admin@test.com', 'admin123')}
            disabled={loading}
            className="w-full"
            variant="secondary"
          >
            Login as Admin
          </Button>
          
          <Button
            onClick={() => handleQuickLogin('demo@example.com', 'demo123')}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            Login as Demo User
          </Button>
          
          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Any email/password combination will work</p>
            <p>This is for testing only</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
