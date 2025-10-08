'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Check,
  TrendingUp,
  Zap,
  Target,
  ArrowRight,
  Play,
  Star,
} from 'lucide-react';

export function HeroSection() {
  const features = [
    '60-second content analysis',
    'AI-powered insights',
    'Proven frameworks',
    'Actionable recommendations',
    '25-50% conversion improvements',
  ];

  const stats = [
    { label: 'Analyses Completed', value: '10,000+' },
    { label: 'Average Score Improvement', value: '35%' },
    { label: 'Customer Satisfaction', value: '98%' },
    { label: 'Time to Results', value: '<90 days' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-growth-100/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="container-wide section-padding">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center space-x-2 rounded-full border border-growth-200 bg-growth-50 px-3 py-1 text-sm font-medium text-growth-700"
            >
              <Zap className="h-4 w-4" />
              <span>AI-Powered Growth Analysis</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
            >
              Eliminate{' '}
              <span className="bg-gradient-to-r from-growth-600 to-primary bg-clip-text text-transparent">
                Growth Barriers
              </span>{' '}
              in 60 Seconds
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-2xl text-xl text-muted-foreground"
            >
              Our AI systematically analyzes your marketing copy using proven
              frameworks to identify revenue-blocking gaps and deliver
              actionable optimization recommendations.
            </motion.p>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-3"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <Check className="h-5 w-5 flex-shrink-0 text-success-500" />
                  <span className="text-muted-foreground">{feature}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Button size="lg" className="group w-full sm:w-auto">
                Start Free Analysis
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Link href="/demo">
                <Button
                  variant="outline"
                  size="lg"
                  className="group w-full sm:w-auto"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex items-center space-x-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="ml-2">4.9/5 from 2,000+ reviews</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            {/* Main Card */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-muted/50 shadow-2xl">
              <CardContent className="p-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-success-500" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Analysis in Progress...
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">60s</div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6 h-2 w-full rounded-full bg-muted">
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-growth-500 to-primary"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, delay: 0.5 }}
                  />
                </div>

                {/* Analysis Results Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Golden Circle Score
                    </span>
                    <span className="text-2xl font-bold text-growth-600">
                      87
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Consumer Value</span>
                    <span className="text-2xl font-bold text-success-600">
                      92
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">B2B Elements</span>
                    <span className="text-primary-600 text-2xl font-bold">
                      78
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Score</span>
                    <span className="bg-gradient-to-r from-growth-600 to-primary bg-clip-text text-3xl font-bold text-transparent">
                      84
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 border-t pt-6">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" className="text-xs">
                      View Details
                    </Button>
                    <Button size="sm" className="text-xs">
                      Get Recommendations
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Elements */}
            <motion.div
              className="absolute -right-4 -top-4 rounded-lg border bg-white p-3 shadow-lg"
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-growth-500" />
                <span className="text-xs font-medium">3 Barriers Found</span>
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 rounded-lg border bg-white p-3 shadow-lg"
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-success-500" />
                <span className="text-xs font-medium">+42% Potential</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
              className="text-center"
            >
              <div className="bg-gradient-to-r from-growth-600 to-primary bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
