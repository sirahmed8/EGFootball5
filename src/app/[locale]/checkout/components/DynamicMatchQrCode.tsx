'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export function DynamicMatchQrCode({ value }: { value: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    QRCode.toDataURL(value, {
      width: 160,
      margin: 1,
      color: {
        dark: '#090d16',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (!isCancelled) setDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate match QR:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [value]);

  return (
    <div className="w-40 h-40 mx-auto bg-white p-2 rounded-2xl border border-border shadow-inner flex items-center justify-center">
      {dataUrl ? (
        <img
          src={dataUrl}
          alt="Match Admission Pass QR Code"
          width={150}
          height={150}
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground font-mono">
          Generating...
        </div>
      )}
    </div>
  );
}
