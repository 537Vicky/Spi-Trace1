import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { useScan } from '@/contexts/ScanContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { PageTransition, fadeInUp, staggerContainer } from '@/components/animations/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Search,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Globe,
  Filter,
  User,
  Mail,
  Download,
  History,
  AlertTriangle,
  X,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface FilterState {
  status: 'all' | 'safe' | 'breached';
  user: string;
  startDate: string;
  endDate: string;
  keyword: string;
}

export default function AdminHistory() {
  const { getAllScanHistory } = useScan();
  const allHistory = getAllScanHistory();

  const [renderError, setRenderError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    user: '',
    startDate: '',
    endDate: '',
    keyword: '',
  });
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Apply filters with defensive checks to avoid runtime crashes
  let filteredHistory = [] as typeof allHistory;
  try {
    filteredHistory = allHistory.filter((scan) => {
      // Status filter
      if (filters.status !== 'all' && scan.status !== filters.status) return false;

      // User filter
      if (filters.user && filters.user !== '__all__' && !(scan.userEmail || '').toLowerCase().includes(filters.user.toLowerCase())) return false;

      // Keyword filter
      if (filters.keyword) {
        const kwList = Array.isArray(scan.keywords) ? scan.keywords : [];
        const breachedList = Array.isArray(scan.breachedSites) ? scan.breachedSites : [];

        const keywordFound =
          kwList.some((kw) => (kw.value || '').toLowerCase().includes(filters.keyword.toLowerCase())) ||
          breachedList.some((site) => (site || '').toLowerCase().includes(filters.keyword.toLowerCase()));

        if (!keywordFound) return false;
      }

      // Date range filter
      const scannedAt = scan.scannedAt ? new Date(scan.scannedAt) : null;
      if (filters.startDate && scannedAt) {
        const startDate = new Date(filters.startDate);
        if (isBefore(scannedAt, startOfDay(startDate))) return false;
      }

      if (filters.endDate && scannedAt) {
        const endDate = new Date(filters.endDate);
        if (isAfter(scannedAt, endOfDay(endDate))) return false;
      }

      return true;
    });
  } catch (err: any) {
    console.error('[AdminHistory] render filter error', err);
    setRenderError(err?.message || String(err));
    filteredHistory = [] as typeof allHistory;
  }

  const breachCount = filteredHistory.filter((s) => s.status === 'breached').length;
  const safeCount = filteredHistory.filter((s) => s.status === 'safe').length;

  // Get unique users for filter
  const uniqueUsers = Array.from(
    new Set(allHistory.map((s) => s.userEmail).filter(Boolean))
  );

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      user: '',
      startDate: '',
      endDate: '',
      keyword: '',
    });
    toast.success('Filters cleared');
  };

  const handleExport = () => {
    const csv = [
      ['Email', 'Status', 'Scanned Date', 'Keywords', 'Breached Sites', 'Scan Duration'],
      ...filteredHistory.map((scan) => [
        scan.userEmail,
        scan.status,
        format(new Date(scan.scannedAt), 'yyyy-MM-dd HH:mm'),
        scan.keywords.map((k) => k.value).join('; '),
        scan.breachedSites?.join('; ') || 'N/A',
        `${scan.scanDuration}s`,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Report exported successfully');
  };

  return (
    <AdminLayout>
      <PageTransition>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {renderError && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-lg font-semibold text-red-700">An error occurred rendering this page</h3>
              <p className="text-sm text-red-600 mt-2">{renderError}</p>
              <p className="text-sm text-muted-foreground mt-2">Check console for details.</p>
            </div>
          )}
          {/* Header */}
          <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                <History className="w-8 h-8" />
                All Scan History
              </h1>
              <p className="text-muted-foreground">
                {filteredHistory.length} scans • {breachCount} breaches • {safeCount} safe
              </p>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </motion.div>

          {/* Filters Card */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter Results
                </CardTitle>
                <CardDescription>Refine your search with advanced filters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Status</Label>
                    <Select value={filters.status} onValueChange={(value: any) => setFilters({ ...filters, status: value })}>
                      <SelectTrigger id="status-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="safe">Safe</SelectItem>
                        <SelectItem value="breached">Breached</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* User Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="user-filter">User Email</Label>
                    <Select value={filters.user} onValueChange={(value) => setFilters({ ...filters, user: value })}>
                      <SelectTrigger id="user-filter">
                        <SelectValue placeholder="All Users" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All Users</SelectItem>
                        {uniqueUsers.map((user) => (
                          <SelectItem key={user} value={user || ''}>
                            {user}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Keyword/Site Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="keyword-filter">Keyword / Site</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="keyword-filter"
                        placeholder="Search keyword or site..."
                        value={filters.keyword}
                        onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="start-date">From Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                  </div>

                  {/* End Date Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="end-date">To Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <motion.div variants={fadeInUp}>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-xl border border-border">
                <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Scans Found
                </h3>
                <p className="text-muted-foreground">
                  {allHistory.length === 0
                    ? 'No scans have been performed yet.'
                    : 'No scans match your current filters.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((scan, index) => (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`cursor-pointer hover:border-cyber/50 transition ${
                        scan.status === 'breached' ? 'border-breach/30' : ''
                      }`}
                      onClick={() => setExpandedRow(expandedRow === scan.id ? null : scan.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-4">
                            {/* Header Row */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              {/* User Info */}
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">User</p>
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <p className="font-medium text-sm">{scan.userEmail || 'Anonymous'}</p>
                                </div>
                              </div>

                              {/* Date Info */}
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Scanned</p>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <p className="font-medium text-sm">
                                    {format(new Date(scan.scannedAt), 'MMM d, yyyy h:mm a')}
                                  </p>
                                </div>
                              </div>

                              {/* Status */}
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Status</p>
                                {scan.status === 'safe' ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-safe/10 text-safe rounded-full text-xs font-medium">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Safe
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-breach/10 text-breach rounded-full text-xs font-medium">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Breached
                                  </span>
                                )}
                              </div>

                              {/* Duration */}
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <p className="font-medium text-sm">{scan.scanDuration}s</p>
                                </div>
                              </div>
                            </div>

                            {/* Keywords Row */}
                            <div className="pt-2">
                              <p className="text-xs text-muted-foreground mb-2">Keywords Scanned</p>
                              <div className="flex flex-wrap gap-2">
                                {scan.keywords.map((kw) => (
                                  <span
                                    key={kw.id}
                                    className="px-3 py-1 bg-muted rounded-full text-xs font-medium"
                                  >
                                    {kw.type === 'password' ? '••••' : kw.value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <button className="ml-4 mt-1">
                            <ChevronDown
                              className={`w-5 h-5 text-muted-foreground transition ${
                                expandedRow === scan.id ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {expandedRow === scan.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-6 pt-6 border-t border-border space-y-4"
                            >
                              {scan.status === 'breached' && scan.breachedSites && scan.breachedSites.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-breach" />
                                    Breached on Sites
                                  </h4>
                                  <div className="space-y-2">
                                    {scan.breachedSites.map((site) => (
                                      <div
                                        key={site}
                                        className="p-3 rounded-lg bg-breach/5 border border-breach/20 flex items-center gap-3"
                                      >
                                        <Globe className="w-5 h-5 text-breach flex-shrink-0" />
                                        <div>
                                          <p className="font-medium text-sm">{site}</p>
                                          <p className="text-xs text-muted-foreground">Data exposed on this platform</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {scan.matchedKeywords && scan.matchedKeywords.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold mb-3">Matched Keywords</h4>
                                  <div className="space-y-2">
                                    {scan.matchedKeywords.map((keyword, idx) => (
                                      <div
                                        key={idx}
                                        className="p-3 rounded-lg bg-muted/50 border border-border flex items-center gap-3"
                                      >
                                        <AlertTriangle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <p className="text-sm font-mono">{keyword}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">User ID</p>
                                  <p className="font-mono text-sm">{scan.userId}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Scan ID</p>
                                  <p className="font-mono text-sm">{scan.id}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </PageTransition>
    </AdminLayout>
  );
}
