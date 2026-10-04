'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SolidSelect } from '@/components/ui/SolidSelect';
import { Portal } from '@/components/Portal';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  name: string;
  setName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  logoEmoji: string;
  setLogoEmoji: (val: string) => void;
  creating: boolean;
}

export function CreateCommunityModal({
  isOpen,
  onClose,
  onSubmit,
  name,
  setName,
  description,
  setDescription,
  city,
  setCity,
  logoEmoji,
  setLogoEmoji,
  creating,
}: CreateCommunityModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg stadium-glass border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                  <Shield className="text-primary" /> Create Squad
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 text-muted-foreground cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                    Squad Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Obour City FC"
                    className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your squad philosophy, match times..."
                    className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary text-sm font-medium h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">City</label>
                    <SolidSelect
                      value={city}
                      onChange={(val) => setCity(val)}
                      options={[
                        { value: 'Obour', label: 'Obour' },
                        { value: 'Cairo', label: 'Cairo' },
                        { value: 'Giza', label: 'Giza' },
                        { value: 'Alexandria', label: 'Alexandria' },
                      ]}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                      Logo Avatar
                    </label>
                    <SolidSelect
                      value={logoEmoji}
                      onChange={(val) => setLogoEmoji(val)}
                      options={[
                        { value: '⚽', label: '⚽ Football' },
                        { value: '🦅', label: '🦅 Eagle' },
                        { value: '⚡', label: '⚡ Lightning' },
                        { value: '🔥', label: '🔥 Fire' },
                        { value: '🧤', label: '🧤 Glove' },
                        { value: '👑', label: '👑 Crown' },
                      ]}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="w-1/2 stadium-glass border-white/10 text-foreground rounded-2xl cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    className="w-1/2 bg-primary text-black font-black rounded-2xl glow-primary cursor-pointer"
                  >
                    {creating ? 'Creating...' : 'Launch Squad 🚀'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
