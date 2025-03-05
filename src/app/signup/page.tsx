"use client";
import { useState } from 'react';
import { auth, db } from '@/firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Flame, ArrowRight, Loader2 } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setPasswordMismatch(false)
    
    if (password !== confirmPassword) {
      setPasswordMismatch(true)
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register');
      }

      const data = await response.json();
      console.log('User registered successfully:', data);

      // Sign in the user client-side after successful registration
      await signInWithEmailAndPassword(auth, email, password);

      // Redirect to onboarding instead of dashboard for new users
      router.push("/onboarding/business-info")
    } catch (error) {
      console.error('Error signing up', error);
      setError(error instanceof Error ? error.message : 'An error occurred during registration');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation showBackButton={true} />
      
      {/* Main content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-muted-foreground">
              Enter your information to get started
            </p>
          </div>
          
          <Card className="border shadow-sm">
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4 pt-6">
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-2">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    onChange={(e) => setEmail(e.target.value)} 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (passwordMismatch) setPasswordMismatch(confirmPassword !== e.target.value)
                    }} 
                    id="password" 
                    type="password" 
                    required
                    className={passwordMismatch ? "border-destructive" : ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input 
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (passwordMismatch) setPasswordMismatch(password !== e.target.value)
                    }} 
                    id="confirm-password" 
                    type="password" 
                    required
                    className={passwordMismatch ? "border-destructive" : ""}
                  />
                  {passwordMismatch && (
                    <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" required />
                  <label
                    htmlFor="terms"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <Link href="#" className="text-primary font-medium hover:underline">
                      terms and conditions
                    </Link>
                  </label>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full group" 
                  disabled={loading || passwordMismatch}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
                
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Choir</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © 2024 Choir. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}