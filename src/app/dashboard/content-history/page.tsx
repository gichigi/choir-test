"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/firebase/config';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Navigation from '@/components/Navigation';
import { ArrowUpDown, Calendar, Copy, Loader2, Search, SortAlphaAsc, SortAlphaDesc, Type, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

// Define the content item type
type ContentItem = {
  id: string;
  title: string;
  preview: string;
  content?: string;
  contentType: string;
  toneOfVoice: string;
  created: string;
  updated: string;
};

export default function ContentHistoryPage() {
  const [contentHistory, setContentHistory] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();

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

  // Fetch content history
  useEffect(() => {
    async function fetchContentHistory() {
      if (!user) {
        router.push('/login');
        return;
      }
      
      try {
        setLoading(true);
        const token = await getFirebaseToken();
        
        if (!token) {
          throw new Error('Authentication token not available');
        }
        
        const response = await fetch('/api/content/history', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch content history');
        }
        
        const data = await response.json();
        setContentHistory(data.contentHistory || []);
      } catch (error) {
        console.error('Error fetching content history:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch content history');
      } finally {
        setLoading(false);
      }
    }
    
    fetchContentHistory();
  }, [user, router]);

  // Handle sorting
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleSortByDate = () => {
    setSortBy('date');
    if (sortBy === 'date') {
      toggleSortDirection();
    } else {
      setSortDirection('desc'); // Default to newest first
    }
  };

  const handleSortByTitle = () => {
    setSortBy('title');
    if (sortBy === 'title') {
      toggleSortDirection();
    } else {
      setSortDirection('asc'); // Default to A-Z
    }
  };

  // Filter and sort content
  const filteredAndSortedContent = contentHistory
    .filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contentType.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.created).getTime() - new Date(b.created).getTime()
          : new Date(b.created).getTime() - new Date(a.created).getTime();
      } else {
        return sortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });

  // View content details
  const handleViewContent = async (contentId: string) => {
    try {
      const token = await getFirebaseToken();
      
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      const response = await fetch(`/api/content/${contentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch content details');
      }
      
      const data = await response.json();
      setSelectedContent(data.content);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching content details:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch content details');
    }
  };

  // Copy content to clipboard
  const handleCopyContent = () => {
    if (selectedContent?.content) {
      navigator.clipboard.writeText(selectedContent.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Format content type for display
  const formatContentType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#333333] flex flex-col">
      <Navigation isAuthenticated={true} />
      
      {/* Main content */}
      <main className="flex-grow px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold mb-8 text-center">Your Content History</h1>
          
          {/* Search and sort controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search content..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-[#FFB3B0] focus:border-[#FF6F61] focus:ring-[#FF6F61]"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'date' ? 'default' : 'outline'}
                onClick={handleSortByDate}
                className={sortBy === 'date' ? 'bg-[#FF6F61] text-white hover:bg-[#FFB3B0]' : 'border-[#FFB3B0] text-[#FF6F61] hover:bg-[#FFE5E5]'}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Date
                {sortBy === 'date' && (
                  sortDirection === 'asc' 
                    ? <ArrowUpDown className="h-4 w-4 ml-2" /> 
                    : <ArrowUpDown className="h-4 w-4 ml-2" />
                )}
              </Button>
              
              <Button
                variant={sortBy === 'title' ? 'default' : 'outline'}
                onClick={handleSortByTitle}
                className={sortBy === 'title' ? 'bg-[#FF6F61] text-white hover:bg-[#FFB3B0]' : 'border-[#FFB3B0] text-[#FF6F61] hover:bg-[#FFE5E5]'}
              >
                <Type className="h-4 w-4 mr-2" />
                Title
                {sortBy === 'title' && (
                  sortDirection === 'asc' 
                    ? <SortAlphaAsc className="h-4 w-4 ml-2" /> 
                    : <SortAlphaDesc className="h-4 w-4 ml-2" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Content list */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <Loader2 className="h-12 w-12 text-[#FF6F61] animate-spin" />
              <p className="text-center text-gray-500">
                Loading your content history...
              </p>
            </div>
          ) : error ? (
            <Card className="bg-red-50 border border-red-200">
              <CardContent className="pt-6">
                <p className="text-red-600">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="mt-4 border-red-300 text-red-600 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredAndSortedContent.length === 0 ? (
            <Card className="bg-[#FFE5E5] border-none">
              <CardContent className="pt-6 flex flex-col items-center">
                {searchQuery ? (
                  <>
                    <p className="text-center mb-4">No content matches your search.</p>
                    <Button 
                      onClick={() => setSearchQuery('')} 
                      variant="outline"
                      className="border-[#FFB3B0] text-[#FF6F61] hover:bg-[#FFE5E5]"
                    >
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-center mb-4">You haven't created any content yet.</p>
                    <Button 
                      onClick={() => router.push('/dashboard/generate')} 
                      className="bg-[#FF6F61] text-white hover:bg-[#FFB3B0]"
                    >
                      Generate Content
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAndSortedContent.map((item) => (
                <Card 
                  key={item.id} 
                  className="bg-white border border-[#FFB3B0] hover:shadow-md transition-shadow"
                  onClick={() => handleViewContent(item.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-[#FF6F61] mb-1 sm:mb-0">{item.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className="bg-[#FFE5E5] px-2 py-1 rounded-full text-xs">
                          {formatContentType(item.contentType)}
                        </span>
                        <span>
                          {format(new Date(item.created), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{item.preview}</p>
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto border-[#FFB3B0] text-[#FF6F61] hover:bg-[#FFE5E5]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewContent(item.id);
                      }}
                    >
                      View Content
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Content view dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#FF6F61]">
              {selectedContent?.title}
            </DialogTitle>
            <DialogDescription className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="bg-[#FFE5E5] px-2 py-1 rounded-full text-xs">
                {selectedContent?.contentType && formatContentType(selectedContent.contentType)}
              </span>
              <span>
                {selectedContent?.created && format(new Date(selectedContent.created), 'MMM d, yyyy')}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="prose max-w-none my-4">
            {selectedContent?.content && (
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-[#FF6F61] mb-4" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-[#FF6F61] mb-3" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-[#FF6F61] mb-2" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
                  li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-bold text-[#FF6F61]" {...props} />,
                  em: ({ node, ...props }) => <em className="text-gray-600 italic" {...props} />,
                  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-[#FFB3B0] pl-4 py-2 my-4 bg-[#FFE5E5] bg-opacity-30 italic" {...props} />,
                  hr: ({ node, ...props }) => <hr className="my-6 border-t-2 border-[#FFB3B0]" {...props} />
                }}
              >
                {selectedContent.content}
              </ReactMarkdown>
            )}
          </div>
          
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              className="border-[#FFB3B0] text-[#FF6F61] hover:bg-[#FFE5E5]"
              onClick={() => setViewDialogOpen(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button
              className="bg-[#FF6F61] text-white hover:bg-[#FFB3B0]"
              onClick={handleCopyContent}
            >
              {copySuccess ? (
                <>
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 