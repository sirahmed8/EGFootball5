'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Pitch } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight } from 'lucide-react';

export default function PlayerHome() {
  const router = useRouter();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'pitches'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pts = snapshot.docs.map(doc => doc.data() as Pitch);
      setPitches(pts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-white mt-16">Loading pitches...</div>;
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-16">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-foreground">Select a Pitch</h1>
        <p className="text-xl text-muted-foreground">Choose a pitch to view availability and book your slot.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pitches.map(pitch => (
          <Card key={pitch.id} className="bg-card/80 border-border backdrop-blur-xl overflow-hidden hover:border-primary/50 transition-colors group flex flex-col">
            <div className="aspect-video relative w-full bg-muted overflow-hidden">
              {pitch.imagePreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pitch.imagePreviewUrl} alt={pitch.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-muted-foreground">No Preview</div>
              )}
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-primary font-bold text-sm">
                {pitch.pricePerHour} EGP / hr
              </div>
            </div>
            
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{pitch.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {pitch.mapLink ? (
                  <a href={pitch.mapLink} target="_blank" rel="noreferrer" className="hover:text-primary hover:underline">
                    {pitch.locationName || 'View on Map'}
                  </a>
                ) : (
                  <span>{pitch.locationName || 'Location not specified'}</span>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="mt-auto pt-4 flex flex-col gap-4">
              <div className="text-sm text-muted-foreground">
                <p><strong>Manager:</strong> {pitch.managerName || 'N/A'}</p>
                <p><strong>Contact:</strong> {pitch.adminPhone || 'N/A'}</p>
              </div>
              <Button 
                className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 flex items-center justify-center gap-2 mt-4"
                onClick={() => router.push(`/book?pitchId=${pitch.id}`)}
              >
                Book Now <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {pitches.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground p-8 bg-card/50 rounded-xl border border-border">
            No pitches available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
