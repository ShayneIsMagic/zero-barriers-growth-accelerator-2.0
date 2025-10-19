/**
 * Clean Dashboard - Only Working Features
 * Shows only functional assessments with clear status indicators
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  CheckCircle, 
  Clock,
  ExternalLink,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function CleanDashboard() {
  const [_url, _setUrl] = useState('');

  const workingAssessments = [
    {
      id: 'website-analysis',
      name: 'Website Analysis',
      status: 'ready',
      description: 'Complete AI-powered business framework analysis - perfect for understanding your website\'s strategic positioning and value proposition',
      icon: Brain,
      route: '/dashboard/website-analysis',
      whatYouGet: [
        'Golden Circle Analysis - Your WHY, HOW, WHAT, and WHO',
        'Elements of Value Assessment - 30 B2C + 40 B2B value elements',
        'CliftonStrengths Analysis - 34 themes of organizational excellence',
        'Actionable recommendations with evidence'
      ],
      estimatedTime: '2-3 minutes',
      complexity: 'Beginner',
      prerequisites: 'None - just enter your website URL'
    }
  ];

  const comingSoonAssessments = [
    {
      id: 'golden-circle',
      name: 'Golden Circle Analysis',
      status: 'testing',
      description: 'Individual Golden Circle analysis for focused strategic clarity',
      eta: 'Next week',
      icon: Brain
    },
    {
      id: 'elements-of-value',
      name: 'Elements of Value',
      status: 'testing', 
      description: 'Individual B2C and B2B value elements analysis',
      eta: 'Next week',
      icon: Brain
    },
    {
      id: 'clifton-strengths',
      name: 'CliftonStrengths Analysis',
      status: 'testing',
      description: 'Individual CliftonStrengths themes analysis',
      eta: 'Next week',
      icon: Brain
    }
  ];

  const statusBadges = {
    ready: <Badge className="bg-green-500 text-white">Ready</Badge>,
    testing: <Badge className="bg-yellow-500 text-white">Testing</Badge>,
    pending: <Badge className="bg-gray-500 text-white">Coming Soon</Badge>
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Clean Analysis Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Only working, tested features. No broken or incomplete assessments.
          </p>
        </div>

        {/* Working Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <CheckCircle className="mr-2 text-green-500" />
            Working Features
          </h2>
          
          <div className="grid gap-6">
            {workingAssessments.map((assessment) => {
              const IconComponent = assessment.icon;
              return (
                <Card key={assessment.id} className="border-green-200 bg-green-50 dark:bg-green-900/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-8 w-8 text-green-600" />
                        <div>
                          <CardTitle className="text-xl">{assessment.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            {statusBadges[assessment.status as keyof typeof statusBadges]}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {assessment.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link href={assessment.route}>
                        <Button className="bg-green-600 hover:bg-green-700">
                          Start Analysis
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4">
                      {assessment.description}
                    </CardDescription>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          What You Get:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {assessment.whatYouGet.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>⏱️ {assessment.estimatedTime}</span>
                        <span>📊 {assessment.complexity}</span>
                        <span>✅ {assessment.prerequisites}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Clock className="mr-2 text-yellow-500" />
            Coming Soon
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {comingSoonAssessments.map((assessment) => {
              const IconComponent = assessment.icon;
              return (
                <Card key={assessment.id} className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-6 w-6 text-yellow-600" />
                      <div>
                        <CardTitle className="text-lg">{assessment.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          {statusBadges[assessment.status as keyof typeof statusBadges]}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ETA: {assessment.eta}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {assessment.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Development Info */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
              <Zap className="mr-2 h-5 w-5" />
              Development Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p>✅ <strong>Main Branch:</strong> Clean, working features only</p>
              <p>🔧 <strong>Dev Branch:</strong> Broken features being fixed separately</p>
              <p>📊 <strong>Assessment Pipeline:</strong> Features move from testing → ready</p>
              <p>🚀 <strong>Deployment:</strong> Only tested features go to production</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
