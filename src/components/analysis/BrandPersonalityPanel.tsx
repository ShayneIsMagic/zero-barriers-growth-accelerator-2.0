'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  getPersonalitySignalLabel,
  type PersonalityProfile,
  type PersonalityTension,
} from '@/lib/framework/brand-personality';
import { AlertTriangle, Sparkles, Users } from 'lucide-react';

interface BrandPersonalityPanelProps {
  profile: PersonalityProfile | null | undefined;
}

export function BrandPersonalityPanel({ profile }: BrandPersonalityPanelProps) {
  if (!profile) {
    return null;
  }

  const isWarning =
    profile.signalType === 'conflicting_signals' ||
    profile.signalType === 'multi_dominant' ||
    profile.signalType === 'undefined_identity' ||
    profile.signalType === 'generic_messaging';

  return (
    <section className="space-y-4 rounded-lg border bg-muted/40 p-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950">
          {profile.framework === 'brand-archetypes' ? (
            <Sparkles className="h-5 w-5 text-purple-600" />
          ) : (
            <Users className="h-5 w-5 text-purple-600" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-semibold">Site personality</h4>
            <Badge variant={isWarning ? 'destructive' : 'default'}>
              {getPersonalitySignalLabel(profile.signalType)}
            </Badge>
            <Badge variant="outline">
              Coherence {Math.round(profile.coherenceScore * 100)}%
            </Badge>
          </div>
          <p className="text-lg font-medium">{profile.headline}</p>
          <p className="text-sm text-muted-foreground">{profile.summary}</p>
        </div>
      </div>

      {profile.dominantLabels.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Dominant signals
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.dominantLabels.map((label) => (
              <Badge key={label} variant="secondary">
                {label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {profile.supportingLabels.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {profile.framework === 'brand-archetypes'
              ? 'Weak or absent signals'
              : 'Leading domains'}
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.supportingLabels.map((label) => (
              <Badge key={label} variant="outline">
                {label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {profile.tensions.length > 0 && (
        <Alert variant={profile.signalType === 'conflicting_signals' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {profile.tensions.length === 1
              ? 'Personality tension detected'
              : `${profile.tensions.length} personality tensions detected`}
          </AlertTitle>
          <AlertDescription className="space-y-2">
            {profile.tensions.map((tension) => (
              <TensionRow key={`${tension.itemA}-${tension.itemB}`} tension={tension} />
            ))}
          </AlertDescription>
        </Alert>
      )}
    </section>
  );
}

interface TensionRowProps {
  tension: PersonalityTension;
}

function TensionRow({ tension }: TensionRowProps) {
  return (
    <div className="rounded-md border bg-background/80 p-2 text-sm">
      <p className="font-medium">
        {tension.labelA} ({tension.scoreA.toFixed(2)}) vs{' '}
        {tension.labelB} ({tension.scoreB.toFixed(2)})
      </p>
      <p className="text-xs text-muted-foreground">{tension.reason}</p>
    </div>
  );
}
