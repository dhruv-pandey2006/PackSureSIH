import { Mail, MapPin, ShieldCheck, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '@clerk/react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../auth/AuthContext';
import { ROLE_LABELS, getDisplayName, type UserRole } from '../auth/mockAuth';

type ProfileFormState = {
  fullName: string;
  companyName: string;
  role: string;
  phoneNumber: string;
};

type ProfileFormErrors = Partial<Record<keyof ProfileFormState, string>>;

const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'packer', label: 'Packer' },
  { value: 'importer', label: 'Importer' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'retailer', label: 'Retailer' },
  { value: 'inspector', label: 'Inspector' },
  { value: 'other', label: 'Other' },
];

function getStoredProfile(user: { unsafeMetadata?: Record<string, unknown> | null } | null | undefined) {
  const profile = ((user?.unsafeMetadata as Record<string, unknown> | undefined)?.profile as Record<string, unknown> | undefined) ?? {};

  return {
    fullName: typeof profile.fullName === 'string' ? profile.fullName : '',
    companyName: typeof profile.companyName === 'string' ? profile.companyName : '',
    role: typeof profile.role === 'string' ? profile.role : '',
    phoneNumber: typeof profile.phoneNumber === 'string' ? profile.phoneNumber : '',
  };
}

function isValidPhoneNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const digitsOnly = trimmed.replace(/\D/g, '');
  return digitsOnly.length >= 10 && /^\+?[0-9()\-\s]+$/.test(trimmed);
}

export function ProfilePage() {
  const { session } = useAuth();
  const { user, isLoaded } = useUser();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<ProfileFormState>({
    fullName: '',
    companyName: '',
    role: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<ProfileFormErrors>({});

  const profileData = getStoredProfile(user);
  const activeUser = session.user;
  const displayName = getDisplayName(activeUser);
  const companyName = profileData.companyName || activeUser?.company || 'PackSure Workspace';
  const role = (profileData.role || activeUser?.role || 'manufacturer') as UserRole;

  const openEdit = () => {
    setSubmitError('');
    setSuccessMessage('');
    setFormData({
      fullName: profileData.fullName || activeUser?.fullName || '',
      companyName: companyName,
      role: profileData.role || (activeUser?.role ?? 'manufacturer'),
      phoneNumber: profileData.phoneNumber || '',
    });
    setErrors({});
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setSubmitError('');
    setSuccessMessage('');
    setErrors({});
  };

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
      nextErrors.role = 'Please select a role.';
    }

    if (!formData.phoneNumber.trim()) {
      nextErrors.phoneNumber = 'Phone number is required.';
    } else if (!isValidPhoneNumber(formData.phoneNumber)) {
      nextErrors.phoneNumber = 'Enter a valid phone number.';
    }

    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!user) {
      setSubmitError('Your account is not available right now.');
      return;
    }

    setIsSaving(true);
    setSubmitError('');

    try {
      await user.update({
        unsafeMetadata: {
          ...(user.unsafeMetadata as Record<string, unknown> | undefined),
          profileComplete: true,
          role: formData.role,
          profile: {
            fullName: formData.fullName.trim(),
            companyName: formData.companyName.trim(),
            role: formData.role,
            phoneNumber: formData.phoneNumber.trim(),
          },
        },
      });

      setSuccessMessage('Profile updated successfully.');
      setTimeout(() => {
        closeEdit();
      }, 800);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setSubmitError('Unable to save your profile right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeUser || !isLoaded) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Profile</div>
        <h1 className="mt-2 text-4xl font-bold text-white">Your account</h1>
      </div>

      {successMessage ? (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{successMessage}</div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-cyan-200 ring-1 ring-cyan-500/20">
              <UserRound className="h-9 w-9" />
            </div>
            <div className="text-2xl font-bold text-white">{displayName}</div>
            <div className="mt-2 text-sm text-cyan-200">{ROLE_LABELS[role] ?? 'Profile'}</div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <Mail className="h-4 w-4 text-cyan-300" />
              {activeUser.email}
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
              {companyName}
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <MapPin className="h-4 w-4 text-cyan-300" />
              {profileData.phoneNumber || 'Phone not provided'}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Account overview</div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Role</div>
              <div className="mt-2 text-lg font-semibold text-white">{ROLE_LABELS[role] ?? 'Profile'}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Company</div>
              <div className="mt-2 text-lg font-semibold text-white">{companyName}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</div>
              <div className="mt-2 text-lg font-semibold text-white">Active</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Last login</div>
              <div className="mt-2 text-lg font-semibold text-white">Today</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="primary" onClick={openEdit}>Edit profile</Button>
            <Button variant="secondary">Manage access</Button>
          </div>
        </Card>
      </div>

      {isEditOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-800 bg-slate-950/80 p-6 shadow-[0_35px_90px_rgba(2,6,23,0.6)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">Profile</div>
                <h2 className="mt-2 text-2xl font-bold text-white">Edit profile</h2>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-full border border-slate-700 bg-slate-900/70 p-2 text-slate-300 transition-colors duration-[var(--transition-fast)] hover:text-white"
                aria-label="Close edit profile"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(event) => setFormData((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Enter your full name"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
                {errors.fullName ? <p className="mt-2 text-sm text-red-400">{errors.fullName}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(event) => setFormData((current) => ({ ...current, companyName: event.target.value }))}
                  placeholder="Enter your company name"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
                {errors.companyName ? <p className="mt-2 text-sm text-red-400">{errors.companyName}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">Role</label>
                <select
                  value={formData.role}
                  onChange={(event) => setFormData((current) => ({ ...current, role: event.target.value }))}
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
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(event) => setFormData((current) => ({ ...current, phoneNumber: event.target.value }))}
                  placeholder="Enter your phone number"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
                {errors.phoneNumber ? <p className="mt-2 text-sm text-red-400">{errors.phoneNumber}</p> : null}
              </div>

              {submitError ? <p className="text-sm text-red-400">{submitError}</p> : null}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={closeEdit} disabled={isSaving}>Cancel</Button>
                <Button type="button" variant="primary" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
