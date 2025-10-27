'use client';

import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Zap,
  Target,
  TrendingUp,
  Shield,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
} from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: '60-Second Analysis',
      description:
        'Get comprehensive content analysis in under a minute using our AI-powered platform.',
      benefits: ['Instant insights', 'No waiting time', 'Quick optimization'],
    },
    {
      icon: Target,
      title: 'Proven Frameworks',
      description:
        "Built on established marketing frameworks including Simon Sinek's Golden Circle.",
      benefits: ['Time-tested methods', 'Research-backed', 'Industry standard'],
    },
    {
      icon: TrendingUp,
      title: '25-50% Improvements',
      description:
        'Achieve measurable conversion rate improvements with actionable recommendations.',
      benefits: ['Proven results', 'Data-driven insights', 'ROI focused'],
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description:
        'Bank-level security with SOC 2 compliance and data encryption.',
      benefits: ['GDPR compliant', 'SOC 2 certified', 'End-to-end encryption'],
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description:
        'Deep insights into your content performance with detailed scoring.',
      benefits: [
        'Comprehensive metrics',
        'Visual dashboards',
        'Trend analysis',
      ],
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description:
        'Work together with your team to implement optimization strategies.',
      benefits: ['Role-based access', 'Real-time updates', 'Shared insights'],
    },
    {
      icon: Clock,
      title: '90-Day Results',
      description:
        'See measurable growth within 90 days of implementing recommendations.',
      benefits: ['Quick wins', 'Sustainable growth', 'Proven timeline'],
    },
    {
      icon: CheckCircle,
      title: 'Actionable Insights',
      description:
        'Get specific, implementable recommendations for immediate action.',
      benefits: [
        'Clear next steps',
        'Prioritized actions',
        'Implementation guide',
      ],
    },
  ];

  return (
    <section id="features" className="section-padding bg-muted/30">
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
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-growth-600 to-primary bg-clip-text text-transparent">
              Accelerate Growth
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
            Our comprehensive platform combines AI-powered analysis with proven
            marketing frameworks to eliminate guesswork and deliver measurable
            results.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-growth-500 to-primary">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li
                        key={benefitIndex}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-success-500" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="rounded-2xl border border-growth-200 bg-gradient-to-r from-growth-50 to-primary/10 p-8">
            <h3 className="mb-4 text-2xl font-bold">
              Ready to Transform Your Marketing?
            </h3>
            <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
              Join thousands of businesses that have already accelerated their
              growth with our AI-powered optimization platform.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button className="btn-primary rounded-lg px-8 py-3 font-semibold">
                Start Free Analysis
              </button>
              <button className="btn-secondary rounded-lg px-8 py-3 font-semibold">
                Schedule Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
