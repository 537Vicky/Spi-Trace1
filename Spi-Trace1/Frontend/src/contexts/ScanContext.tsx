import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type KeywordType = 'email' | 'password' | 'phone' | 'creditcard' | 'username' | 'custom';

// Backend API URL (should match AuthContext or be imported)
const API_URL = 'http://127.0.0.1:5000';

export interface Keyword {
  id: string;
  value: string;
  type: KeywordType;
}

export interface ScanResult {
  id: string;
  userId: string;
  userEmail?: string;
  keywords: Keyword[];
  status: 'safe' | 'breached';
  breachedSites?: string[];
  matchedKeywords?: string[];
  scannedAt: Date;
  scanDuration: number;
}

export interface DarkWebLink {
  id: string;
  url: string;
  name: string;
  status: 'enabled' | 'disabled';
  lastChecked?: Date;
  addedAt: Date;
}

interface ScanContextType {
  keywords: Keyword[];
  addKeyword: (value: string, type: KeywordType) => void;
  removeKeyword: (id: string) => void;
  clearKeywords: () => void;
  scanHistory: ScanResult[];
  addScanResult: (result: Omit<ScanResult, 'id'>) => void;
  darkWebLinks: DarkWebLink[];
  addDarkWebLink: (url: string, name: string) => Promise<boolean>;
  updateDarkWebLink: (id: string, updates: Partial<DarkWebLink>) => Promise<boolean>;
  removeDarkWebLink: (id: string) => Promise<boolean>;
  toggleDarkWebLink: (id: string) => Promise<boolean>;
  getAllScanHistory: () => ScanResult[];
  refreshData: () => Promise<void>;
  executeScan: (keywords: string[]) => Promise<ScanResult | null>;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [darkWebLinks, setDarkWebLinks] = useState<DarkWebLink[]>([]);

  const addKeyword = (value: string, type: KeywordType) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    // Check for duplicates
    if (keywords.some(k => k.value.toLowerCase() === trimmedValue.toLowerCase())) return;

    const newKeyword: Keyword = {
      id: Date.now().toString(),
      value: trimmedValue,
      type,
    };
    setKeywords(prev => [...prev, newKeyword]);
  };

  const removeKeyword = (id: string) => {
    setKeywords(prev => prev.filter(k => k.id !== id));
  };

  const clearKeywords = () => {
    setKeywords([]);
  };

  const addScanResult = (result: Omit<ScanResult, 'id'>) => {
    const newResult: ScanResult = {
      ...result,
      id: Date.now().toString(),
    };
    setScanHistory(prev => [newResult, ...prev]);
  };

  const fetchUrls = async () => {
    try {
      const token = localStorage.getItem('darkwatch_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/urls`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const formattedLinks = data.map((link: any) => ({
          id: link.id,
          url: link.url,
          name: link.name,
          status: link.status,
          addedAt: new Date(link.added_at),
          lastChecked: new Date() // Backend doesn't return this yet?
        }));
        setDarkWebLinks(formattedLinks);
      } else {
        console.error('Failed to fetch URLs:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch URLs:', error);
    }
  };

  const fetchScans = async () => {
    try {
      const token = localStorage.getItem('darkwatch_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/scans`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const formattedScans = data.map((scan: any) => ({
          id: scan.id,
          userId: scan.user_id,
          keywords: (scan.keywords || []).map((k: string, idx: number) => ({ id: idx.toString(), value: k, type: 'custom' })),
          status: scan.matches && scan.matches.length > 0 ? 'breached' : 'safe',
          breachedSites: scan.matches ? scan.matches.map((m: any) => m.url || m) : [],
          matchedKeywords: scan.matches ? scan.matches.flatMap((m: any) => m.keywords || [m]) : [],
          scannedAt: new Date(scan.started_at),
          scanDuration: scan.completed_at ? (new Date(scan.completed_at).getTime() - new Date(scan.started_at).getTime()) / 1000 : 0
        }));
        setScanHistory(formattedScans);
      }
    } catch (error) {
      console.error('Failed to fetch scans:', error);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchUrls();
      fetchScans();
    }
  }, [isAuthenticated]);

  const refreshData = async () => {
    await Promise.all([fetchUrls(), fetchScans()]);
  };

  const addDarkWebLink = async (url: string, name: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('darkwatch_token');
      if (!token) return false;

      const response = await fetch(`${API_URL}/api/urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ url, name })
      });

      if (response.ok) {
        await fetchUrls(); // Refresh list
        return true;
      } else {
        console.error('Failed to add URL:', response.status, await response.text());
        return false;
      }
    } catch (error) {
      console.error('Failed to add URL:', error);
      return false;
    }
  };

  const updateDarkWebLink = async (id: string, updates: Partial<DarkWebLink>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('darkwatch_token');
      if (!token) return false;

      const response = await fetch(`${API_URL}/api/urls/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        await fetchUrls();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update URL:', error);
      return false;
    }
  };

  const removeDarkWebLink = async (id: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('darkwatch_token');
      if (!token) return false;

      const response = await fetch(`${API_URL}/api/urls/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setDarkWebLinks(prev => prev.filter(link => link.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete URL:', error);
      return false;
    }
  };

  const toggleDarkWebLink = async (id: string): Promise<boolean> => {
    const link = darkWebLinks.find(l => l.id === id);
    if (!link) return false;

    const newStatus = link.status === 'enabled' ? 'disabled' : 'enabled';
    return await updateDarkWebLink(id, { status: newStatus });
  };

  const executeScan = async (scanKeywords: string[]): Promise<ScanResult | null> => {
    try {
      const token = localStorage.getItem('darkwatch_token');
      if (!token) return null;

      const response = await fetch(`${API_URL}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ keywords: scanKeywords })
      });

      if (response.ok) {
        const data = await response.json();
        const formattedScan: ScanResult = {
          id: data.id,
          userId: data.user_id,
          keywords: (data.keywords || []).map((k: string, idx: number) => ({ id: idx.toString(), value: k, type: 'custom' })),
          status: data.matches && data.matches.length > 0 ? 'breached' : 'safe',
          breachedSites: data.matches ? data.matches.map((m: any) => m.url || m) : [],
          matchedKeywords: data.matches ? data.matches.flatMap((m: any) => m.keywords || [m]) : [],
          scannedAt: new Date(data.started_at),
          scanDuration: data.completed_at ? (new Date(data.completed_at).getTime() - new Date(data.started_at).getTime()) / 1000 : 0
        };
        // Refresh history
        fetchScans();
        return formattedScan;
      }
      return null;
    } catch (error) {
      console.error('Failed to execute scan:', error);
      return null;
    }
  };

  const getAllScanHistory = () => scanHistory;

  return (
    <ScanContext.Provider
      value={{
        keywords,
        addKeyword,
        removeKeyword,
        clearKeywords,
        scanHistory,
        addScanResult,
        darkWebLinks,
        addDarkWebLink,
        updateDarkWebLink,
        removeDarkWebLink,
        toggleDarkWebLink,
        getAllScanHistory,
        refreshData,
        executeScan
      }}
    >
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
}
