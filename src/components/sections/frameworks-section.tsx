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
  Target,
  Users,
  Building2,
  Brain,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

export function FrameworksSection() {
  const frameworks = [
    {
      icon: Target,
      title: "Simon Sinek's Golden Circle",
      subtitle: 'WHY • HOW • WHAT',
      description:
        'Analyze your purpose, process, and product alignment to create compelling messaging that resonates with your audience.',
      elements: [
        'Purpose Clarity',
        'Process Differentiation',
        'Product Positioning',
      ],
      benefits: [
        'Emotional connection',
        'Brand differentiation',
        'Customer loyalty',
      ],
    },
    {
      icon: Users,
      title: 'Consumer Elements of Value',
      subtitle: '30 Value Elements',
      description:
        'Identify and optimize the specific value elements that drive customer decisions and satisfaction.',
      elements: [
        'Functional Value',
        'Emotional Value',
        'Life-Changing Value',
        'Social Impact',
      ],
      benefits: [
        'Customer satisfaction',
        'Competitive advantage',
        'Pricing power',
      ],
    },
    {
      icon: Building2,
      title: 'B2B Elements of Value',
      subtitle: '40 Business Elements',
      description:
        'Optimize your B2B value proposition across all critical business decision factors.',
      elements: [
        'Table Stakes',
        'Functional Value',
        'Ease of Business',
        'Individual Value',
      ],
      benefits: [
        'Sales acceleration',
        'Customer retention',
        'Market expansion',
      ],
    },
    {
      icon: Brain,
      title: 'CliftonStrengths Domains',
      subtitle: '34 Strength Themes',
      description:
        'Align your messaging with the psychological patterns that drive decision-making and engagement.',
      elements: [
        'Executing',
        'Influencing',
        'Relationship Building',
        'Strategic Thinking',
      ],
      benefits: [
        'Message resonance',
        'Audience engagement',
        'Conversion optimization',
      ],
    },
  ];

  return (
    <section id="frameworks" className="section-padding bg-muted/30">
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
            Built on{' '}
            <span className="bg-gradient-to-r from-growth-600 to-primary bg-clip-text text-transparent">
              Proven Frameworks
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
            Our AI combines decades of research and proven methodologies to
            deliver insights that drive real business results.
          </p>
        </motion.div>

        {/* Frameworks Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {frameworks.map((framework, index) => (
            <motion.div
              key={framework.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-growth-500 to-primary">
                      <framework.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-2 text-xl">
                        {framework.title}
                      </CardTitle>
                      <div className="mb-3 inline-flex items-center space-x-2 rounded-full bg-growth-100 px-3 py-1 text-sm font-medium text-growth-700">
                        <TrendingUp className="h-4 w-4" />
                        <span>{framework.subtitle}</span>
                      </div>
                      <CardDescription className="text-base">
                        {framework.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Elements */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Analysis Elements
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {framework.elements.map((element, elementIndex) => (
                        <div
                          key={elementIndex}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <CheckCircle className="h-4 w-4 flex-shrink-0 text-success-500" />
                          <span>{element}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Key Benefits
                    </h4>
                    <div className="space-y-2">
                      {framework.benefits.map((benefit, benefitIndex) => (
                        <div
                          key={benefitIndex}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-growth-500" />
                          <span className="text-muted-foreground">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Framework Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-growth-50 p-8">
            <h3 className="mb-4 text-2xl font-bold">
              Why These Frameworks Work
            </h3>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success-100">
                  <CheckCircle className="h-6 w-6 text-success-600" />
                </div>
                <h4 className="mb-2 font-semibold">Research-Backed</h4>
                <p className="text-sm text-muted-foreground">
                  Built on decades of academic research and real-world
                  validation
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-growth-100">
                  <Target className="h-6 w-6 text-growth-600" />
                </div>
                <h4 className="mb-2 font-semibold">Proven Results</h4>
                <p className="text-sm text-muted-foreground">
                  Used by Fortune 500 companies to drive measurable growth
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h4 className="mb-2 font-semibold">AI Enhanced</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI learns from successful implementations to improve
                  accuracy
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
