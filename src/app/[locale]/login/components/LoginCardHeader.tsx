'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginCardHeaderProps {
  welcomeBackText: string;
}

export function LoginCardHeader({ welcomeBackText }: LoginCardHeaderProps) {
  return (
    <CardHeader className="text-center space-y-6 pt-10 px-6 md:px-10">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
        className="mx-auto w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 glow-primary group hover:scale-105 transition-transform duration-300"
      >
        <div className="w-12 h-12 rounded-xl bg-primary text-black flex items-center justify-center shadow-inner">
          <Trophy className="w-6 h-6 text-black" />
        </div>
      </motion.div>

      <div className="space-y-2">
        <CardTitle className="text-3xl md:text-5xl font-black text-foreground tracking-tighter">
          EG<span className="text-gradient-primary">Football5</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground text-base md:text-lg font-medium">
          {welcomeBackText}
        </CardDescription>
      </div>
    </CardHeader>
  );
}
