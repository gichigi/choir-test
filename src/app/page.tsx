'use client';
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Flame,
  ServerIcon, 
  FlameIcon, 
  CreditCardIcon, 
  LockIcon, 
  SmartphoneIcon, 
  PaintbrushIcon,
  ArrowRight,
  Sparkles,
  CheckCircle
} from 'lucide-react'

// Note: Metadata must be in a separate server component file since this is a client component
// We're defining this in layout.tsx instead

export default function HomePage() {
  const { user, loading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(user !== null);
  }, [user]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation isAuthenticated={isAuthenticated ?? false} />
      
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-darkgray-lighter text-darkgray mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Brand Voice AI Technology</span>
            </div>
            
            <h1 className="font-bold tracking-tight mb-6 max-w-3xl">
              Create Your Perfect
              <span className="text-primary"> Brand Voice</span>
            </h1>
            
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mb-10">
              Choir builds a unique AI-powered brand voice for your business in minutes. Generate content that sounds exactly like your brand, every time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="group">
                  Create Your Brand Voice
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-bold mb-4">Features That Make Your Brand Stand Out</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our AI tools help businesses create consistent, authentic content that resonates with their audience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <PaintbrushIcon className="h-10 w-10 text-primary mb-2" />, 
                title: 'AI-Powered Brand Voice', 
                description: 'Create a unique brand voice that captures your company\'s personality and values.'
              },
              { 
                icon: <FlameIcon className="h-10 w-10 text-primary mb-2" />, 
                title: 'Lightning Fast Setup', 
                description: 'Answer a few simple questions about your business and get your brand voice in minutes.'
              },
              { 
                icon: <SmartphoneIcon className="h-10 w-10 text-primary mb-2" />, 
                title: 'Content Generation', 
                description: 'Generate blog posts, social media content, and emails that sound like your brand.'
              },
              { 
                icon: <ServerIcon className="h-10 w-10 text-primary mb-2" />, 
                title: 'Advanced AI Technology', 
                description: 'Our sophisticated AI models ensure high-quality, relevant content every time.'
              },
              { 
                icon: <LockIcon className="h-10 w-10 text-primary mb-2" />, 
                title: 'Safe & Secure', 
                description: 'Your brand voice and all generated content remains private and secure.'
              },
              { 
                icon: <CreditCardIcon className="h-10 w-10 text-primary mb-2" />, 
                title: 'Flexible Pricing', 
                description: 'Choose the plan that fits your needs, from startups to enterprise businesses.'
              },
            ].map((feature, index) => (
              <Card key={index} className="border-none hover:shadow-lg transition-all">
                <CardHeader>
                  {feature.icon}
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-bold mb-4">How Choir Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Creating your custom brand voice is simple with our guided process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Complete Quick Onboarding',
                description: 'Answer questions about your business, brand values, and target audience.'
              },
              {
                step: '02',
                title: 'AI Creates Your Brand Voice',
                description: 'Our AI analyzes your inputs to create a unique brand voice profile.'
              },
              {
                step: '03',
                title: 'Generate Content',
                description: 'Use your brand voice to create consistent, authentic content for any channel.'
              }
            ].map((item, index) => (
              <div key={index} className="relative pl-12">
                <div className="absolute left-0 top-0 flex justify-center items-center w-8 h-8 rounded-full bg-primary text-white font-semibold text-sm">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Businesses of all sizes are creating consistent content with Choir.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                quote: "Choir has completely transformed how we create content. Our marketing team saves hours every week, and our brand voice is more consistent than ever.",
                author: "Sarah Johnson",
                role: "Marketing Director, TechStart Inc."
              },
              {
                quote: "As a small business owner, I don't have time to write perfect copy. Choir does it for me, capturing exactly how I want my brand to sound to customers.",
                author: "Michael Chen",
                role: "Founder, Artisan Goods"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-none">
                <CardContent className="pt-6">
                  <div className="flex flex-col h-full">
                    <div className="mb-6 text-lg font-medium italic">
                      "{testimonial.quote}"
                    </div>
                    <div className="mt-auto">
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="border-none bg-muted">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Stay Updated</CardTitle>
              <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                Subscribe to our newsletter for the latest features and tips.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-background"
                />
                <Button type="submit" className="w-full">
                  Subscribe
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <h2 className="font-bold mb-6 text-3xl sm:text-4xl md:text-5xl">
              Ready to Find Your Brand Voice?
            </h2>
            <p className="max-w-[600px] text-lg text-primary-foreground/80 mb-8">
              Join thousands of businesses creating authentic, engaging content with Choir's brand voice technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="text-primary">
                  Create Your Brand Voice
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10">
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-2">
              <Flame className="h-6 w-6 text-primary" />
              <span className="font-semibold">Choir</span>
            </div>
            
            <nav className="flex items-center space-x-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
            </nav>
            
            <div className="text-sm text-muted-foreground">
              © 2024 Choir. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}