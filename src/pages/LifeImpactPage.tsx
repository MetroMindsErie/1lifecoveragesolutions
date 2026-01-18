import { useState } from 'react';
import { LifeImpactForm, type FormData } from '../components/LifeImpactForm';
import { LifeImpactResults } from '../components/LifeImpactResults';
import LoadingOverlay from '../components/LoadingOverlay';
import { ImpactMap } from '../lib/inference';

export function LifeImpactPage() {
  const [currentStep, setCurrentStep] = useState<'form' | 'results'>('form');
  const [impactMap, setImpactMap] = useState<ImpactMap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError('');

    try {
      // Call the enrichment API (server-side FullEnrich) then infer impact map client-side
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const rawText = await response.text();
      let parsed: any = null;
      try {
        parsed = rawText ? JSON.parse(rawText) : null;
      } catch {
        parsed = null;
      }

      if (!response.ok) {
        const message =
          (parsed && (parsed.error || parsed.message)) ||
          `Request failed (${response.status})`;
        throw new Error(message);
      }

      const { data: profile } = (parsed || {}) as { data?: any };
      if (!profile) {
        throw new Error('Enrichment succeeded but no profile was returned');
      }

      const inferred = await import('../lib/inference').then((m) =>
        m.inferImpactMap(profile, formData.ageRange, formData.maritalStatus)
      );

      console.log('[PAGE] Impact map inferred:', inferred);

      setImpactMap(inferred || null);
      setCurrentStep('results');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      console.error('[PAGE] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep('form');
    setImpactMap(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <LoadingOverlay
        open={isLoading}
        accent="brand"
        title="Generating your Life Impact Map™"
        message="Enriching your profile and calculating coverage…"
      />
      <div className="max-w-6xl mx-auto">
        {currentStep === 'form' ? (
          <LifeImpactForm
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            error={error}
          />
        ) : impactMap ? (
          <LifeImpactResults
            impactMap={impactMap}
            onBack={handleBack}
          />
        ) : null}
      </div>
    </div>
  );
}

export default LifeImpactPage;
