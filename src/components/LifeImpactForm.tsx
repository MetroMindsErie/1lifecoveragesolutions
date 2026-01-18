import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Loader2, AlertCircle } from 'lucide-react';
import { Logo } from './Logo';

export interface FormData {
  email: string;
  ageRange?: string;
  maritalStatus?: string;
}

interface LifeImpactFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export function LifeImpactForm({ onSubmit, isLoading = false, error }: LifeImpactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    ageRange: undefined,
    maritalStatus: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) return;
    await onSubmit(formData);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-lg shadow-lg p-8 border border-red-100">
        <div className="flex items-center gap-4 mb-6">
          <Logo size="sm" showText={false} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Life Impact Map™</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <Heart className="w-4 h-4 text-red-600" />
              <span>Powered by 1Life Coverage</span>
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-2">
          Understand who's financially impacted if something happens to you.
        </p>
        <p className="text-sm text-gray-500 mb-6 italic">
          All insights shown are estimates based on public and inferred data. This is not financial advice.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              required
            />
            <p className="text-xs text-gray-500 mt-1">We'll use this to find your professional profile.</p>
          </div>

          {/* Age Range (Optional) */}
          <div>
            <label htmlFor="ageRange" className="block text-sm font-semibold text-gray-700 mb-2">
              Age Range <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>
            <select
              id="ageRange"
              value={formData.ageRange || ''}
              onChange={(e) => handleChange('ageRange', e.target.value || '')}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
            >
              <option value="">Select age range...</option>
              <option value="18-29">18–29</option>
              <option value="30-39">30–39</option>
              <option value="40-49">40–49</option>
              <option value="50-59">50–59</option>
              <option value="60-69">60–69</option>
              <option value="70+">70+</option>
            </select>
          </div>

          {/* Marital Status (Optional) */}
          <div>
            <label htmlFor="maritalStatus" className="block text-sm font-semibold text-gray-700 mb-2">
              Marital Status <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>
            <select
              id="maritalStatus"
              value={formData.maritalStatus || ''}
              onChange={(e) => handleChange('maritalStatus', e.target.value || '')}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
            >
              <option value="">Select marital status...</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Helps us better estimate your dependents.</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !formData.email.trim()}
            className="w-full px-6 py-3 !bg-red-600 hover:!bg-red-700 disabled:!bg-gray-400 !text-white font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Generate My Impact Map'
            )}
          </button>

          {/* Privacy Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            We don't store your email. Results are generated in real-time and discarded.
          </p>
        </form>
      </div>
    </motion.div>
  );
}
