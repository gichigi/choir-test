"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/firebase/config';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from '@/components/Navigation';
import { Flame, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function ContentGeneratorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Get content type from URL parameter if available
  const typeParam = searchParams.get('type');
  
  const [contentPrompt, setContentPrompt] = useState("");
  const [contentType, setContentType] = useState(typeParam || "blog-post");
  const [customContentType, setCustomContentType] = useState("");
  const [wordCount, setWordCount] = useState("500");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Effect to redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Update content type when URL parameter changes
  useEffect(() => {
    if (typeParam) {
      setContentType(typeParam);
    }
  }, [typeParam]);

  const handleGenerateContent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!contentPrompt) {
      alert("Please enter a content prompt");
      return;
    }
    
    if (!user) {
      alert("You must be logged in to generate content");
      return;
    }

    // Validate custom content type if selected
    if (contentType === "custom" && !customContentType.trim()) {
      alert("Please enter a custom content type");
      return;
    }
    
    const finalContentType = contentType === "custom" ? customContentType : contentType;
    
    setGenerating(true);
    setError(null);
    
    try {
      // Make a real API call to our content generation endpoint
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentPrompt,
          contentType: finalContentType,
          wordCount: parseInt(wordCount),
          userId: user.uid
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }
      
      const data = await response.json();
      setGeneratedContent(data.generatedContent);
    } catch (error) {
      console.error("Error generating content:", error);
      setError(error instanceof Error ? error.message : 'An error occurred while generating content');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveContent = async () => {
    if (!user || !generatedContent) return;
    
    // Validate custom content type if selected
    if (contentType === "custom" && !customContentType.trim()) {
      alert("Please enter a custom content type");
      return;
    }
    
    const finalContentType = contentType === "custom" ? customContentType : contentType;
    
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      const token = await getFirebaseToken();
      
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      const response = await fetch('/api/content/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: contentPrompt.substring(0, 50) + (contentPrompt.length > 50 ? '...' : ''),
          content: generatedContent,
          contentType: finalContentType,
          wordCount: parseInt(wordCount)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save content');
      }
      
      setSaveSuccess(true);
      // Show success message for 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving content:', error);
      setError(error instanceof Error ? error.message : 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const getFirebaseToken = async () => {
    try {
      if (user) {
        return await auth.currentUser?.getIdToken();
      }
    } catch (error) {
      console.error("Error getting Firebase token:", error);
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#333333] flex flex-col">
      <Navigation isAuthenticated={!!user} />
      
      {/* Main content */}
      <main className="flex-grow px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold mb-2 text-center">Content Generator</h1>
          <p className="text-center text-gray-600 mb-8">Create content in your unique brand voice</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="md:col-span-1">
              <Card className="bg-[#FFE5E5] border-none">
                <form onSubmit={handleGenerateContent}>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Generation Settings</CardTitle>
                    <CardDescription>
                      Customize your content generation
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contentType">Content Type</Label>
                      <Select 
                        value={contentType} 
                        onValueChange={setContentType}
                      >
                        <SelectTrigger className="bg-white border-[#FFB3B0] focus:ring-[#FF6F61]">
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blog-post">Blog Post</SelectItem>
                          <SelectItem value="social-media">Social Media</SelectItem>
                          <SelectItem value="email">Email Campaign</SelectItem>
                          <SelectItem value="custom">Custom Content Type</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {contentType === "custom" && (
                      <div className="space-y-2">
                        <Label htmlFor="customContentType">Custom Content Type</Label>
                        <Input
                          id="customContentType"
                          value={customContentType}
                          onChange={(e) => setCustomContentType(e.target.value)}
                          placeholder="E.g., Product Description, Press Release, etc."
                          className="bg-white border-[#FFB3B0] focus:ring-[#FF6F61]"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="wordCount">Word Count (approx.)</Label>
                      <Select 
                        value={wordCount} 
                        onValueChange={setWordCount}
                      >
                        <SelectTrigger className="bg-white border-[#FFB3B0] focus:ring-[#FF6F61]">
                          <SelectValue placeholder="Select word count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="250">Short (~250 words)</SelectItem>
                          <SelectItem value="500">Medium (~500 words)</SelectItem>
                          <SelectItem value="750">Long (~750 words)</SelectItem>
                          <SelectItem value="1000">Very Long (~1000 words)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contentPrompt">Content Prompt</Label>
                      <Textarea 
                        id="contentPrompt" 
                        value={contentPrompt} 
                        onChange={(e) => setContentPrompt(e.target.value)} 
                        placeholder="Write a blog post about the benefits of our new product..." 
                        required 
                        className="bg-white border-[#FFB3B0] focus:border-[#FF6F61] focus:ring-[#FF6F61] min-h-[150px]" 
                      />
                      <p className="text-xs text-gray-500">
                        Describe what content you want to generate. Be specific about the topic, purpose, and any key points to include.
                      </p>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-[#FF6F61] text-white hover:bg-[#FFB3B0] flex items-center justify-center" 
                      disabled={generating || !contentPrompt || (contentType === "custom" && !customContentType.trim())}
                    >
                      {generating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : "Generate Content"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
            
            {/* Generated Content Section */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Generated Content</CardTitle>
                  <CardDescription>
                    {generatedContent ? 'Your generated content appears here' : 'Content will appear here after generation'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="overflow-auto max-h-[600px]">
                  {error && (
                    <div className="bg-red-50 p-4 rounded mb-4 text-red-600">
                      {error}
                    </div>
                  )}
                  
                  {generating ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Flame className="h-12 w-12 text-[#FF6F61] animate-pulse mb-4" />
                      <p className="text-lg font-medium mb-2">Generating content...</p>
                      <p className="text-sm text-gray-500">This might take a minute or two.</p>
                    </div>
                  ) : generatedContent ? (
                    <div className="prose max-w-none">
                      <ReactMarkdown>{generatedContent}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Flame className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium mb-2">No content generated yet</p>
                      <p className="text-sm text-gray-500 max-w-md mx-auto">
                        Fill out the form and click "Generate Content" to create content based on your prompt.
                      </p>
                    </div>
                  )}
                </CardContent>
                
                {generatedContent && (
                  <CardFooter className="flex justify-between">
                    <Button
                      className="bg-[#FF6F61] text-white hover:bg-[#FFB3B0]"
                      onClick={handleSaveContent}
                      disabled={saving || !generatedContent}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : saveSuccess ? (
                        "Saved!"
                      ) : (
                        "Save Content"
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="border-[#FFB3B0] text-[#FF6F61] hover:bg-[#FFE5E5]"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedContent);
                        alert("Content copied to clipboard!");
                      }}
                    >
                      Copy to Clipboard
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
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