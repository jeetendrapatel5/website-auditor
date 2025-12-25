'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ScanButton({ competitorId }: { competitorId: string }) {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)

  async function handleScan() {
    setScanning(true)
    
    try {
      const response = await fetch(`/api/competitors/${competitorId}/scan`, {
        method: 'POST'
      })
      
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Scan failed:', error)
    } finally {
      setScanning(false)
    }
  }

  return (
    <Button 
      onClick={handleScan}
      disabled={scanning}
    >
      {scanning ? '🔄 Scanning...' : '🔍 Scan Now'}
    </Button>
  )
}