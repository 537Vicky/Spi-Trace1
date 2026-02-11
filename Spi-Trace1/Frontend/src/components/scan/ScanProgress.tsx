import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useScan } from '@/contexts/ScanContext';
import { Wifi, Globe, Database, Search, Shield, Check } from 'lucide-react';

interface ScanProgressProps {
  isScanning: boolean;
  onComplete: (status: 'safe' | 'breached', breachedSites?: string[], matchedKeywords?: string[]) => void;
}

const scanSteps = [
  { label: 'Connecting to dark web sources...', icon: Wifi, duration: 2000 },
  { label: 'Scanning enabled forums...', icon: Globe, duration: 3000 },
  { label: 'Searching leaked databases...', icon: Database, duration: 2500 },
  { label: 'Matching keywords...', icon: Search, duration: 2000 },
  { label: 'Analyzing results...', icon: Shield, duration: 1500 },
];

export function ScanProgress({ isScanning, onComplete }: ScanProgressProps) {
  const { darkWebLinks, keywords } = useScan();
  const enabledLinks = darkWebLinks.filter((l) => l.status === 'enabled');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scanningLink, setScanningLink] = useState(0);

  useEffect(() => {
    if (!isScanning) {
      setCurrentStep(0);
      setProgress(0);
      setScanningLink(0);
      return;
    }

    let stepTimeout: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    const runStep = (stepIndex: number) => {
      if (stepIndex >= scanSteps.length) {
        // Complete - simulate random result
        const isBreach = Math.random() > 0.5;
        if (isBreach) {
          const breachedSites = enabledLinks
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(Math.random() * 2) + 1)
            .map((l) => l.name);
          const matchedKw = keywords.length > 0 
            ? [keywords[Math.floor(Math.random() * keywords.length)].value]
            : [];
          onComplete('breached', breachedSites, matchedKw);
        } else {
          onComplete('safe');
        }
        return;
      }

      setCurrentStep(stepIndex);
      const stepDuration = scanSteps[stepIndex].duration;
      const stepProgress = ((stepIndex + 1) / scanSteps.length) * 100;

      // Animate progress
      const startProgress = (stepIndex / scanSteps.length) * 100;
      const progressStep = (stepProgress - startProgress) / (stepDuration / 50);
      let currentProgress = startProgress;

      progressInterval = setInterval(() => {
        currentProgress += progressStep;
        if (currentProgress >= stepProgress) {
          currentProgress = stepProgress;
          clearInterval(progressInterval);
        }
        setProgress(currentProgress);
      }, 50);

      // Cycle through scanning links
      if (stepIndex === 1) {
        const linkInterval = setInterval(() => {
          setScanningLink((prev) => (prev + 1) % enabledLinks.length);
        }, 500);
        stepTimeout = setTimeout(() => {
          clearInterval(linkInterval);
          runStep(stepIndex + 1);
        }, stepDuration);
      } else {
        stepTimeout = setTimeout(() => {
          runStep(stepIndex + 1);
        }, stepDuration);
      }
    };

    runStep(0);

    return () => {
      clearTimeout(stepTimeout);
      clearInterval(progressInterval);
    };
  }, [isScanning]);

  if (!isScanning) return null;

  const CurrentIcon = scanSteps[currentStep]?.icon || Shield;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-8 shadow-lg"
    >
      <div className="text-center mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 rounded-full bg-cyber/10 flex items-center justify-center mx-auto mb-4 cyber-glow"
        >
          <CurrentIcon className="w-10 h-10 text-cyber" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Scanning Dark Web...</h2>
        <p className="text-muted-foreground">
          {scanSteps[currentStep]?.label || 'Processing...'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-cyber rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3 mb-8">
        {scanSteps.map((step, index) => {
          const Icon = step.icon;
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isCurrent
                  ? 'bg-cyber/10 border border-cyber/30'
                  : isComplete
                  ? 'bg-safe/5'
                  : 'bg-muted/50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCurrent
                    ? 'bg-cyber text-primary'
                    : isComplete
                    ? 'bg-safe text-safe-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isComplete ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className={`w-4 h-4 ${isCurrent ? 'animate-pulse' : ''}`} />
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isCurrent
                    ? 'text-foreground'
                    : isComplete
                    ? 'text-safe'
                    : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Currently Scanning */}
      {currentStep === 1 && enabledLinks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-muted rounded-lg"
        >
          <p className="text-sm text-muted-foreground mb-3">Scanning sources:</p>
          <div className="flex flex-wrap gap-2">
            {enabledLinks.map((link, index) => (
              <motion.span
                key={link.id}
                animate={{
                  scale: index === scanningLink ? 1.05 : 1,
                  opacity: index === scanningLink ? 1 : 0.5,
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  index === scanningLink
                    ? 'bg-cyber text-primary'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {link.name}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
