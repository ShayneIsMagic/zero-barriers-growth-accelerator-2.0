import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowRight,
  BarChart3,
  Shield,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900 dark:text-white md:text-7xl">
            Zero Barriers
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Growth Accelerator
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
            AI-powered marketing optimization platform that systematically
            analyzes content to identify growth barriers and provide actionable
            recommendations.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Start Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard/step-by-step-execution">
              <Button size="lg" variant="outline">
                Step-by-Step Analysis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white px-4 py-20 dark:bg-slate-800">
        <div className="container mx-auto">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Comprehensive Analysis Framework
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Golden Circle Analysis</CardTitle>
                <CardDescription>
                  Simon Sinek&apos;s framework to identify your Why, How, What,
                  and Who
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Purpose & Mission Analysis</li>
                  <li>• Unique Value Proposition</li>
                  <li>• Target Audience Identification</li>
                  <li>• Competitive Differentiation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-green-600">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Elements of Value</CardTitle>
                <CardDescription>
                  Harvard Business Review&apos;s 30 B2C and 40 B2B value
                  elements framework
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Functional Value Elements</li>
                  <li>• Emotional Value Elements</li>
                  <li>• Life-Changing Elements</li>
                  <li>• Social Impact Elements</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>CliftonStrengths</CardTitle>
                <CardDescription>
                  Gallup&apos;s 34-theme strengths assessment for organizational
                  excellence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Strategic Thinking Themes</li>
                  <li>• Relationship Building Themes</li>
                  <li>• Influencing Themes</li>
                  <li>• Executing Themes</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Analysis Tools */}
      <section className="px-4 py-20">
        <div className="container mx-auto">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Integrated Analysis Tools
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 font-semibold">Lighthouse Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Performance, SEO, Accessibility, Best Practices
                </p>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 font-semibold">PageAudit Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Technical SEO, Content Quality, User Experience
                </p>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-teal-600">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 font-semibold">SEO Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Search Console, Keyword Planner, Google Trends
                </p>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 font-semibold">AI Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Gemini & Claude AI for content analysis
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-20">
        <div className="container mx-auto text-center">
          <h2 className="mb-6 text-4xl font-bold text-white">
            Ready to Accelerate Your Growth?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
            Get comprehensive analysis reports with actionable recommendations
            to eliminate growth barriers and optimize your marketing strategy.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Start Free Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard/executive-reports">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                View Sample Reports
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
