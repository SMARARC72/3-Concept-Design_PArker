import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const normalizedScore = Math.min(Math.floor(score / 1.2), 4);

  const strengthMap: Record<number, PasswordStrength> = {
    0: { score: 0, label: 'Too Weak', color: 'bg-red-500' },
    1: { score: 1, label: 'Weak', color: 'bg-orange-500' },
    2: { score: 2, label: 'Fair', color: 'bg-yellow-500' },
    3: { score: 3, label: 'Good', color: 'bg-blue-500' },
    4: { score: 4, label: 'Strong', color: 'bg-green-500' },
  };

  return strengthMap[normalizedScore];
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const passwordStrength = calculatePasswordStrength(password || '');

  const passwordRequirements = [
    { label: 'At least 8 characters', met: (password?.length || 0) >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password || '') },
    { label: 'One lowercase letter', met: /[a-z]/.test(password || '') },
    { label: 'One number', met: /[0-9]/.test(password || '') },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password || '') },
  ];

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      // Simulate token validation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // For demo purposes, consider any token valid except 'invalid'
      if (!token || token === 'invalid') {
        setIsValidToken(false);
      } else {
        setIsValidToken(true);
      }
    };

    validateToken();
  }, [token]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      )
        .fromTo(
          logoRef.current,
          { y: -30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.1'
        )
        .fromTo(
          cardRef.current,
          { y: 40, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.7 },
          '-=0.3'
        )
        .fromTo(
          formRef.current?.children || [],
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 },
          '-=0.4'
        );
    });

    return () => ctx.revert();
  }, [isValidToken]);

  // Animate to success state
  useEffect(() => {
    if (isSuccess) {
      gsap.fromTo(
        '.success-content',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [isSuccess]);

  const onSubmit = handleSubmit(async (_data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call to reset password
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In production, this would call your reset password API with the token
      setIsSuccess(true);
    } catch (err) {
      setError('Something went wrong. Please try again or request a new reset link.');
    } finally {
      setIsLoading(false);
    }
  });

  // Invalid or expired token state
  if (isValidToken === false) {
    return (
      <div
        ref={containerRef}
        className="min-h-screen bg-pj-cream flex flex-col items-center justify-center px-4 py-12"
      >
        {/* Logo */}
        <div ref={logoRef} className="mb-8">
          <Link to="/" className="flex flex-col items-center">
            <span className="font-display text-4xl font-semibold text-pj-navy tracking-wide">
              ParkerJoe
            </span>
            <span className="text-sm text-pj-gray mt-1 tracking-widest uppercase">
              Children&apos;s Boutique
            </span>
          </Link>
        </div>

        <div
          ref={cardRef}
          className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="font-display text-2xl text-pj-navy mb-3">
            Invalid or Expired Link
          </h1>

          <p className="text-pj-gray mb-6">
            This password reset link is invalid or has expired. Please request a new
            password reset link.
          </p>

          <Link to="/auth/forgot-password">
            <Button className="w-full h-12 bg-pj-navy hover:bg-pj-navy/90 text-white font-medium">
              Request New Link
            </Button>
          </Link>
        </div>

        <Link
          to="/"
          className="mt-8 text-sm text-pj-gray hover:text-pj-navy transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-pj-cream flex flex-col items-center justify-center px-4 py-12"
    >
      {/* Logo */}
      <div ref={logoRef} className="mb-8">
        <Link to="/" className="flex flex-col items-center">
          <span className="font-display text-4xl font-semibold text-pj-navy tracking-wide">
            ParkerJoe
          </span>
          <span className="text-sm text-pj-gray mt-1 tracking-widest uppercase">
            Children&apos;s Boutique
          </span>
        </Link>
      </div>

      {/* Reset Password Card */}
      <div
        ref={cardRef}
        className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8"
      >
        {!isSuccess ? (
          <>
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl text-pj-navy mb-2">
                Create New Password
              </h1>
              <p className="text-pj-gray text-sm">
                Enter a new password for your account
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form
              ref={formRef}
              onSubmit={onSubmit}
              className="space-y-5"
            >
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-pj-charcoal font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pj-gray" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-pj-blue focus:ring-pj-blue/20"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pj-gray hover:text-pj-navy transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                        />
                      </div>
                      <span className="text-xs text-pj-gray min-w-[60px]">
                        {passwordStrength.label}
                      </span>
                    </div>

                    {/* Password Requirements */}
                    <div className="grid grid-cols-2 gap-1">
                      {passwordRequirements.map((req) => (
                        <div
                          key={req.label}
                          className={`flex items-center gap-1 text-xs ${
                            req.met ? 'text-green-600' : 'text-pj-gray'
                          }`}
                        >
                          {req.met ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          <span>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-pj-charcoal font-medium"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pj-gray" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-pj-blue focus:ring-pj-blue/20"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pj-gray hover:text-pj-navy transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {confirmPassword && password === confirmPassword && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Passwords match
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-pj-navy hover:bg-pj-navy/90 text-white font-medium transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Updating password...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="success-content text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h2 className="font-display text-2xl text-pj-navy mb-3">
              Password Updated
            </h2>

            <p className="text-pj-gray mb-8">
              Your password has been successfully reset. You can now log in with your
              new password.
            </p>

            <Link to="/auth/login">
              <Button className="w-full h-12 bg-pj-navy hover:bg-pj-navy/90 text-white font-medium">
                Go to Login
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Back to Home */}
      <Link
        to="/"
        className="mt-8 text-sm text-pj-gray hover:text-pj-navy transition-colors"
      >
        ← Back to home
      </Link>
    </div>
  );
}
