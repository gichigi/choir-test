"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase/config';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from '@/components/Navigation';
import { Flame } from 'lucide-react';
import Link from 'next/link';

export default function BusinessInfoPage() {
  const [businessName, setBusinessName] = useState("");
  const [yearStarted, setYearStarted] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, router, loading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      alert("You must be logged in to continue");
      return;
    }
    
    setLoading(true);
    
    try {
      // Create a new doc in the brandInformation collection
      const brandInfoRef = doc(collection(db, 'brandInformation'), user.uid);
      
      // Add business info data
      await setDoc(brandInfoRef, {
        businessName,
        yearStarted,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      // Move to the next step
      router.push('/onboarding/business-description');
    } catch (error) {
      console.error("Error saving business information:", error);
      alert("There was an error saving your information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#333333] flex flex-col">
      <Navigation showBackButton={false} />
      
      {/* Main content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md bg-[#FFE5E5] border-none">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Tell us about your business</CardTitle>
              <CardDescription className="text-center">
                Step 1 of 4: Basic business information
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input 
                  id="businessName" 
                  value={businessName} 
                  onChange={(e) => setBusinessName(e.target.value)} 
                  placeholder="Acme Inc." 
                  required 
                  className="bg-white border-[#FFB3B0] focus:border-[#FF6F61] focus:ring-[#FF6F61]" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="yearStarted">Year Started</Label>
                <Input 
                  id="yearStarted" 
                  value={yearStarted} 
                  onChange={(e) => setYearStarted(e.target.value)} 
                  placeholder="2020" 
                  required 
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="bg-white border-[#FFB3B0] focus:border-[#FF6F61] focus:ring-[#FF6F61]" 
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-[#FF6F61] text-white hover:bg-[#FFB3B0]" 
                disabled={loading}
              >
                {loading ? "Saving..." : "Continue"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#FFE5E5] w-full">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between py-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Flame className="h-6 w-6 text-[#FF6F61]" />
            <span className="text-sm font-medium">© 2024 Choir. All rights reserved.</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="#" className="text-sm font-medium hover:text-[#FF6F61] transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-[#FF6F61] transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-[#FF6F61] transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}