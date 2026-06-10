'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiCall } from '@/lib/api-call';
import { isClientAuthDisabled } from '@/lib/security-config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart3,
  Bot,
  Brain,
  CheckCircle2,
  Database,
  GitCompare,
  Loader2,
  LogOut,
  Shield,
  Target,
  Users,
  XCircle,
} from 'lucide-react';

interface SystemStatus {
  api: {
    status: string;
    authRequired: boolean;
    environment: string;
  };
  ollama: {
    status: string;
    baseUrl: string;
    model: string;
    message: string;
    availableModels: string[];
  };
  ai: {
    allowFallbacks: boolean;
    geminiConfigured: boolean;
  };
  user: {
    email: string;
    role: string;
    isSuperAdmin: boolean;
  } | null;
}

const PRIMARY_TOOLS = [
  {
    title: 'Content Comparison',
    description: 'Collect once, reuse across all framework analyses',
    href: '/dashboard/content-comparison',
    icon: GitCompare,
  },
  {
    title: 'Golden Circle',
    description: 'WHY / HOW / WHAT / WHO chunked analysis',
    href: '/dashboard/golden-circle-standalone',
    icon: Target,
  },
  {
    title: 'B2C Elements',
    description: '30 consumer value elements',
    href: '/dashboard/elements-value-b2c',
    icon: Users,
  },
  {
    title: 'B2B Elements',
    description: '40 business value elements',
    href: '/dashboard/elements-value-b2b',
    icon: BarChart3,
  },
  {
    title: 'CliftonStrengths',
    description: '34 talent themes across four domains',
    href: '/dashboard/clifton-strengths-simple',
    icon: Brain,
  },
  {
    title: 'Brand Archetypes',
    description: '12 archetypes — flat 0.0–1.0 scoring per Jambojon',
    href: '/dashboard/brand-archetypes-standalone',
    icon: Bot,
  },
  {
    title: 'All Assessments',
    description: 'Full dashboard catalog and reports',
    href: '/dashboard',
    icon: Database,
  },
];

function StatusBadge({ ok, label }: { ok: boolean; label: string }): React.ReactElement {
  return (
    <Badge
      variant={ok ? 'default' : 'destructive'}
      className={ok ? 'bg-growth-600 text-white' : ''}
    >
      {ok ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
      {label}
    </Badge>
  );
}

export default function WorkspacePage(): React.ReactElement {
  const authDisabled = isClientAuthDisabled();
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    if (authDisabled) {
      return;
    }
    if (!loading && !user) {
      router.replace('/auth/signin?callbackUrl=/workspace');
    }
  }, [authDisabled, loading, user, router]);

  useEffect(() => {
    const loadStatus = async (): Promise<void> => {
      setStatusLoading(true);
      setStatusError(null);
      try {
        const { data } = await apiCall<SystemStatus>('/api/system/status', {
          showErrorToast: false,
        });
        if (!data) {
          throw new Error('Failed to load system status');
        }
        setStatus(data);
      } catch {
        setStatusError('Could not reach backend status endpoint');
      } finally {
        setStatusLoading(false);
      }
    };

    void loadStatus();
  }, [authDisabled, user]);

  if (!authDisabled && (loading || !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-growth-600" />
      </div>
    );
  }

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const ollamaReady = status?.ollama.status === 'ready';

  return (
    <div className="mx-auto min-h-screen max-w-7xl space-y-8 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-growth-900">Workspace</h1>
          <p className="text-growth-600">
            One entry point for Ollama, backend APIs, and all analyses
          </p>
        </div>
        <div className="flex items-center gap-3">
          {authDisabled && (
            <Badge variant="outline" className="border-amber-400 text-amber-800">
              Local testing — auth off
            </Badge>
          )}
          {isSuperAdmin && (
            <Badge className="bg-growth-700 text-white">
              <Shield className="mr-1 h-3 w-3" />
              Super Admin
            </Badge>
          )}
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={() => void signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-growth-600" />
            System Status
          </CardTitle>
          <CardDescription>
            Live connection to your backend and local Ollama instance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {statusLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking Ollama and API...
            </div>
          ) : statusError ? (
            <p className="text-sm text-destructive">{statusError}</p>
          ) : status ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="mb-2 text-sm font-medium">Backend API</p>
                <StatusBadge ok={status.api.status === 'healthy'} label={status.api.status} />
                <p className="mt-2 text-xs text-muted-foreground">
                  Auth required: {status.api.authRequired ? 'yes' : 'no'}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="mb-2 text-sm font-medium">Ollama</p>
                <StatusBadge ok={ollamaReady} label={status.ollama.status} />
                <p className="mt-2 text-xs text-muted-foreground">
                  {status.ollama.model} @ {status.ollama.baseUrl}
                </p>
                {!ollamaReady && (
                  <p className="mt-1 text-xs text-destructive">{status.ollama.message}</p>
                )}
              </div>
              <div className="rounded-lg border p-4">
                <p className="mb-2 text-sm font-medium">AI Providers</p>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge ok={ollamaReady} label="Ollama primary" />
                  {status.ai.geminiConfigured && (
                    <Badge variant="outline">Gemini fallback</Badge>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {!statusLoading && !ollamaReady && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm">
              <p className="font-medium">Start Ollama before running analyses:</p>
              <code className="mt-2 block rounded bg-muted p-2 text-xs">
                ollama serve
              </code>
              <p className="mt-2 text-muted-foreground">
                Then run <code className="text-xs">npm run dev</code> from the project root.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Analysis Tools</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PRIMARY_TOOLS.map((tool) => (
            <Card key={tool.href} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <tool.icon className="h-5 w-5 text-growth-600" />
                  {tool.title}
                </CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-growth-600 hover:bg-growth-700">
                  <Link href={tool.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Super Admin Access
            </CardTitle>
            <CardDescription>
              Full access to diagnostics and all protected backend routes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/dashboard/reports">Reports</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/profile">Profile</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/test">API Test Console</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/api/health" target="_blank" rel="noopener noreferrer">
                Health API
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
