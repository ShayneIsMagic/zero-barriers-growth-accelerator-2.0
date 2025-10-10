/**
 * Phased Analysis Page
 * 
 * Manual control over each phase:
 * - Phase 1: Data Collection (run first)
 * - Phase 2: Framework Analysis (after reviewing Phase 1)
 * - Phase 3: Strategic Analysis (after reviewing Phase 2)
 */

import { PhasedAnalysisPage } from '@/components/analysis/PhasedAnalysisPage';

export default function PhasedAnalysisRoute() {
  return <PhasedAnalysisPage />;
}

