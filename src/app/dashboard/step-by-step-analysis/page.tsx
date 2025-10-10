/**
 * DEPRECATED - Redirects to Phased Analysis
 * This page has been replaced with a better version
 */

import { redirect } from 'next/navigation';

export default function OldStepByStepAnalysis() {
  redirect('/dashboard/phased-analysis');
}
