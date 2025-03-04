"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function EditBrandVoicePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the review page
    router.push('/onboarding/review');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-[#FF6F61] animate-spin" />
      <span className="ml-2">Redirecting to brand voice editor...</span>
    </div>
  );
} 