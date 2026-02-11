import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, Globe, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';

interface ScanResultProps {
  status: 'safe' | 'breached';
  breachedSites?: string[];
  matchedKeywords?: string[];
  onNewScan: () => void;
  onViewHistory: () => void;
}

export function ScanResult({
  status,
  breachedSites = [],
  matchedKeywords = [],
  onNewScan,
  onViewHistory,
}: ScanResultProps) {
  const isSafe = status === 'safe';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg"
    >
      {/* Header */}
      <div
        className={`p-8 text-center ${
          isSafe ? 'bg-gradient-safe' : 'bg-gradient-breach'
        }`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isSafe ? 'bg-white/20 safe-glow' : 'bg-white/20 breach-glow'
          }`}
        >
          {isSafe ? (
            <ShieldCheck className="w-12 h-12 text-white" />
          ) : (
            <ShieldAlert className="w-12 h-12 text-white" />
          )}
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white mb-2"
        >
          {isSafe ? 'No Breaches Found!' : 'Breach Detected!'}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white/90"
        >
          {isSafe
            ? 'Your data was not found in any known dark web breaches.'
            : `Your data was found in ${breachedSites.length} dark web source${breachedSites.length > 1 ? 's' : ''}.`}
        </motion.p>
      </div>

      {/* Body */}
      <div className="p-6 md:p-8">
        {!isSafe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-breach" />
              <h3 className="text-lg font-semibold text-foreground">
                Breached Sources
              </h3>
            </div>
            <div className="space-y-3">
              {breachedSites.map((site, index) => (
                <motion.div
                  key={site}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-breach/5 border border-breach/20"
                >
                  <div className="w-10 h-10 rounded-full bg-breach/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-breach" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{site}</p>
                    <p className="text-sm text-muted-foreground">
                      Data found on dark web forum
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {matchedKeywords.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Matched keywords:
                </p>
                <div className="flex flex-wrap gap-2">
                  {matchedKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1.5 bg-breach/10 text-breach rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium text-foreground mb-2">
                Recommended Actions:
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-breach">•</span>
                  Change passwords for affected accounts immediately
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-breach">•</span>
                  Enable two-factor authentication where possible
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-breach">•</span>
                  Monitor your accounts for suspicious activity
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        {isSafe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-8"
          >
            <div className="p-4 bg-safe/5 rounded-lg border border-safe/20">
              <p className="text-muted-foreground">
                We scanned multiple dark web sources and databases. Your
                sensitive data appears to be secure. Continue monitoring
                regularly for best protection.
              </p>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onNewScan}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            New Scan
          </Button>
          <Button
            variant={isSafe ? 'safe' : 'breach'}
            size="lg"
            className="flex-1"
            onClick={onViewHistory}
          >
            View History
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
