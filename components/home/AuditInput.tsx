"use client";
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuditInput() {
    const router = useRouter();
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');

    function handleSubmit() {
        setError('');
        if (!url) {
            setError('Please enter a website URL');
            return;
        }

        const formattedURL = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

        try {
            new URL(formattedURL);
            router.push(`/audit?url=${encodeURIComponent(formattedURL)}`);
        } catch {
            setError('Please enter a valid URL');
        }
    }

    return (
        <div className="w-full max-w-xl mx-auto space-y-3 flex justify-center flex-col items-center">
            <div className="flex gap-2">
                <Input placeholder="Enter your website URL" className="lg:w-100 md:w-72 sm:w-64 mb-4"
                    value={url} onChange={(e) => setUrl(e.target.value)} />
                <Button onClick={handleSubmit} className='dark:bg-white dark:text-zinc-900 lg:w-25 md:w-20 sm:w-15'>Audit</Button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    )
}