import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useScan } from '@/contexts/ScanContext';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { Button } from '@/components/ui/button';
import { KeywordInput } from '@/components/scan/KeywordInput';
import { PageTransition, fadeInUp, staggerContainer } from '@/components/animations/PageTransition';
import {
  Shield,
  Search,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: Eye,
    title: 'Real-time Monitoring',
    description: 'Scan across thousands of dark web sources instantly',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Your data is encrypted and never stored permanently',
  },
  {
    icon: AlertTriangle,
    title: 'Instant Alerts',
    description: 'Get notified immediately when your data is found',
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { keywords, addKeyword, removeKeyword } = useScan();
  const navigate = useNavigate();

  const handleScan = () => {
    if (keywords.length === 0) {
      return;
    }
    navigate('/dashboard');
  };

  return (
    <ClientLayout>
      <PageTransition>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background py-20 lg:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyber/5 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyber/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber/20 text-cyber text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Trusted by 10,000+ users worldwide
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Check if Your Data is{' '}
              <span className="text-cyber">Leaked</span> on the Dark Web
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            >
              Scan your email, passwords, phone numbers, and more across
              thousands of dark web sources to protect your digital identity.
            </motion.p>

            {/* Keyword Input */}
            <motion.div
              variants={fadeInUp}
              className="bg-card rounded-2xl p-6 md:p-8 shadow-xl max-w-2xl mx-auto"
            >
              <KeywordInput
                keywords={keywords}
                onAddKeyword={addKeyword}
                onRemoveKeyword={removeKeyword}
              />

              <Button
                onClick={handleScan}
                variant="hero"
                size="xl"
                className="w-full mt-6"
                disabled={keywords.length === 0}
              >
                <Search className="w-5 h-5" />
                Scan Now
                <ArrowRight className="w-5 h-5" />
              </Button>

              {!isAuthenticated && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  <button
                    onClick={() => navigate('/signin')}
                    className="text-cyber hover:underline"
                  >
                    Sign in
                  </button>{' '}
                  to save your scan history
                </p>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose DarkWatch?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Advanced dark web monitoring to keep your personal data safe
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-6 border border-border shadow-md hover-lift"
                >
                  <div className="w-12 h-12 rounded-lg bg-cyber/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-cyber" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: '50K+', label: 'Dark Web Sources' },
              { value: '1M+', label: 'Scans Completed' },
              { value: '24/7', label: 'Monitoring' },
              { value: '99.9%', label: 'Accuracy Rate' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-cyber mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Shield className="w-16 h-16 text-cyber mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Your Digital Security Matters
            </h2>
            <p className="text-muted-foreground mb-8">
              Monitor your digital security with real-time dark web scanning and instant breach alerts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/history')}
                variant="outline"
                size="lg"
              >
                View Your History
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      </PageTransition>
    </ClientLayout>
  );
}
