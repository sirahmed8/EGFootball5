'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Tv, MessageSquare, Send, Radio, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LiveStreamPage() {
  const [chat, setChat] = React.useState([
    { name: 'Ahmed', msg: 'What a goal by Obour Eagles!' },
    { name: 'Karim', msg: 'Great save from the keeper 🔥' },
    { name: 'Youssef', msg: 'Come on Tagamoa!' },
  ]);
  const [inputMsg, setInputMsg] = React.useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChat((prev) => [...prev, { name: 'You', msg: inputMsg }]);
    setInputMsg('');
  };

  return (
    <div className="min-h-screen bg-mesh py-8 px-4 md:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between stadium-glass p-6 rounded-3xl border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground">
              Tournament <span className="text-gradient-primary">Live Stream</span>
            </h1>
            <p className="text-xs text-muted-foreground">Obour Summer Cup 2026 • Grand Finale Match</p>
          </div>
        </div>

        <span className="px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-black uppercase flex items-center gap-1.5 animate-pulse">
          ● Live Broadcast (1.2k Viewers)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Stream Player */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="stadium-glass border-white/10 rounded-3xl p-4 shadow-2xl space-y-4 overflow-hidden">
            <div className="w-full h-80 md:h-[450px] rounded-2xl bg-emerald-950/90 border border-emerald-500/30 flex items-center justify-center text-7xl relative overflow-hidden shadow-inner">
              ⚽
              {/* Scoreboard Overlay */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between p-3 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🦅</span> <span className="text-foreground">Obour Eagles</span>
                </div>
                <div className="text-xl font-black text-primary px-3 py-1 rounded-xl bg-white/10 font-mono">
                  2 - 1
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground">Obour Stars</span> <span className="text-lg">🌟</span>
                </div>
              </div>

              <div className="absolute bottom-4 start-4 px-3 py-1 rounded-full bg-black/80 text-[10px] font-mono text-emerald-400">
                LIVE 38:42 ⏱️
              </div>
            </div>
          </Card>
        </div>

        {/* Live Fan Chat */}
        <div className="stadium-glass rounded-3xl p-5 border-white/10 shadow-xl flex flex-col justify-between h-[520px]">
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-black text-sm text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" /> Live Fan Chat
              </span>
              <span className="text-[10px] text-muted-foreground">1.2k Online</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pt-2">
              {chat.map((c, idx) => (
                <div key={idx} className="text-xs bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <span className="font-bold text-primary me-2">{c.name}:</span>
                  <span className="text-foreground">{c.msg}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-white/10">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Send message to stream..."
              className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 text-foreground text-xs font-medium focus:outline-none focus:border-primary"
            />
            <Button type="submit" size="icon" className="bg-primary text-black rounded-xl cursor-pointer">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
