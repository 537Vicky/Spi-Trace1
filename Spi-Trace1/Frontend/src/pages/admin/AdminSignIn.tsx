import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageTransition, fadeInUp, staggerContainer } from '@/components/animations/PageTransition';
import { Shield, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSignIn() {
  const [email, setEmail] = useState('admin@darkwatch.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Admin validation
    if (!email.endsWith('@darkwatch.com')) {
      setError('Only admin accounts can access this panel');
      setIsLoading(false);
      return;
    }

    const result = await signIn(email, password);

    if (result.success) {
      toast.success('Admin access granted!', {
        description: 'Welcome to the admin panel.',
      });
      navigate('/admin');
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
      toast.error('Sign in failed', {
        description: result.error || 'Please check your credentials and try again.',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-cyber/20 to-background items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-center max-w-md"
        >
          <div className="mb-8">
            <Shield className="w-24 h-24 text-cyber mx-auto" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Admin Control Panel</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Manage dark web links, monitor user scans, and view comprehensive breach reports from a centralized dashboard.
          </p>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <PageTransition className="w-full max-w-md">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            {/* Logo */}
            <motion.div variants={fadeInUp} className="text-center">
              <Link to="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition">
                <Shield className="w-10 h-10 text-cyber" />
                <span className="text-2xl font-bold">
                  Dark<span className="text-cyber">Watch</span>
                </span>
              </Link>
              <h1 className="text-3xl font-bold text-foreground">Admin Sign In</h1>
              <p className="text-muted-foreground mt-2">
                Access the administrative control panel
              </p>
            </motion.div>

            {/* Info Banner */}
            <motion.div variants={fadeInUp}>
              <Alert className="bg-cyber/10 border-cyber/50">
                <AlertTriangle className="h-4 w-4 text-cyber" />
                <AlertDescription className="ml-2 text-sm">
                  Admin credentials required. Only authorized administrators can access this panel.
                </AlertDescription>
              </Alert>
            </motion.div>

            {/* Error Alert */}
            {error && (
              <motion.div variants={fadeInUp}>
                <Alert className="bg-breach/10 border-breach/50">
                  <AlertTriangle className="h-4 w-4 text-breach" />
                  <AlertDescription className="ml-2 text-sm text-breach">
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Form */}
            <motion.form
              variants={fadeInUp}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">
                    Admin Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@darkwatch.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      className="pl-10 h-11"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      className="pl-10 pr-10 h-11"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full h-11 text-base bg-cyber hover:bg-cyber/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.form>



            {/* Back to Home */}
            <motion.div variants={fadeInUp} className="text-center">
              <p className="text-muted-foreground text-sm">
                Not an admin?{' '}
                <Link to="/" className="text-cyber hover:underline font-semibold">
                  Back to home
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </PageTransition>
      </div>
    </div>
  );
}
