'use client';

import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnalysisClient } from '@/lib/analysis-client';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function TestPage() {
  const { user, signIn, signOut, loading } = useAuth();
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testUrl, setTestUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestAuth = async () => {
    const success = await signIn(testEmail, testPassword);
    if (success) {
      alert('✅ Authentication successful!');
    } else {
      alert('❌ Authentication failed!');
    }
  };

  const handleTestAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await AnalysisClient.analyzeWebsite(testUrl);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-growth-50 to-growth-100 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-growth-900">🧪 Test Dashboard</h1>
          <p className="mt-2 text-growth-600">
            Test all core functionality of the Growth Accelerator
          </p>
        </div>

        {/* Authentication Test */}
        <Card>
          <CardHeader>
            <CardTitle>🔐 Authentication Test</CardTitle>
            <CardDescription>
              Test login functionality (currently in demo mode)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleTestAuth}>
                Test Sign In
              </Button>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
            {user && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ✅ Logged in as: {user.name} ({user.email}) - Role: {user.role}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* AI Analysis Test */}
        <Card>
          <CardHeader>
            <CardTitle>🤖 AI Analysis Test</CardTitle>
            <CardDescription>
              Test website analysis functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Website URL</label>
              <Input
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <Button 
              onClick={handleTestAnalysis} 
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Test Analysis'
              )}
            </Button>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {analysisResult && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✅ Analysis completed! Overall Score: {analysisResult.overallScore}/100
                  </AlertDescription>
                </Alert>
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium">Analysis Summary:</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {analysisResult.summary}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>📊 System Status</CardTitle>
            <CardDescription>
              Current system configuration and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Status: {user ? '✅ Authenticated' : '❌ Not authenticated'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Mode: Demo Mode (Static Deployment)
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Status: Demo Analysis Available
                </p>
                <p className="text-sm text-muted-foreground">
                  Real AI: Requires API keys configuration
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>🔗 Quick Links</CardTitle>
            <CardDescription>
              Navigate to different parts of the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <a href="/">Home</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/dashboard/analyze">Analysis Dashboard</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/auth/signin">Sign In Page</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/auth/signup">Sign Up Page</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
