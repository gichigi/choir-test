'use client';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '@/firebase/config';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Flame, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [brandInfo, setBrandInfo] = useState(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [contentCount, setContentCount] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();

  const getFirebaseToken = async () => {
    try {
      if (user) {
        const token = await auth.currentUser?.getIdToken();
        return token;
      }
    } catch (error) {
      console.error("Error getting Firebase token:", error);
      return null;
    }
    return null;
  };

  const handleUpgrade = async (priceId: string) => {
    setIsLoading(true);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ 
        priceId: priceId,
        metadata: {
          userId: user?.uid,
          role: 'Pro User',
        },
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId: data.sessionId });
    setIsLoading(false);
  };

  // First useEffect for authentication and role
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading && !user) {
        router.push('/login');
      }

      const fetchRole = async () => {
        try {
          const token = await getFirebaseToken();
          if (token) {
            const res = await fetch('/api/user/role', {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              }
            });

            const data = await res.json();
            setRole(data.role);
          }
        } catch (error) {
          console.error('Error fetching role:', error);
        }
      };

      if (user) {
        fetchRole();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user, loading, router]);
  
  // Second useEffect for onboarding status
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      try {
        // Check if user has completed onboarding
        const userDoc = await fetch('/api/user/onboarding', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${await getFirebaseToken()}`,
          }
        });
        
        const userData = await userDoc.json();
        setOnboardingComplete(userData.onboardingComplete);
        
        if (userData.onboardingComplete) {
          // Fetch brand information
          const brandInfoRes = await fetch('/api/brand/info', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${await getFirebaseToken()}`,
            }
          });
          
          if (brandInfoRes.ok) {
            const brandData = await brandInfoRes.json();
            setBrandInfo(brandData);
          }
        }
        
        // Set loading to false only after we've checked onboarding status
        setPageLoading(false);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setPageLoading(false);
      }
    };
    
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  // Third useEffect for content count
  useEffect(() => {
    const fetchContentCount = async () => {
      if (!user) return;
      
      try {
        const res = await fetch('/api/content/count', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${await getFirebaseToken()}`,
          }
        });
        
        const data = await res.json();
        setContentCount(data.count);
      } catch (error) {
        console.error('Error fetching content count:', error);
      }
    };
    
    if (user) {
      fetchContentCount();
    }
  }, [user]);

  // Show loading state while auth is loading or while checking onboarding status
  if (loading || (!user && typeof window !== 'undefined') || pageLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FFFFFF]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#FF6F61]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#333333] flex flex-col">
      <Navigation isAuthenticated={true} />
      {/* Main content */}
      <main className="flex-grow px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold mb-8 text-center">Welcome to Choir, {user?.email}</h1>
          
          {!onboardingComplete ? (
            <div className="flex flex-col items-center justify-center space-y-6 my-12">
              <Card className="w-full max-w-md bg-[#FFE5E5] border-none">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">Complete Your Onboarding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-center">You need to complete the onboarding process to create your brand voice.</p>
                  <Button
                    onClick={() => router.push('/onboarding/business-info')}
                    className="w-full bg-[#FF6F61] text-white hover:bg-[#FFB3B0]"
                  >
                    Complete Onboarding
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#FFE5E5] border-none">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Your Brand Voice</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Your AI-powered brand voice is ready to use.</p>
                  
                  <div className="bg-white rounded-md p-4 border border-[#FFB3B0]">
                    <h3 className="font-bold text-lg mb-2 text-[#FF6F61]">Brand Voice Status</h3>
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      <p>Active and ready to use</p>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">Your brand voice has been trained on your business profile and is ready to generate content.</p>
                  </div>
                  
                  <Button
                    className="w-full bg-[#FF6F61] text-white hover:bg-[#FFB3B0]"
                    onClick={() => router.push('/dashboard/edit-brand-voice')}
                  >
                    Edit Brand Voice
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-[#FFE5E5] border-none">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Generate Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Create marketing content in your brand's voice.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="border-[#FFB3B0] text-[#FF6F61] hover:bg-[#FFE5E5]"
                      onClick={() => router.push('/dashboard/generate?type=blog-post')}
                    >
                      Blog Post
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#FFB3B0] text-[#FF6F61] hover:bg-[#FFE5E5]"
                      onClick={() => router.push('/dashboard/generate?type=social-media')}
                    >
                      Social Media
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#FFB3B0] text-[#FF6F61] hover:bg-[#FFE5E5]"
                      onClick={() => router.push('/dashboard/generate?type=email')}
                    >
                      Email Campaign
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#FFB3B0] text-[#FF6F61] hover:bg-[#FFE5E5]"
                      onClick={() => router.push('/dashboard/generate?type=custom')}
                    >
                      Custom Content
                    </Button>
                  </div>
                  
                  <Button
                    className="w-full bg-[#FF6F61] text-white hover:bg-[#FFB3B0]"
                    onClick={() => router.push('/dashboard/generate')}
                  >
                    Content Generator
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-[#FFE5E5] border-none">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Recent Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p>Your saved content</p>
                    <span className="bg-[#FF6F61] text-white text-xs px-2 py-1 rounded-full">
                      {contentCount || 0} items
                    </span>
                  </div>
                  <Button
                    className="w-full bg-[#FF6F61] text-white hover:bg-[#FFB3B0]"
                    onClick={() => router.push('/dashboard/content-history')}
                  >
                    View Content History
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-[#FFE5E5] border-none">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Current Plan:</span>
                      <span className="font-semibold">{role || "Free User"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Email:</span>
                      <span className="font-semibold">{user?.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    {role === 'Free User' ? (
                      <Button
                        onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID as string)}
                        className="w-full bg-[#FF6F61] text-white hover:bg-[#FFB3B0]"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Loading...' : 'Upgrade Account'}
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-[#FFB3B0] text-[#333333] cursor-not-allowed"
                        disabled
                      >
                        You are already "{role}"
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => auth.signOut()}
                      variant="outline"
                      className="border-[#FFB3B0] text-[#FF6F61] hover:bg-[#FFE5E5]"
                    >
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#FFE5E5] w-full mt-12">
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