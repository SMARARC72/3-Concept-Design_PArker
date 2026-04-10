import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Chrome, Facebook, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const rememberMe = watch('rememberMe');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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
  }, []);

  const onSubmit = handleSubmit(async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(data.email, data.password);
      
      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      
      // Login successful
      if (data.rememberMe) {
        localStorage.setItem('parkerjoe_remember_email', data.email);
      } else {
        localStorage.removeItem('parkerjoe_remember_email');
      }
      
      // Navigate to account or home
      navigate('/account');
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  });

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

      {/* Login Card */}
      <div
        ref={cardRef}
        className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-pj-navy mb-2">
            Welcome Back
          </h1>
          <p className="text-pj-gray text-sm">
            Sign in to your ParkerJoe account
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form ref={formRef} onSubmit={onSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-pj-charcoal font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pj-gray" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10 h-12 border-gray-200 focus:border-pj-blue focus:ring-pj-blue/20"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-pj-charcoal font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pj-gray" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
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
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  setValue('rememberMe', checked as boolean)
                }
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm text-pj-gray cursor-pointer font-normal"
              >
                Remember me
              </Label>
            </div>
            <Link
              to="/auth/forgot-password"
              className="text-sm text-pj-blue hover:text-pj-navy transition-colors font-medium"
            >
              Forgot password?
            </Link>
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
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-pj-gray">Or continue with</span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            className="h-12 border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => setError('Google login coming soon!')}
          >
            <Chrome className="w-5 h-5 mr-2 text-red-500" />
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => setError('Facebook login coming soon!')}
          >
            <Facebook className="w-5 h-5 mr-2 text-blue-600" />
            Facebook
          </Button>
        </div>

        {/* Sign Up Link */}
        <p className="mt-8 text-center text-sm text-pj-gray">
          Don&apos;t have an account?{' '}
          <Link
            to="/auth/signup"
            className="text-pj-blue hover:text-pj-navy font-medium transition-colors"
          >
            Sign up
          </Link>
        </p>
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
