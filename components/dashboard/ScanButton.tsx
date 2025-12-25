'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function ScanButton({ competitorId }: { competitorId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleScan = async () => {
    if (!competitorId) {
      console.error("No competitor ID provided to ScanButton");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ competitorId }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        router.refresh(); 
      }
    } catch (err) {
      console.error("Scan failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleScan} 
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700"
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Analyzing...' : 'Scan Now'}
    </Button>
  );
}