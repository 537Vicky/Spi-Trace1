import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useScan } from '@/contexts/ScanContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { PageTransition, fadeInUp, staggerContainer } from '@/components/animations/PageTransition';
import {
  Shield,
  Users,
  Globe,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Activity,
} from 'lucide-react';

export default function AdminDashboard() {
  const { scanHistory, darkWebLinks } = useScan();

  const stats = [
    {
      label: 'Total Scans',
      value: scanHistory.length,
      icon: Activity,
      color: 'text-cyber',
      bg: 'bg-cyber/10',
    },
    {
      label: 'Breaches Found',
      value: scanHistory.filter((s) => s.status === 'breached').length,
      icon: ShieldAlert,
      color: 'text-breach',
      bg: 'bg-breach/10',
    },
    {
      label: 'Safe Scans',
      value: scanHistory.filter((s) => s.status === 'safe').length,
      icon: ShieldCheck,
      color: 'text-safe',
      bg: 'bg-safe/10',
    },
    {
      label: 'Active Sources',
      value: darkWebLinks.filter((l) => l.status === 'enabled').length,
      icon: Globe,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ];

  const recentScans = scanHistory.slice(0, 5);

  return (
    <AdminLayout>
      <PageTransition>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={fadeInUp}>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Overview of your dark web monitoring platform
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl border border-border p-6 hover-lift"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <TrendingUp className="w-5 h-5 text-safe" />
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={fadeInUp}>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">
                  Recent Scans
                </h2>
              </div>
              <div className="divide-y divide-border">
                {recentScans.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No scans recorded yet
                  </div>
                ) : (
                  recentScans.map((scan) => (
                    <div
                      key={scan.id}
                      className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            scan.status === 'breached'
                              ? 'bg-breach/10'
                              : 'bg-safe/10'
                          }`}
                        >
                          {scan.status === 'breached' ? (
                            <ShieldAlert className="w-5 h-5 text-breach" />
                          ) : (
                            <ShieldCheck className="w-5 h-5 text-safe" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {scan.userEmail || 'Anonymous User'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {scan.keywords.length} keyword
                            {scan.keywords.length > 1 ? 's' : ''} scanned
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${
                            scan.status === 'breached'
                              ? 'text-breach'
                              : 'text-safe'
                          }`}
                        >
                          {scan.status === 'breached' ? 'Breach Found' : 'Safe'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(scan.scannedAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeInUp} className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyber/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-cyber" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Manage Dark Web Sources
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add or remove scanning sources
                  </p>
                </div>
              </div>
              <a
                href="/admin/links"
                className="text-cyber text-sm font-medium hover:underline"
              >
                Go to Links Management →
              </a>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    View All Scan History
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Browse all user scans
                  </p>
                </div>
              </div>
              <a
                href="/admin/history"
                className="text-cyber text-sm font-medium hover:underline"
              >
                View History →
              </a>
            </div>
          </motion.div>
        </motion.div>
      </PageTransition>
    </AdminLayout>
  );
}
