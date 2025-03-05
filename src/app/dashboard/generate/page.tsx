"use client";
import { useState, useEffect, Suspense } from 'react';
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

// Separate client component that safely uses useSearchParams
function ContentGeneratorWithParams() {
  const [contentPrompt, setContentPrompt] = useState("");
  const [contentType, setContentType] = useState("");
  const [customContentType, setCustomContentType] = useState("");
  const [wordCount, setWordCount] = useState("500");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!user) {
      router.push('/login');
    }

    // Get content type from URL parameter if available
    const typeParam = searchParams.get('type');
    if (typeParam) {
      setContentType(typeParam);
    } else if (!contentType) {
      // Default to blog-post if no type specified and contentType is empty
      setContentType('blog-post');
    }
  }, [user, router, searchParams, contentType]);

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
          contentType: contentType === "custom" ? customContentType : contentType,
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
          contentType: contentType === "custom" ? customContentType : contentType,
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
                      ) : (
                        <>
                          <Flame className="h-4 w-4 mr-2" />
                          Generate Content
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
            
            {/* Generated Content Section */}
            <div className="md:col-span-2">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Generated Content</CardTitle>
                  <CardDescription>
                    Your AI-generated content will appear here
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-grow overflow-auto">
                  {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
                      <p className="font-medium">Error</p>
                      <p>{error}</p>
                    </div>
                  )}
                  
                  {generating ? (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                      <Loader2 className="h-12 w-12 animate-spin text-[#FF6F61] mb-4" />
                      <p className="text-lg font-medium">Generating your content...</p>
                      <p className="text-sm text-gray-500 mt-2">This may take a minute</p>
                    </div>
                  ) : generatedContent ? (
                    <div className="prose prose-sm md:prose max-w-none">
                      <ReactMarkdown>{generatedContent}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
                      <p className="text-lg mb-2">Enter a prompt and click generate</p>
                      <p className="text-sm text-center max-w-md">
                        Your content will be generated based on your prompt and branded with your unique voice.
                      </p>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="border-t pt-4 flex justify-between">
                  {generatedContent && (
                    <>
                      <Button 
                        variant="outline" 
                        className="border-[#FFB3B0] text-[#FF6F61] hover:bg-[#FFE5E5]"
                        onClick={() => {
                          // Copy to clipboard
                          navigator.clipboard.writeText(generatedContent);
                          alert('Content copied to clipboard!');
                        }}
                      >
                        Copy to Clipboard
                      </Button>
                      
                      <Button 
                        className="bg-[#FF6F61] text-white hover:bg-[#FFB3B0]"
                        onClick={handleSaveContent}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : saveSuccess ? (
                          "Saved Successfully!"
                        ) : (
                          "Save Content"
                        )}
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
          
          <div className="mt-8 mx-auto max-w-3xl">
            <h2 className="text-xl font-bold mb-4">Need Help?</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Writing effective prompts</h3>
                    <p className="text-gray-600">
                      Be specific about the topic, audience, and purpose of your content. 
                      Include key points you want to cover and the desired outcome.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Content types</h3>
                    <p className="text-gray-600">
                      Choose the most appropriate content type for your needs, or create a custom type
                      for specialized content like product descriptions or press releases.
                    </p>
                  </div>
                  
                  <div className="text-center mt-6">
                    <Link 
                      href="/dashboard/content-history" 
                      className="text-[#FF6F61] hover:text-[#FFB3B0] underline"
                    >
                      View your content history
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// Main page component that wraps the content generator with a Suspense boundary
export default function ContentGeneratorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading content generator...</span>
      </div>
    }>
      <ContentGeneratorWithParams />
    </Suspense>
  );
}