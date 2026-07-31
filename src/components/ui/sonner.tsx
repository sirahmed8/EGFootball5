"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      className="toaster group z-[9999999]"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-400" />
        ),
        info: (
          <InfoIcon className="size-4 text-cyan-400" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-400" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-rose-400" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-primary" />
        ),
      }}
      toastOptions={{
        style: {
          backgroundColor: '#0a0d14',
          color: '#ffffff',
          border: '1.5px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '1.25rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.9)',
          opacity: '1',
          zIndex: 9999999,
          fontWeight: 700,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
