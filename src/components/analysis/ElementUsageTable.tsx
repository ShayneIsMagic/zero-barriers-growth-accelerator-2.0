/**
 * Element Usage Table Component
 * One component for ALL frameworks - displays elements found by AI analysis
 */

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Element {
  name: string;
  score: number;
  evidence?: string[];
  category?: string;
  tier?: string;
  domain?: string;
}

interface ElementUsageTableProps {
  elements: Element[];
  framework:
    | 'b2c'
    | 'b2b'
    | 'golden-circle'
    | 'clifton-strengths'
    | 'archetypes'
    | 'content-comparison';
  title?: string;
  description?: string;
}

export function ElementUsageTable({
  elements,
  framework,
  title = 'Elements Found',
  description,
}: ElementUsageTableProps) {
  if (!elements || elements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            No elements found in analysis
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Sort by score (highest first)
  const sorted = [...elements].sort((a, b) => b.score - a.score);

  // Categorize elements
  const dominant = sorted.filter((e) => e.score >= 0.8);
  const supporting = sorted.filter((e) => e.score >= 0.6 && e.score < 0.8);
  const moderate = sorted.filter((e) => e.score >= 0.4 && e.score < 0.6);
  const weak = sorted.filter((e) => e.score < 0.4);

  // Get top elements (score > 0.4) for summary
  const topElements = sorted.filter((e) => e.score > 0.4);

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-blue-500';
    if (score >= 0.4) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getScoreVariant = (
    score: number
  ): 'default' | 'secondary' | 'outline' | 'destructive' => {
    if (score >= 0.8) return 'default';
    if (score >= 0.6) return 'secondary';
    if (score >= 0.4) return 'outline';
    return 'secondary';
  };

  const _getStatusLabel = (score: number): string => {
    if (score >= 0.8) return 'Dominant';
    if (score >= 0.6) return 'Supporting';
    if (score >= 0.4) return 'Moderate';
    return 'Weak';
  };

  const getStatusIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (score >= 0.6) return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    if (score >= 0.4) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-gray-400" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description ||
            `${topElements.length} of ${elements.length} elements detected (${dominant.length} dominant, ${supporting.length} supporting, ${moderate.length} moderate, ${weak.length} weak)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {dominant.length}
              </div>
              <div className="text-sm text-muted-foreground">Dominant</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {supporting.length}
              </div>
              <div className="text-sm text-muted-foreground">Supporting</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {moderate.length}
              </div>
              <div className="text-sm text-muted-foreground">Moderate</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-gray-400">
                {weak.length}
              </div>
              <div className="text-sm text-muted-foreground">Weak</div>
            </div>
          </div>

          {/* Elements Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Status</TableHead>
                  <TableHead>Element</TableHead>
                  {framework === 'b2c' || framework === 'b2b' ? (
                    <TableHead>Category</TableHead>
                  ) : null}
                  {framework === 'clifton-strengths' ? (
                    <TableHead>Domain</TableHead>
                  ) : null}
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Evidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((element, index) => (
                  <TableRow key={element.name || index}>
                    <TableCell>{getStatusIcon(element.score)}</TableCell>
                    <TableCell className="font-medium">
                      {element.name || 'Unknown'}
                    </TableCell>
                    {(framework === 'b2c' || framework === 'b2b') &&
                      element.category && (
                        <TableCell>
                          <Badge variant="outline">{element.category}</Badge>
                        </TableCell>
                      )}
                    {framework === 'clifton-strengths' && element.domain && (
                      <TableCell>
                        <Badge variant="outline">{element.domain}</Badge>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Badge variant={getScoreVariant(element.score)}>
                          {(element.score * 100).toFixed(0)}%
                        </Badge>
                        <div
                          className={`w-16 h-2 rounded-full ${getScoreColor(
                            element.score
                          )}`}
                          style={{
                            width: `${element.score * 100}%`,
                            maxWidth: '64px',
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {element.evidence && element.evidence.length > 0 ? (
                        <Badge variant="outline">
                          {element.evidence.length} found
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Top Elements Summary */}
          {topElements.length > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Top Elements</h4>
              <div className="flex flex-wrap gap-2">
                {topElements.slice(0, 10).map((element) => (
                  <Badge
                    key={element.name}
                    variant={getScoreVariant(element.score)}
                  >
                    {element.name} ({(element.score * 100).toFixed(0)}%)
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

