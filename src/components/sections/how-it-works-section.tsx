'use client';

import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Upload, Brain, Target, TrendingUp, ArrowRight } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      title: 'Upload Your Content',
      description:
        'Simply paste your marketing copy, website content, or upload files for analysis.',
      details: [
        'Copy & paste text',
        'Upload PDFs',
        'Link to web pages',
        'Import from tools',
      ],
    },
    {
      icon: Brain,
      title: 'AI Analysis',
      description:
        'Our AI analyzes your content using proven frameworks in under 60 seconds.',
      details: [
        'Golden Circle analysis',
        'Value element scoring',
        'Strength theme mapping',
        'Barrier identification',
      ],
    },
    {
      icon: Target,
      title: 'Get Insights',
      description:
        'Receive detailed scoring, recommendations, and actionable optimization strategies.',
      details: [
        'Comprehensive scoring',
        'Priority recommendations',
        'Implementation guide',
        'ROI projections',
      ],
    },
    {
      icon: TrendingUp,
      title: 'Implement & Grow',
      description:
        'Apply recommendations and see measurable improvements in conversion rates.',
      details: [
        'Quick wins',
        'Sustainable growth',
        'Performance tracking',
        'Continuous optimization',
      ],
    },
  ];

  return (
    <section id="how-it-works" className="section-padding">
      <div className="container-wide">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            How It Works in{' '}
            <span className="bg-gradient-to-r from-growth-600 to-primary bg-clip-text text-transparent">
              4 Simple Steps
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
            From content upload to measurable growth - our streamlined process
            makes optimization simple and effective.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-0 right-0 top-1/2 z-0 hidden h-0.5 -translate-y-1/2 transform bg-gradient-to-r from-growth-200 via-primary/30 to-growth-200 lg:block" />

          <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 z-20 flex h-8 w-8 -translate-x-1/2 transform items-center justify-center rounded-full bg-gradient-to-br from-growth-500 to-primary text-sm font-bold text-white">
                  {index + 1}
                </div>

                <Card className="h-full text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                  <CardHeader className="pb-4 pt-8">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-growth-500 to-primary">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2 text-left">
                      {step.details.map((detail, detailIndex) => (
                        <li
                          key={detailIndex}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-growth-500" />
                          <span className="text-muted-foreground">
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Arrow (except for last step) */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 z-20 hidden -translate-y-1/2 transform lg:block">
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Process Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
              <TrendingUp className="h-8 w-8 text-success-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Fast Results</h3>
            <p className="text-muted-foreground">
              See improvements in as little as 30 days with our quick-win
              recommendations.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-growth-100">
              <Target className="h-8 w-8 text-growth-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Proven Methods</h3>
            <p className="text-muted-foreground">
              Built on research-backed frameworks that have transformed
              thousands of businesses.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">AI-Powered</h3>
            <p className="text-muted-foreground">
              Advanced AI that learns from your industry and continuously
              improves recommendations.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
