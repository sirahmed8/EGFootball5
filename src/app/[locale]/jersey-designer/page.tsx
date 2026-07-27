'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Shirt, ShoppingBag, Sparkles, Check, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function JerseyDesignerPage() {
  const [primaryColor, setPrimaryColor] = React.useState('#10B981');
  const [secondaryColor, setSecondaryColor] = React.useState('#06B6D4');
  const [squadName, setSquadName] = React.useState('OBOUR EAGLES');
  const [playerName, setPlayerName] = React.useState('AHMED');
  const [number, setNumber] = React.useState('10');
  const [quantity, setQuantity] = React.useState(10);

  const colors = ['#10B981', '#06B6D4', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#171717'];

  const handleOrder = () => {
    toast.success(`Kit Order placed for ${quantity} custom jerseys! 👕 We will contact you on WhatsApp for delivery.`);
  };

  return (
    <div className="min-h-screen bg-mesh py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 stadium-glass p-8 rounded-3xl border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
            <Shirt className="w-4 h-4" /> Custom Kit Studio
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground">
            Custom Team <span className="text-gradient-primary">Jersey Designer</span>
          </h1>
          <p className="text-sm text-muted-foreground">Design custom 5-a-side team jerseys and order printed kits delivered to your doorstep.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Live Jersey Preview Card */}
        <Card className="stadium-glass border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-between space-y-6">
          <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider">Live 3D Kit Preview</h3>

          {/* Jersey Visualizer Graphic */}
          <div className="w-64 h-80 rounded-3xl border-4 border-white/10 flex flex-col items-center justify-between p-6 shadow-2xl relative overflow-hidden transition-all duration-300" style={{ backgroundColor: primaryColor }}>
            <div className="w-full h-12 rounded-xl flex items-center justify-center font-black text-xs tracking-widest text-black shadow-sm" style={{ backgroundColor: secondaryColor }}>
              {squadName}
            </div>

            <div className="text-center space-y-1 my-auto">
              <div className="text-6xl font-black tracking-tighter drop-shadow-md text-white font-mono">{number}</div>
              <div className="text-sm font-black tracking-widest uppercase text-white/90">{playerName}</div>
            </div>

            <div className="text-[9px] font-black uppercase text-white/70 tracking-widest">
              EGFootball5 Official Kit
            </div>
          </div>

          <div className="text-xs text-muted-foreground font-bold flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" /> Delivery across Obour, Cairo & Giza within 3-5 days
          </div>
        </Card>

        {/* Customizer Controls Form */}
        <Card className="stadium-glass border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
          <h3 className="text-xl font-black text-foreground">Customize Kit Options</h3>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Primary Shirt Color</label>
            <div className="flex gap-3">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setPrimaryColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                    primaryColor === c ? 'scale-125 border-white shadow-lg' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Secondary Accent Color</label>
            <div className="flex gap-3">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setSecondaryColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                    secondaryColor === c ? 'scale-125 border-white shadow-lg' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Squad Chest Name</label>
              <input
                type="text"
                value={squadName}
                onChange={(e) => setSquadName(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-bold uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Player Back Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-bold uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Back Number</label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-bold font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Pack Quantity</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-bold"
              >
                <option value={5} className="bg-neutral-900">5 Jerseys (1500 EGP)</option>
                <option value={10} className="bg-neutral-900">10 Jerseys (2800 EGP)</option>
                <option value={15} className="bg-neutral-900">15 Jerseys (3900 EGP)</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleOrder}
            size="lg"
            className="w-full py-6 bg-primary text-black hover:bg-primary/90 font-black rounded-2xl glow-primary cursor-pointer flex items-center justify-center gap-2 mt-4 text-base"
          >
            <ShoppingBag className="w-5 h-5" /> Place Order ({quantity * 280} EGP)
          </Button>
        </Card>
      </div>
    </div>
  );
}
