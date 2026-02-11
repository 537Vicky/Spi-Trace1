import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageTransition, fadeInUp, staggerContainer } from '@/components/animations/PageTransition';
import { Shield, Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await forgotPassword(email);

    if (result.success) {
      setIsSubmitted(true);
      toast.success('Reset link sent!', {
        description: 'Check your email for password reset instructions.',
      });
    } else {
      toast.error('Failed to send reset link', {
        description: result.error || 'Please try again.',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <PageTransition className="w-full max-w-lg">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Logo */}
          <motion.div variants={fadeInUp} className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <Shield className="w-10 h-10 text-cyber" />
              <span className="text-2xl font-bold">
                Dark<span className="text-cyber">Watch</span>
              </span>
            </Link>
          </motion.div>

          {isSubmitted ? (
            <motion.div
              variants={fadeInUp}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-safe/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-safe" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Check your email
                </h1>
                <p className="text-muted-foreground">
                  We've sent a password reset link to{' '}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-cyber hover:underline"
                >
                  try again
                </button>
              </p>
              <Link to="/signin">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div variants={fadeInUp} className="text-center">
                <h1 className="text-3xl font-bold text-foreground">
                  Forgot password?
                </h1>
                <p className="text-muted-foreground mt-2">
                  No worries, we'll send you reset instructions.
                </p>
              </motion.div>

              <motion.form
                variants={fadeInUp}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </motion.form>

              <motion.div variants={fadeInUp} className="text-center">
                <Link
                  to="/signin"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </PageTransition>
    </div>
  );
}
