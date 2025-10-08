'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Clock,
  Users,
} from 'lucide-react';

export function CTASection() {
  const benefits = [
    {
      icon: Zap,
      title: '60-Second Analysis',
      description: 'Get comprehensive insights in under a minute',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'SOC 2 compliant with bank-level encryption',
    },
    {
      icon: Clock,
      title: '90-Day Results',
      description: 'See measurable growth within 3 months',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together to implement optimizations',
    },
  ];

  const guarantees = [
    '30-day money-back guarantee',
    'No long-term contracts',
    'Cancel anytime',
    'Free onboarding support',
  ];

  return (
    <section className="section-padding via-primary-900 bg-gradient-to-br from-growth-900 to-growth-800 text-white">
      <div className="container-wide">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center space-x-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
            >
              <Zap className="h-4 w-4" />
              <span>Limited Time: 50% Off First Month</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-bold tracking-tight md:text-5xl"
            >
              Ready to{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Accelerate Your Growth?
              </span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-2xl text-xl text-gray-300"
            >
              Join thousands of businesses that have already transformed their
              marketing with our AI-powered optimization platform. Start your
              free analysis today.
            </motion.p>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                    <benefit.icon className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{benefit.title}</p>
                    <p className="text-xs text-gray-400">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Guarantees */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="space-y-3"
            >
              <p className="text-sm font-semibold text-gray-300">
                Our Guarantees:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {guarantees.map((guarantee, index) => (
                  <motion.div
                    key={guarantee}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-400" />
                    <span className="text-gray-300">{guarantee}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - CTA Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm">
              <div className="mb-6 text-center">
                <h3 className="mb-2 text-2xl font-bold">
                  Start Your Free Analysis
                </h3>
                <p className="text-gray-300">
                  No credit card required • Get started in 2 minutes
                </p>
              </div>

              <form className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Company Name"
                    className="border-white/30 bg-white/20 text-white placeholder:text-gray-400 focus:border-yellow-400"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Work Email"
                    className="border-white/30 bg-white/20 text-white placeholder:text-gray-400 focus:border-yellow-400"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Website URL"
                    className="border-white/30 bg-white/20 text-white placeholder:text-gray-400 focus:border-yellow-400"
                  />
                </div>
                <div>
                  <Button
                    type="submit"
                    className="group w-full bg-gradient-to-r from-yellow-400 to-orange-400 py-3 text-lg font-semibold text-gray-900 hover:from-yellow-300 hover:to-orange-300"
                  >
                    Start Free Analysis
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  By signing up, you agree to our{' '}
                  <a href="/terms" className="text-yellow-400 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="/privacy"
                    className="text-yellow-400 hover:underline"
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="mt-6 border-t border-white/20 pt-6">
                <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>SOC 2 Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>2,000+ Users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>98% Satisfaction</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -right-4 -top-4 rounded-lg border bg-white p-3 shadow-lg"
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-gray-700">
                  Free Setup
                </span>
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 rounded-lg border bg-white p-3 shadow-lg"
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-gray-700">
                  2 Min Setup
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm">
            <h3 className="mb-4 text-2xl font-bold">
              Questions? Let&apos;s Talk
            </h3>
            <p className="mx-auto mb-6 max-w-2xl text-gray-300">
              Our growth experts are here to help you get started and answer any
              questions about how Zero Barriers can accelerate your business
              growth.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Schedule a Demo
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Contact Sales
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
