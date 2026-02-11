import { useState, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeywordType, Keyword } from '@/contexts/ScanContext';
import { X, Mail, Lock, Phone, CreditCard, User, Tag, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface KeywordInputProps {
  keywords: Keyword[];
  onAddKeyword: (value: string, type: KeywordType) => void;
  onRemoveKeyword: (id: string) => void;
}

const keywordTypes: { value: KeywordType; label: string; icon: React.ElementType; placeholder: string }[] = [
  { value: 'email', label: 'Email', icon: Mail, placeholder: 'Enter email address' },
  { value: 'password', label: 'Password', icon: Lock, placeholder: 'Enter password' },
  { value: 'phone', label: 'Phone', icon: Phone, placeholder: 'Enter phone number' },
  { value: 'creditcard', label: 'Credit Card', icon: CreditCard, placeholder: 'Enter last 4 digits' },
  { value: 'username', label: 'Username', icon: User, placeholder: 'Enter username' },
  { value: 'custom', label: 'Custom', icon: Tag, placeholder: 'Enter any keyword' },
];

const getKeywordIcon = (type: KeywordType) => {
  const found = keywordTypes.find((kt) => kt.value === type);
  return found ? found.icon : Tag;
};

const getKeywordColor = (type: KeywordType) => {
  switch (type) {
    case 'email':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'password':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'phone':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'creditcard':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'username':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export function KeywordInput({ keywords, onAddKeyword, onRemoveKeyword }: KeywordInputProps) {
  const [value, setValue] = useState('');
  const [type, setType] = useState<KeywordType>('email');

  const selectedType = keywordTypes.find((kt) => kt.value === type) || keywordTypes[0];

  const handleAdd = () => {
    if (value.trim()) {
      onAddKeyword(value.trim(), type);
      setValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={type} onValueChange={(v) => setType(v as KeywordType)}>
          <SelectTrigger className="w-full sm:w-40 h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {keywordTypes.map((kt) => {
              const Icon = kt.icon;
              return (
                <SelectItem key={kt.value} value={kt.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {kt.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <selectedType.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={type === 'password' ? 'password' : 'text'}
              placeholder={selectedType.placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-11 h-12"
            />
          </div>
          <Button
            type="button"
            onClick={handleAdd}
            variant="cyber"
            size="lg"
            className="shrink-0"
            disabled={!value.trim()}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>

      {/* Keywords Display */}
      <div className="min-h-[60px]">
        <AnimatePresence mode="popLayout">
          {keywords.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap gap-2"
            >
              {keywords.map((keyword) => {
                const Icon = getKeywordIcon(keyword.type);
                return (
                  <motion.div
                    key={keyword.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    layout
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${getKeywordColor(
                      keyword.type
                    )}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="max-w-[150px] truncate">
                      {keyword.type === 'password'
                        ? '••••••••'
                        : keyword.type === 'creditcard'
                        ? `****${keyword.value}`
                        : keyword.value}
                    </span>
                    <button
                      onClick={() => onRemoveKeyword(keyword.id)}
                      className="ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground text-sm text-center py-4"
            >
              Add keywords to scan (email, password, phone, etc.)
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
