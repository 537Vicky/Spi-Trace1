import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
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
  Zap,
  BarChart3,
  Users,
  Globe,
  TrendingUp,
  CheckCheck,
} from 'lucide-react';

const features = [
  {
    icon: Eye,
    title: 'Real-time Monitoring',
    description: 'Scan across thousands of dark web sources instantly to detect breaches',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Your data is encrypted and never stored permanently on our servers',
  },
  {
    icon: AlertTriangle,
    title: 'Instant Alerts',
    description: 'Get notified immediately when your data is found on the dark web',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Complete scans in seconds across multiple dark web marketplaces',
  },
  {
    icon: BarChart3,
    title: 'Detailed Reports',
    description: 'Comprehensive breach reports with affected websites and data types',
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Monitor thousands of dark web forums and markets worldwide',
  },
];

const stats = [
  { label: 'Active Scans', value: '10,000+' },
  { label: 'Dark Web Sources', value: '5,000+' },
  { label: 'Users Protected', value: '50,000+' },
  { label: 'Breaches Detected', value: '100,000+' },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Security Manager',
    quote: 'DarkWatch has become an essential part of our security monitoring strategy.',
    avatar: '👩‍💼',
  },
  {
    name: 'Michael Chen',
    role: 'IT Director',
    quote: 'The accuracy and speed of breach detection is unmatched in the industry.',
    avatar: '👨‍💻',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Privacy Advocate',
    quote: 'Finally, a tool that respects privacy while providing real protection.',
    avatar: '👩‍🔬',
  },
];

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } else {
      navigate('/signin');
    }
  };

  return (
    <PageTransition>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Shield className="w-8 h-8 text-cyber" />
            <span className="text-xl font-bold">
              Dark<span className="text-cyber">Watch</span>
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition">
              Features
            </a>
            <a href="#stats" className="text-muted-foreground hover:text-foreground transition">
              Stats
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition">
              Testimonials
            </a>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
            {!isAuthenticated && (
              <>
                <Button variant="outline" onClick={() => navigate('/signin')}>
                  Client Sign In
                </Button>
                <Button onClick={() => navigate('/admin/signin')} className="bg-cyber hover:bg-cyber/90">
                  Admin Portal
                </Button>
              </>
            )}
            {isAuthenticated && (
              <Button onClick={handleGetStarted} className="bg-cyber hover:bg-cyber/90">
                {user?.role === 'admin' ? 'Admin Dashboard' : 'Start Scanning'}
              </Button>
            )}
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-cyber/5 pt-32 pb-20 lg:pt-48 lg:pb-32">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyber/5 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyber/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyber/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-5xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber/20 text-cyber text-sm font-medium border border-cyber/30">
                <Sparkles className="w-4 h-4" />
                Trusted by 50,000+ users worldwide
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
            >
              Protect Your Identity on the{' '}
              <span className="bg-gradient-to-r from-cyber via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Dark Web
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Monitor thousands of dark web sources in real-time. Get instant alerts when your
              email, passwords, or personal information appears on breached databases.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
              onClick={() => navigate('/signup')}
              size="lg"
              className="bg-cyber hover:bg-cyber/90 text-white px-8 h-12 text-lg"
              >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 h-12 text-lg border-cyber/50 hover:bg-cyber/10"
              >
                Learn More
              </Button>
            </motion.div>

            {/* Hero Image/Mockup */}
            <motion.div
              variants={fadeInUp}
              className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur p-8 shadow-2xl"
            >
              <div className="aspect-video bg-gradient-to-br from-cyber/20 to-background rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Search className="w-16 h-16 text-cyber/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Advanced Dark Web Scanning Interface</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 lg:py-32 border-y border-border">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="text-center p-6 rounded-lg bg-card/50 border border-border/50 hover:border-cyber/50 transition"
              >
                <div className="text-3xl md:text-4xl font-bold text-cyber mb-2">{stat.value}</div>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold mb-4">
              Powerful Features
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to stay protected from dark web threats
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  className="p-8 rounded-lg border border-border/50 bg-card/50 hover:border-cyber/50 hover:bg-card transition group"
                >
                  <Icon className="w-12 h-12 text-cyber mb-4 group-hover:scale-110 transition" />
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold mb-16 text-center">
              How It Works
            </motion.h2>

            <motion.div
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              {[
                {
                  num: '1',
                  title: 'Add Keywords',
                  desc: 'Enter your email, phone, or personal information',
                },
                {
                  num: '2',
                  title: 'Scan Dark Web',
                  desc: 'We scan thousands of dark web sources instantly',
                },
                {
                  num: '3',
                  title: 'Get Results',
                  desc: 'Receive detailed reports on any breaches found',
                },
              ].map((step) => (
                <motion.div
                  key={step.num}
                  variants={fadeInUp}
                  className="relative text-center p-8"
                >
                  <div className="w-16 h-16 rounded-full bg-cyber/20 border-2 border-cyber flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-cyber">{step.num}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                  {parseInt(step.num) < 3 && (
                    <div className="hidden md:flex absolute top-1/4 right-0 transform translate-x-1/2">
                      <ArrowRight className="w-6 h-6 text-cyber/30" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold mb-16 text-center">
              What Our Users Say
            </motion.h2>

            <motion.div
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-8"
            >
              {testimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.name}
                  variants={fadeInUp}
                  className="p-8 rounded-lg border border-border/50 bg-card/50 hover:border-cyber/50 transition"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{testimonial.avatar}</div>
                    <div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                  <div className="flex gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-cyber">★</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-cyber/10 to-blue-500/10 border-y border-border">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold mb-6">
              Start Protecting Your Identity Today
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground mb-8"
            >
              Join thousands of users who trust DarkWatch to monitor their digital security
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Button
                onClick={() => navigate('/signup')}
                size="lg"
                className="bg-cyber hover:bg-cyber/90 text-white px-8 h-12 text-lg"
              >
                Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-4 gap-8 mb-12"
          >
            <motion.div variants={fadeInUp}>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition">Security</a></li>
              </ul>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition">About</a></li>
                <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition">Cookies</a></li>
              </ul>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <div className="flex gap-4 text-muted-foreground">
                <a href="#" className="hover:text-cyber transition">Twitter</a>
                <a href="#" className="hover:text-cyber transition">LinkedIn</a>
                <a href="#" className="hover:text-cyber transition">GitHub</a>
              </div>
            </motion.div>
          </motion.div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-muted-foreground text-sm">
            <p>&copy; 2026 DarkWatch. All rights reserved.</p>
            <p>Protecting your digital identity since 2026</p>
          </div>
        </div>
      </footer>
    </PageTransition>
  );
}
