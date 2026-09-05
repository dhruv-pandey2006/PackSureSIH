import { ShieldCheck } from 'lucide-react';
import { useUser } from '@clerk/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type ProfileRole = 'manufacturer' | 'packer' | 'importer' | 'distributor' | 'retailer' | 'inspector' | 'other';

type ProfileFormState = {
  fullName: string;
  companyName: string;
  role: string;
  phoneNumber: string;
};

type ProfileFormErrors = Partial<Record<keyof ProfileFormState, string>>;

const roleOptions: Array<{ value: ProfileRole; label: string }> = [
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'packer', label: 'Packer' },
  { value: 'importer', label: 'Importer' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'retailer', label: 'Retailer' },
  { value: 'inspector', label: 'Inspector' },
  { value: 'other', label: 'Other' },
];

function isValidPhoneNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const digitsOnly = trimmed.replace(/\D/g, '');
  return digitsOnly.length >= 10 && /^\+?[0-9()\-\s]+$/.test(trimmed);
}

export function CompleteProfilePage() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();
  const [formData, setFormData] = useState<ProfileFormState>({
    fullName: '',
    companyName: '',
    role: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileComplete = Boolean((user?.unsafeMetadata as Record<string, unknown> | undefined)?.profileComplete);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      navigate('/sign-in', { replace: true });
      return;
    }

    if (profileComplete) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const savedProfile = ((user?.unsafeMetadata as Record<string, unknown> | undefined)?.profile as Record<string, unknown> | undefined) ?? {};
    setFormData({
      fullName: typeof savedProfile.fullName === 'string' ? savedProfile.fullName : '',
      companyName: typeof savedProfile.companyName === 'string' ? savedProfile.companyName : '',
      role: typeof savedProfile.role === 'string' ? savedProfile.role : '',
      phoneNumber: typeof savedProfile.phoneNumber === 'string' ? savedProfile.phoneNumber : '',
    });
  }, [isLoaded, isSignedIn, profileComplete, user, navigate]);

  const validateForm = () => {
    const nextErrors: ProfileFormErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    } else if (formData.fullName.trim().length < 2) {
      nextErrors.fullName = 'Full name must be at least 2 characters.';
    }

    if (!formData.companyName.trim()) {
      nextErrors.companyName = 'Company name is required.';
    } else if (formData.companyName.trim().length < 2) {
      nextErrors.companyName = 'Company name must be at least 2 characters.';
    }

    if (!formData.role) {
      nextErrors.role = 'Please select your role.';
    }

    if (!formData.phoneNumber.trim()) {
      nextErrors.phoneNumber = 'Phone number is required.';
    } else if (!isValidPhoneNumber(formData.phoneNumber)) {
      nextErrors.phoneNumber = 'Enter a valid phone number.';
    }

    return nextErrors;
  };

  const handleInputChange = (field: keyof ProfileFormState, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!user) {
      setSubmitError('Your account info is not available yet. Please try again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await user.update({
        unsafeMetadata: {
          ...(user.unsafeMetadata as Record<string, unknown> | undefined),
          profileComplete: true,
          profile: {
            fullName: formData.fullName.trim(),
            companyName: formData.companyName.trim(),
            role: formData.role,
            phoneNumber: formData.phoneNumber.trim(),
          },
        },
      });

      await user.reload();
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSubmitError('Unable to save your profile right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-180px)] w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl rounded-[28px] border border-slate-800 bg-slate-950/60 shadow-[0_35px_90px_rgba(2,6,23,0.55)] backdrop-blur-[14px]">
        <div className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_28%),linear-gradient(135deg,#020817_0%,#0f172a_52%,#0b1120_100%)] p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_26%)]" />

          <div className="relative">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-slate-950 shadow-[0_12px_25px_rgba(59,130,246,0.28)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">PackSure</div>
                <div className="text-[9px] uppercase tracking-[0.22em] text-slate-400">Profile setup</div>
              </div>
            </div>

            <div className="mb-8">
              <div className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">Complete Your Profile</div>
              <h1 className="mt-3 text-3xl font-bold text-white">Complete Your Profile</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">Tell us a little about yourself to personalize your PackSure experience.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="fullName" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(event) => handleInputChange('fullName', event.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
                {errors.fullName ? <p className="mt-2 text-sm text-red-400">{errors.fullName}</p> : null}
              </div>

              <div>
                <label htmlFor="companyName" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Company Name</label>
                <input
                  id="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(event) => handleInputChange('companyName', event.target.value)}
                  placeholder="Enter your company name"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
                {errors.companyName ? <p className="mt-2 text-sm text-red-400">{errors.companyName}</p> : null}
              </div>

              <div>
                <label htmlFor="role" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Role</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(event) => handleInputChange('role', event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="" className="bg-slate-900 text-slate-300">Select a role</option>
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-slate-900 text-slate-200">
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.role ? <p className="mt-2 text-sm text-red-400">{errors.role}</p> : null}
              </div>

              <div>
                <label htmlFor="phoneNumber" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Phone Number</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(event) => handleInputChange('phoneNumber', event.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
                {errors.phoneNumber ? <p className="mt-2 text-sm text-red-400">{errors.phoneNumber}</p> : null}
              </div>

              {submitError ? <p className="text-sm text-red-400">{submitError}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-5 py-3 text-base font-semibold text-slate-950 shadow-[0_18px_30px_rgba(59,130,246,0.32)] transition-all duration-[var(--transition-normal)] ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-y-[-1px] hover:shadow-[0_20px_35px_rgba(59,130,246,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Saving Profile...' : 'Complete Profile →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
