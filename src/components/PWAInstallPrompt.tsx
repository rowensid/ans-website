'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Download, Smartphone, Monitor, Zap, Shield, Star, MonitorSmartphone, Apple, Chrome } from 'lucide-react'
import { toast } from 'sonner'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showManualInstall, setShowManualInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isInWebAppiOS)
    }

    checkInstalled()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show install prompt immediately in development, after 3 seconds in production
      const delay = process.env.NODE_ENV === 'development' ? 1000 : 3000
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true)
        }
      }, delay)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      toast.success('A&S Studio berhasil diinstall! 🎉')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // For development: Always show install prompt after 2 seconds
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        if (!isInstalled && !deferredPrompt) {
          setShowInstallPrompt(true)
        }
      }, 2000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled, deferredPrompt])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Real PWA install
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        
        if (outcome === 'accepted') {
          toast.success('Terima kasih sudah menginstall A&S Studio! ✨')
        } else {
          toast.info('Install ditolak. Kamu bisa install nanti dari menu browser.')
        }
        
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
      } catch (error) {
        console.error('Error during install:', error)
        toast.error('Gagal menginstall aplikasi')
      }
    } else {
      // Show manual install instructions
      setShowInstallPrompt(false)
      setShowManualInstall(true)
    }
  }

  const handleManualInstall = (platform: 'chrome' | 'windows' | 'ios' | 'android') => {
    const instructions = {
      chrome: 'Chrome: Klik 3 titik di kanan atas → Install "A&S Studio" → Akan create desktop shortcut',
      windows: 'Edge/Chrome: Klik 3 titik → Apps → Install this site as an app → Otomatis buat desktop shortcut & Start Menu',
      ios: 'Safari: Klik Share → Add to Home Screen → Akan muncul di homescreen',
      android: 'Chrome: Klik 3 titik → Add to Home Screen → Akan muncul di homescreen'
    }
    
    const details = {
      chrome: '✅ Desktop shortcut akan dibuat\n✅ Buka tanpa browser\n✅ Offline access',
      windows: '✅ Desktop shortcut otomatis dibuat\n✅ Start Menu shortcut\n✅ Buka tanpa browser\n✅ Offline access',
      ios: '✅ Icon di homescreen\n✅ Buka tanpa Safari\n✅ Offline access',
      android: '✅ Icon di homescreen\n✅ Buka tanpa browser\n✅ Offline access'
    }
    
    toast.success(`${instructions[platform]}\n\n${details[platform]}`, {
      duration: 6000,
      style: {
        maxWidth: '400px',
        whiteSpace: 'pre-line'
      }
    })
    setShowManualInstall(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Don't show if already installed or dismissed recently
  if (isInstalled || (!showInstallPrompt && !showManualInstall)) {
    return null
  }

  // Check if user dismissed recently (within 7 days)
  const dismissedTime = localStorage.getItem('pwa-install-dismissed')
  if (dismissedTime && (Date.now() - parseInt(dismissedTime)) < 7 * 24 * 60 * 60 * 1000) {
    return null
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  if (showManualInstall) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <Card className="bg-gradient-to-br from-violet-600/95 to-purple-600/95 backdrop-blur-xl border-white/20 shadow-2xl max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-white text-xl">Install A&S Studio</CardTitle>
            <CardDescription className="text-purple-100">
              Pilih platform kamu - Windows akan otomatis buat desktop shortcut
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleManualInstall('chrome')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex flex-col items-center py-4 h-auto"
              >
                <Chrome className="w-8 h-8 mb-2" />
                <span className="text-sm">Chrome</span>
              </Button>
              <Button
                onClick={() => handleManualInstall('windows')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex flex-col items-center py-4 h-auto relative"
              >
                <Monitor className="w-8 h-8 mb-2" />
                <span className="text-sm">Windows</span>
                <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  ✓
                </div>
              </Button>
              <Button
                onClick={() => handleManualInstall('android')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex flex-col items-center py-4 h-auto"
              >
                <Smartphone className="w-8 h-8 mb-2" />
                <span className="text-sm">Android</span>
              </Button>
              <Button
                onClick={() => handleManualInstall('ios')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex flex-col items-center py-4 h-auto"
              >
                <Apple className="w-8 h-8 mb-2" />
                <span className="text-sm">iPhone</span>
              </Button>
            </div>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setShowManualInstall(false)}
                className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Close
              </Button>
              
              <div className="text-center text-xs text-purple-100 mt-3">
                <p>💡 <strong>Windows User:</strong> Desktop shortcut otomatis dibuat</p>
                <p>🖥️ Akan muncul di Desktop + Start Menu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5 fade-in-0 duration-300">
      <Card className="bg-gradient-to-br from-violet-600/95 to-purple-600/95 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">Install A&S Studio</CardTitle>
                <CardDescription className="text-purple-100 text-sm">
                  {isMobile ? 'Install app di HP kamu' : 'Install app di desktop kamu + Desktop Shortcut'}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white/80 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Badge className="bg-white/20 text-white border-white/30 justify-center">
              <Zap className="w-3 h-3 mr-1" />
              Offline Access
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 justify-center">
              <Shield className="w-3 h-3 mr-1" />
              Secure
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 justify-center">
              <Smartphone className="w-3 h-3 mr-1" />
              Mobile Ready
            </Badge>
            <Badge className="bg-green-500/80 text-white border-green-400/50 justify-center">
              <Monitor className="w-3 h-3 mr-1" />
              Desktop Shortcut
            </Badge>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-white text-violet-600 hover:bg-purple-50 font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              Install Sekarang
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Nanti
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-purple-100">
              <Star className="w-3 h-3 inline mr-1" />
              Install untuk pengalaman terbaik + desktop shortcut <MonitorSmartphone className="w-3 h-3 inline ml-1" />
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}