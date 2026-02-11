import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useScan, ScanResult } from '@/contexts/ScanContext';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { PageTransition, fadeInUp, staggerContainer } from '@/components/animations/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Globe,
  Filter,
  History as HistoryIcon,
} from 'lucide-react';

export default function History() {
  const { user } = useAuth();
  const { scanHistory } = useScan();
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'breached'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter history for current user
  const userHistory = scanHistory.filter((scan) => scan.userId === user?.id);

  // Apply filters
  const filteredHistory = userHistory.filter((scan) => {
    const matchesStatus = statusFilter === 'all' || scan.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      scan.keywords.some((kw) =>
        kw.value.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      scan.breachedSites?.some((site) =>
        site.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesStatus && matchesSearch;
  });

  return (
    <ClientLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            {/* Header */}
            <motion.div variants={fadeInUp}>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Scan History
              </h1>
              <p className="text-muted-foreground">
                View all your previous dark web scans
              </p>
            </motion.div>

            {/* Filters */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by keyword or site..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="safe">Safe Only</SelectItem>
                  <SelectItem value="breached">Breached Only</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Results */}
            <motion.div variants={fadeInUp}>
              {filteredHistory.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                  <HistoryIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Scans Found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {userHistory.length === 0
                      ? "You haven't performed any scans yet."
                      : 'No scans match your current filters.'}
                  </p>
                  {userHistory.length === 0 && (
                    <Button variant="cyber" onClick={() => window.location.href = '/'}>
                      Start Your First Scan
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Keywords</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Breached Sites</TableHead>
                          <TableHead className="text-right">Duration</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHistory.map((scan, index) => (
                          <motion.tr
                            key={scan.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group"
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>
                                  {format(new Date(scan.scannedAt), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {format(new Date(scan.scannedAt), 'h:mm a')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {scan.keywords.slice(0, 3).map((kw) => (
                                  <span
                                    key={kw.id}
                                    className="px-2 py-0.5 bg-muted rounded text-xs"
                                  >
                                    {kw.type === 'password'
                                      ? '••••'
                                      : kw.value.length > 15
                                      ? `${kw.value.slice(0, 15)}...`
                                      : kw.value}
                                  </span>
                                ))}
                                {scan.keywords.length > 3 && (
                                  <span className="px-2 py-0.5 bg-muted rounded text-xs">
                                    +{scan.keywords.length - 3}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {scan.status === 'safe' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-safe/10 text-safe rounded-full text-sm font-medium">
                                  <ShieldCheck className="w-4 h-4" />
                                  Safe
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-breach/10 text-breach rounded-full text-sm font-medium">
                                  <ShieldAlert className="w-4 h-4" />
                                  Breached
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {scan.breachedSites && scan.breachedSites.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {scan.breachedSites.map((site) => (
                                    <span
                                      key={site}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-breach/10 text-breach rounded text-xs"
                                    >
                                      <Globe className="w-3 h-3" />
                                      {site}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  None
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{scan.scanDuration}s</span>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {filteredHistory.map((scan, index) => (
                      <motion.div
                        key={scan.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border ${
                          scan.status === 'breached'
                            ? 'bg-breach/5 border-breach/20'
                            : 'bg-card border-border'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {format(new Date(scan.scannedAt), 'MMM d, yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(scan.scannedAt), 'h:mm a')}
                            </p>
                          </div>
                          {scan.status === 'safe' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-safe/10 text-safe rounded-full text-xs font-medium">
                              <ShieldCheck className="w-3 h-3" />
                              Safe
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-breach/10 text-breach rounded-full text-xs font-medium">
                              <ShieldAlert className="w-3 h-3" />
                              Breached
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {scan.keywords.map((kw) => (
                            <span
                              key={kw.id}
                              className="px-2 py-0.5 bg-muted rounded text-xs"
                            >
                              {kw.type === 'password'
                                ? '••••'
                                : kw.value.length > 20
                                ? `${kw.value.slice(0, 20)}...`
                                : kw.value}
                            </span>
                          ))}
                        </div>

                        {scan.breachedSites && scan.breachedSites.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {scan.breachedSites.map((site) => (
                              <span
                                key={site}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-breach/10 text-breach rounded text-xs"
                              >
                                <Globe className="w-3 h-3" />
                                {site}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </PageTransition>
    </ClientLayout>
  );
}
