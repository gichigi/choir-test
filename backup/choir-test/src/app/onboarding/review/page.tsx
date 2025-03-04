"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase/config';
import { doc, updateDoc, collection, getDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Navigation from '@/components/Navigation';
import { Flame, Check, AlertCircle, Loader2, Sparkles, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from 'react-markdown';

type BrandInformation = {
  businessName: string;
  yearStarted: string;
  businessDescription: string;
  targetAudience: string;
  businessValues: string;
  brandVoice?: string;
  updatedAt?: string;
};

export default function ReviewPage() {
  const [brandInfo, setBrandInfo] = useState<BrandInformation | null>(null);
  const [editedBrandInfo, setEditedBrandInfo] = useState<BrandInformation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const { user } = useAuth();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchBrandInfo = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const brandInfoRef = doc(collection(db, 'brandInformation'), user.uid);
        const docSnap = await getDoc(brandInfoRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as BrandInformation;
          setBrandInfo(data);
          setEditedBrandInfo(data);
        } else {
          setError("Couldn't find your business information. Please complete the previous steps.");
        }
      } catch (err) {
        setError("An error occurred while fetching your information.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandInfo();
  }, [user]);

  // Debounced auto-save function
  const debouncedSave = useCallback(
    // Use a simple debounce to prevent excessive writes
    debounce(async (data: BrandInformation) => {
      if (!user) return;
      
      setSaveStatus('saving');
      
      try {
        const brandInfoRef = doc(collection(db, 'brandInformation'), user.uid);
        await updateDoc(brandInfoRef, {
          ...data,
          updatedAt: new Date().toISOString(),
        });
        
        setBrandInfo(data);
        setSaveStatus('saved');
        
        // Reset to idle after 2 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      } catch (error) {
        console.error("Error saving changes:", error);
        setError("There was an error saving your changes. Please try again.");
        setSaveStatus('idle');
      }
    }, 1000),
    [user]
  );

  // Create a debounce function since we're using it inline
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function(...args: any[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  const handleUpdateField = (field: keyof BrandInformation, value: string) => {
    if (!editedBrandInfo) return;
    
    const updatedInfo = { ...editedBrandInfo, [field]: value };
    setEditedBrandInfo(updatedInfo);
    
    // Trigger auto-save
    debouncedSave(updatedInfo);
  };

  const handleGenerateVoice = async () => {
    if (!user || !editedBrandInfo) return;
    
    setGenerating(true);
    setShowSuccess(false);
    
    try {
      // Call OpenAI API to generate brand voice
      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: editedBrandInfo.businessName,
          businessDescription: editedBrandInfo.businessDescription,
          targetAudience: editedBrandInfo.targetAudience,
          businessValues: editedBrandInfo.businessValues
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate brand voice');
      }

      const data = await response.json();
      
      // Save generated voice to Firestore
      const brandInfoRef = doc(collection(db, 'brandInformation'), user.uid);
      await updateDoc(brandInfoRef, {
        brandVoice: data.brandVoice,
        updatedAt: new Date().toISOString(),
      });

      // Mark onboarding as complete
      const token = await user.getIdToken();
      const completeResponse = await fetch('/api/user/onboarding/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!completeResponse.ok) {
        console.warn("Failed to mark onboarding as complete:", await completeResponse.text());
      }

      setEditedBrandInfo({ ...editedBrandInfo, brandVoice: data.brandVoice });
      setBrandInfo({ ...editedBrandInfo, brandVoice: data.brandVoice });
      setShowSuccess(true);
    } catch (error) {
      console.error("Error generating brand voice:", error);
      setError("There was an error generating your brand voice. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#FF6F61] animate-spin" />
        <span className="ml-2">Loading your information...</span>
      </div>
    );
  }

  if (error || !brandInfo) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col">
        <Navigation showBackButton={true} />
        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md bg-[#FFE5E5] border-none">
            <CardHeader className="space-y-1">
              <AlertCircle className="h-10 w-10 text-[#FF6F61] mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold text-center">Something went wrong</CardTitle>
              <CardDescription className="text-center">
                {error || "Please complete all previous steps before reviewing your information."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                className="w-full bg-[#FF6F61] text-white hover:bg-[#FFB3B0]"
                onClick={() => router.push('/onboarding/business-info')}
              >
                Start Over
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#333333] flex flex-col">
      <Navigation showBackButton={true} />
      
      {/* Main content */}
      <main className="flex-grow px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold mb-8 text-center">Review & Generate Your Brand Voice</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="md:col-span-1">
              <Card className="bg-[#FFE5E5] border-none sticky top-4">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Business Information</CardTitle>
                  <CardDescription>
                    Review and edit your business details
                    {saveStatus === 'saving' && <span className="ml-2 text-yellow-600">Saving...</span>}
                    {saveStatus === 'saved' && <span className="ml-2 text-green-600">Saved</span>}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={editedBrandInfo?.businessName || ''}
                      onChange={(e) => handleUpdateField('businessName', e.target.value)}
                      className="bg-white border-[#FFB3B0] focus:ring-[#FF6F61]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="yearStarted">Year Started</Label>
                    <Input
                      id="yearStarted"
                      value={editedBrandInfo?.yearStarted || ''}
                      onChange={(e) => handleUpdateField('yearStarted', e.target.value)}
                      className="bg-white border-[#FFB3B0] focus:ring-[#FF6F61]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessDescription">Business Description</Label>
                    <Textarea
                      id="businessDescription"
                      value={editedBrandInfo?.businessDescription || ''}
                      onChange={(e) => handleUpdateField('businessDescription', e.target.value)}
                      className="bg-white border-[#FFB3B0] focus:ring-[#FF6F61] min-h-[100px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Textarea
                      id="targetAudience"
                      value={editedBrandInfo?.targetAudience || ''}
                      onChange={(e) => handleUpdateField('targetAudience', e.target.value)}
                      className="bg-white border-[#FFB3B0] focus:ring-[#FF6F61] min-h-[100px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessValues">Business Values</Label>
                    <Textarea
                      id="businessValues"
                      value={editedBrandInfo?.businessValues || ''}
                      onChange={(e) => handleUpdateField('businessValues', e.target.value)}
                      className="bg-white border-[#FFB3B0] focus:ring-[#FF6F61] min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Brand Voice Display Section */}
            <div className="md:col-span-2">
              <Card className="bg-white border border-[#FFB3B0]">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Your Brand Voice</CardTitle>
                  <CardDescription>
                    Generate your unique AI-powered brand voice
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {generating ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4">
                      <Loader2 className="h-12 w-12 text-[#FF6F61] animate-spin" />
                      <p className="text-center text-gray-500">
                        Generating your brand voice...
                      </p>
                    </div>
                  ) : editedBrandInfo?.brandVoice ? (
                    <div className="prose max-w-none">
                      <div className="bg-white rounded-md p-6 border border-[#FFB3B0]">
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-[#FF6F61] mb-4" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-[#FF6F61] mb-3" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-[#FF6F61] mb-2" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold text-[#FF6F61]" {...props} />
                          }}
                        >
                          {editedBrandInfo.brandVoice}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center text-gray-500">
                      <Sparkles className="h-12 w-12 text-[#FF6F61]" />
                      <p>
                        Click the button below to generate your AI-powered brand voice.
                      </p>
                      <p className="text-sm">
                        We'll analyze your business information to create a unique voice that matches your brand.
                      </p>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-center">
                  <Button
                    onClick={handleGenerateVoice}
                    className="bg-[#FF6F61] text-white hover:bg-[#FFB3B0] flex items-center justify-center px-8"
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : editedBrandInfo?.brandVoice ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Regenerate Brand Voice
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Brand Voice
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Success Message and Dashboard Button (only shown after generation) */}
              {showSuccess && editedBrandInfo?.brandVoice && (
                <div className="mt-6 animate-fadeIn">
                  <Card className="bg-green-50 border-green-200 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center space-y-4 p-4">
                        <div className="bg-green-100 p-3 rounded-full">
                          <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-green-800">Your Brand Voice Is Ready!</h3>
                        <p className="text-green-700">
                          Congratulations! You've successfully created your unique brand voice. 
                          Now you can start generating content with your brand's personality.
                        </p>
                        <Button
                          onClick={() => router.push('/dashboard')}
                          className="bg-green-600 hover:bg-green-700 text-white mt-2 flex items-center space-x-2 px-6 py-5"
                          size="lg"
                        >
                          <Home className="h-5 w-5 mr-2" />
                          <span>Go to Dashboard</span>
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
          
          {/* Dashboard Button (always visible at bottom of page) */}
          <div className="flex justify-center mt-12">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="border-[#FFB3B0] text-[#FF6F61] hover:bg-[#FFE5E5] flex items-center space-x-2 px-8"
              size="lg"
            >
              <Home className="h-5 w-5 mr-2" />
              <span>Return to Dashboard</span>
            </Button>
          </div>
        </div>
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