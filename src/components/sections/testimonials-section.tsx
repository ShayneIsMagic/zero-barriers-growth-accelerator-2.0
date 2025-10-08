'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CMO',
      company: 'TechFlow Solutions',
      content:
        'Zero Barriers helped us identify critical gaps in our messaging that were costing us conversions. Within 60 days, we saw a 47% increase in lead quality and a 32% improvement in close rates.',
      score: 95,
      improvement: '47% lead quality increase',
    },
    {
      name: 'Marcus Rodriguez',
      role: 'VP of Marketing',
      company: 'Growth Dynamics',
      content:
        'The AI analysis was incredibly accurate. It pinpointed exactly where our value proposition was weak and gave us actionable steps to fix it. Our conversion rates jumped 41% in just 90 days.',
      score: 92,
      improvement: '41% conversion rate improvement',
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Founder & CEO',
      company: 'Wellness Innovations',
      content:
        "As a startup, we couldn't afford expensive marketing consultants. Zero Barriers gave us enterprise-level insights at a fraction of the cost. Our website conversion went from 2.1% to 6.8%.",
      score: 98,
      improvement: '224% conversion rate increase',
    },
    {
      name: 'David Kim',
      role: 'Marketing Director',
      company: 'Global Retail Corp',
      content:
        'The framework-based approach made all the difference. Instead of generic advice, we got specific, implementable recommendations that aligned with proven marketing principles.',
      score: 89,
      improvement: '38% revenue per visitor increase',
    },
    {
      name: 'Lisa Thompson',
      role: 'Head of Growth',
      company: 'SaaS Scale',
      content:
        'We were struggling with our B2B messaging. The platform identified exactly which value elements we were missing and helped us craft messaging that resonated with enterprise buyers.',
      score: 94,
      improvement: '52% enterprise deal size increase',
    },
    {
      name: 'James Wilson',
      role: 'Digital Marketing Manager',
      company: 'E-commerce Plus',
      content:
        'The speed of analysis is incredible. What used to take weeks of A/B testing, we now get in minutes. Our marketing team is 3x more productive and our results are significantly better.',
      score: 91,
      improvement: '3x team productivity increase',
    },
  ];

  return (
    <section className="section-padding">
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
            Trusted by{' '}
            <span className="bg-gradient-to-r from-growth-600 to-primary bg-clip-text text-transparent">
              Growth-Focused Teams
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
            See how leading companies are accelerating their growth with our
            AI-powered optimization platform.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <div className="mb-4 flex items-start justify-between">
                    <Quote className="h-8 w-8 text-growth-200" />
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(testimonial.score / 20)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium text-muted-foreground">
                        {testimonial.score}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <blockquote className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{testimonial.content}&rdquo;
                  </blockquote>

                  {/* Improvement Metric */}
                  <div className="mb-4 rounded-lg border border-success-200 bg-success-50 p-3">
                    <p className="text-sm font-semibold text-success-700">
                      {testimonial.improvement}
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-growth-100 text-growth-700">
                        {testimonial.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="rounded-2xl border border-growth-200 bg-gradient-to-r from-growth-50 to-primary/10 p-8">
            <h3 className="mb-4 text-2xl font-bold">
              Join 2,000+ Companies Already Growing
            </h3>
            <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-growth-600">
                  98%
                </div>
                <div className="text-sm text-muted-foreground">
                  Customer Satisfaction
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-success-600">
                  42%
                </div>
                <div className="text-sm text-muted-foreground">
                  Average Conversion Improvement
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-primary">60s</div>
                <div className="text-sm text-muted-foreground">
                  Average Analysis Time
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-warning-600">
                  90
                </div>
                <div className="text-sm text-muted-foreground">
                  Days to Measurable Results
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
