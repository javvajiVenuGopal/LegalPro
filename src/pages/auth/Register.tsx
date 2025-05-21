import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Scale, Lock, Mail, User, Phone, Briefcase } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { UserRole } from '../../types';

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  profilePicture?: FileList;
  specialization?: string;
  license?: string;
  firm?: string;
  terms: boolean;
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  // Update the destructured name
const { register: registerUser, isAuthenticated, user } = useAuthStore();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>({
    defaultValues: {
      role: 'client',
      terms: false
    }
  });

  const password = watch('password');

  if (isAuthenticated && user) {
    const redirectPath = user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard';
    console.log('Authenticated user role:', user.role);
    console.log('Redirecting to:', redirectPath);
    return <Navigate to={redirectPath} />;
  }

  const onSubmit = async (data: RegisterFormData) => {
  setError(null);
  setIsLoading(true);

  try {
    const {
      confirmPassword,
      profilePicture,
      terms,
      name,
      password,
      email,
      phone,
      specialization,
      license,
      firm,
    } = data;

    const formData = new FormData();

    // Required fields
    formData.append('username', name); // Django uses 'username' instead of 'name'
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirm_password', confirmPassword);
    formData.append('terms', terms ? '1' : '0');
    formData.append('phone', phone);
    // Make sure the role is correctly set in the form data
    formData.append('role', selectedRole);
    console.log('Role being sent to backend:', selectedRole);

    // Lawyer-specific fields
    if (selectedRole === 'lawyer') {
      if (specialization) formData.append('specialization', specialization);
      if (license) formData.append('license', license);
      // 'firm' is optional, but send empty string if not provided to avoid backend errors
      formData.append('firm', firm || '');
    } else {
      // For client, ensure these fields are empty to avoid backend validation errors
      formData.append('specialization', '');
      formData.append('license', '');
      formData.append('firm', '');
    }

    // Avatar upload (must use 'avatar', not 'profilePicture')
    if (profilePicture?.length) {
      const file = profilePicture[0];
      if (file.size > 2_000_000) {
        setError('Profile picture must be less than 2MB.');
        setIsLoading(false);
        return;
      }
      formData.append('avatar', file);
    }

    // Debug: show FormData contents
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    // Register the user
    await registerUser(formData);
    
    // Get the current role from the store after registration
    const currentUser = useAuthStore.getState().user;
    const userRole = currentUser?.role || selectedRole;
    
    console.log('User after registration:', currentUser);
    console.log('Role for navigation:', userRole);
    
    // Navigate based on the role
    if (userRole === 'lawyer') {
      console.log('Navigating to lawyer dashboard');
      navigate('/lawyer/dashboard');
    } else {
      console.log('Navigating to client dashboard');
      navigate('/client/dashboard');
    }
  } catch (err: any) {
    console.error(err);
    setError('Registration failed. Please check your inputs and try again.');
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
            <Scale className="h-10 w-10 text-primary-800" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 rounded-md bg-error-50 p-4 text-sm text-error-700">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-6">
            <span className="text-sm font-medium text-gray-700">I am a:</span>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(['client', 'lawyer'] as UserRole[]).map(role => (
                <div
                  key={role}
                  className={`relative flex cursor-pointer rounded-lg border ${
                    selectedRole === role
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-300 bg-white'
                  } p-4 shadow-sm`}
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center text-sm">
                      {role === 'client' ? (
                        <User size={18} className={selectedRole === role ? 'text-primary-600' : 'text-gray-500'} />
                      ) : (
                        <Briefcase size={18} className={selectedRole === role ? 'text-primary-600' : 'text-gray-500'} />
                      )}
                      <p className={`ml-2 font-medium ${selectedRole === role ? 'text-primary-900' : 'text-gray-900'}`}>
                        {role === 'client' ? 'Client' : 'Lawyer'}
                      </p>
                    </div>
                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                      selectedRole === role ? 'border-primary-600 bg-primary-600' : 'border-gray-300 bg-white'
                    }`}>
                      {selectedRole === role && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <input
                    type="radio"
                    className="sr-only"
                    value={role}
                    {...register('role')}
                    checked={selectedRole === role}
                    onChange={() => setSelectedRole(role)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className="pl-10 block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 shadow-sm py-2 px-3 border"
                  placeholder="John Doe"
                  {...register('name', { required: 'Full name is required' })}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="pl-10 block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 shadow-sm py-2 px-3 border"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>}
            </div>

            {/* Profile Picture */}
            <div>
              <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">Profile Picture</label>
              <div className="mt-1">
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  {...register('profilePicture')}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="(123) 456-7890"
                  className="pl-10 block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 shadow-sm py-2 px-3 border"
                  {...register('phone', { required: 'Phone number is required' })}
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-error-600">{errors.phone.message}</p>}
            </div>

            {/* Lawyer Fields */}
            {selectedRole === 'lawyer' && (
              <>
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">Specialization</label>
                  <input
                    id="specialization"
                    type="text"
                    placeholder="e.g., Family Law"
                    className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 shadow-sm py-2 px-3 border"
                    {...register('specialization', {
                      required: 'Specialization is required',
                    })}
                  />
                  {errors.specialization && <p className="mt-1 text-sm text-error-600">{errors.specialization.message}</p>}
                </div>

                <div>
                  <label htmlFor="license" className="block text-sm font-medium text-gray-700">License Number</label>
                  <input
                    id="license"
                    type="text"
                    placeholder="e.g., NY123456"
                    className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 shadow-sm py-2 px-3 border"
                    {...register('license', {
                      required: 'License number is required',
                    })}
                  />
                  {errors.license && <p className="mt-1 text-sm text-error-600">{errors.license.message}</p>}
                </div>

                <div>
                  <label htmlFor="firm" className="block text-sm font-medium text-gray-700">Law Firm (optional)</label>
                  <input
                    id="firm"
                    type="text"
                    placeholder="e.g., Smith & Associates"
                    className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 shadow-sm py-2 px-3 border"
                    {...register('firm')}
                  />
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 shadow-sm py-2 px-3 border"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
              />
              {errors.password && <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 shadow-sm py-2 px-3 border"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                {...register('terms', { required: 'You must agree to the terms' })}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && <p className="mt-1 text-sm text-error-600">{errors.terms.message}</p>}

            {/* Submit */}
            <div>
              <Button type="submit" fullWidth isLoading={isLoading}>
                {selectedRole === 'lawyer' ? 'Register as a Lawyer' : 'Register as a Client'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
