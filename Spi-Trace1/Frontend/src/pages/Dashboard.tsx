import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useScan } from '@/contexts/ScanContext';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { ScanProgress } from '@/components/scan/ScanProgress';
import { ScanResult } from '@/components/scan/ScanResult';
import { PageTransition } from '@/components/animations/PageTransition';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

type DashboardState = 'scanning' | 'result';

export default function Dashboard() {
  const { user } = useAuth();
  const { keywords, addScanResult, clearKeywords, executeScan } = useScan();
  const navigate = useNavigate();

  const [state, setState] = useState<DashboardState>('scanning');
  const [result, setResult] = useState<{
    status: 'safe' | 'breached';
    breachedSites?: string[];
    matchedKeywords?: string[];
  } | null>(null);

  useEffect(() => {
    if (keywords.length === 0) {
      navigate('/home');
      return;
    }

    let isMounted = true;

    const performScan = async () => {
      // Extract string values from Keyword objects
      const keywordValues = keywords.map(k => k.value);
      const scanResult = await executeScan(keywordValues);

      if (isMounted && scanResult) {
        // We have a result. We can set it now, but we want to wait for animation?
        // Let's store it in a way that handleScanComplete can use it, or update state directly if animation is done.
        // For simplicity, let's just set result state and let UI update when it wants.
        // Actually, handleScanComplete is called by ScanProgress.
        // We should probably save the result to a ref or state to be picked up by handleScanComplete.
        setRealScanResult(scanResult);
      }
    };

    performScan();

    return () => { isMounted = false; };
  }, []);

  const [realScanResult, setRealScanResult] = useState<any>(null); // Type properly if possible

  const handleScanComplete = () => {
    // This is called by ScanProgress when animation is done.
    // We check if real scan is done.
    if (realScanResult) {
      setResult({
        status: realScanResult.status,
        breachedSites: realScanResult.breachedSites || [],
        matchedKeywords: realScanResult.matchedKeywords || []
      });
      setState('result');
    } else {
      // If scan not done, we could show a loading state or wait.
      // For now, let's just wait for result to update state?
      // Or we can assume scan is fast enough.
      // If not, we block here.
      // Ideally we enter a "Finalizing" state.
      // Let's render a loading spinner if state is 'scanning' and animation done but no result.
    }
  };

  // We need to coordinate: Animation Done AND Scan Done.
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    if (animationDone && realScanResult) {
      setResult({
        status: realScanResult.status,
        breachedSites: realScanResult.breachedSites || [],
        matchedKeywords: realScanResult.matchedKeywords || []
      });
      setState('result');
    }
  }, [animationDone, realScanResult]);

  const onAnimationComplete = () => {
    setAnimationDone(true);
  };

  const handleNewScan = () => {
    clearKeywords();
    navigate('/home');
  };

  const handleViewHistory = () => {
    navigate('/history');
  };

  // If no keywords, show empty state
  if (keywords.length === 0) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              No Keywords to Scan
            </h1>
            <p className="text-muted-foreground mb-6">
              Add some keywords on the home page to start scanning.
            </p>
            <Button onClick={() => navigate('/home')} variant="cyber">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {state === 'scanning' ? 'Scanning in Progress' : 'Scan Results'}
              </h1>
              <p className="text-muted-foreground">
                {state === 'scanning'
                  ? 'Please wait while we scan the dark web for your data...'
                  : 'Your scan is complete. Review the results below.'}
              </p>
            </motion.div>

            {/* Scanning Keywords Preview */}
            {state === 'scanning' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8 p-4 bg-card rounded-lg border border-border"
              >
                <p className="text-sm text-muted-foreground mb-2">
                  Scanning {keywords.length} keyword{keywords.length > 1 ? 's' : ''}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw) => (
                    <span
                      key={kw.id}
                      className="px-3 py-1 bg-muted rounded-full text-sm text-foreground"
                    >
                      {kw.type === 'password'
                        ? '••••••••'
                        : kw.type === 'creditcard'
                          ? `****${kw.value.slice(-4)}`
                          : kw.value}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Content */}
            {state === 'scanning' && !animationDone && (
              <ScanProgress
                isScanning={true}
                onComplete={onAnimationComplete} // Use our new handler
              />
            )}

            {state === 'scanning' && animationDone && !realScanResult && (
              <div className="text-center py-12">
                <p className="text-xl animate-pulse text-cyber">Finalizing analysis from dark web nodes...</p>
              </div>
            )}

            {state === 'result' && result && (
              <ScanResult
                status={result.status}
                breachedSites={result.breachedSites}
                matchedKeywords={result.matchedKeywords}
                onNewScan={handleNewScan}
                onViewHistory={handleViewHistory}
              />
            )}
          </div>
        </div>
      </PageTransition>
    </ClientLayout>
  );
}
