"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase/config';
import { doc, updateDoc, collection, getDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from '@/components/Navigation';
import { Flame } from 'lucide-react';
import Link from 'next/link';

export default function TargetAudiencePage() {
  const [targetAudience, setTargetAudience] = useState("");
  const [businessValues, setBusinessValues] = useState("");
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
      // Get reference to the brandInformation document for this user
      const brandInfoRef = doc(collection(db, 'brandInformation'), user.uid);
      
      // Check if the document exists to ensure they've completed previous steps
      const docSnap = await getDoc(brandInfoRef);
      
      if (!docSnap.exists()) {
        alert("Please complete the previous steps first");
        router.push('/onboarding/business-info');
        return;
      }
      
      // Update the document with target audience and business values
      await updateDoc(brandInfoRef, {
        targetAudience,
        businessValues,
        updatedAt: new Date().toISOString(),
      });
      
      // Move to the review page
      router.push('/onboarding/review');
    } catch (error) {
      console.error("Error saving audience and values:", error);
      alert("There was an error saving your information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#333333] flex flex-col">
      <Navigation showBackButton={true} />
      
      {/* Main content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md bg-[#FFE5E5] border-none">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Who do you serve?</CardTitle>
              <CardDescription className="text-center">
                Step 3 of 4: Define your audience and values
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Textarea 
                  id="targetAudience" 
                  value={targetAudience} 
                  onChange={(e) => setTargetAudience(e.target.value)} 
                  placeholder="Small business owners who need marketing help..." 
                  required 
                  className="bg-white border-[#FFB3B0] focus:border-[#FF6F61] focus:ring-[#FF6F61] min-h-[100px]" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe your ideal customers, clients, or audience. What are their needs, pain points, and demographics?
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessValues">Business Values</Label>
                <Textarea 
                  id="businessValues" 
                  value={businessValues} 
                  onChange={(e) => setBusinessValues(e.target.value)} 
                  placeholder="We value transparency, innovation, and customer success..." 
                  required 
                  className="bg-white border-[#FFB3B0] focus:border-[#FF6F61] focus:ring-[#FF6F61] min-h-[100px]" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  What values drive your business? What principles do you prioritize in your work?
                </p>
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
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-[#FFB3B0] text-[#FF6F61] hover:bg-[#FFE5E5]"
                onClick={() => router.back()}
              >
                Back
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