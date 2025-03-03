import Link from 'next/link'
import { Flame, ArrowLeft, Menu } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useState } from 'react'

interface NavigationProps {
  showBackButton?: boolean;
  isAuthenticated?: boolean;
}

export default function Navigation({ showBackButton = false, isAuthenticated = false }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto max-w-6xl px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Flame className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">Choir</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {!showBackButton && (
            <>
              <nav className="flex items-center space-x-6">
                <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
                <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </nav>
              
              <div className="flex items-center space-x-3">
                {!isAuthenticated && (
                  <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                    Log in
                  </Link>
                )}
                <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
                  <Button size="sm" variant={isAuthenticated ? "outline" : "default"}>
                    {isAuthenticated ? "Dashboard" : "Sign up"}
                  </Button>
                </Link>
              </div>
            </>
          )}
          
          {showBackButton && (
            <Link href="/" className="flex items-center text-sm font-medium hover:text-primary transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          )}
        </div>
        
        {/* Mobile Navigation Toggle */}
        <button 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden p-4 border-t bg-background">
          {!showBackButton ? (
            <>
              <nav className="flex flex-col space-y-4 mb-4">
                <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
                <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </nav>
              
              <div className="flex flex-col space-y-3">
                {!isAuthenticated && (
                  <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                    Log in
                  </Link>
                )}
                <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
                  <Button size="sm" className="w-full" variant={isAuthenticated ? "outline" : "default"}>
                    {isAuthenticated ? "Dashboard" : "Sign up"}
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <Link href="/" className="flex items-center text-sm font-medium hover:text-primary transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          )}
        </div>
      )}
    </header>
  )
}