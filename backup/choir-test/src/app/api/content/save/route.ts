import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, firestore } from '@/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract the token
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const { title, content, contentType, wordCount } = await req.json();
    
    if (!title || !content || !contentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Save to Firestore
    const contentRef = firestore.collection('contents').doc();
    
    await contentRef.set({
      userId,
      title,
      content,
      contentType,
      wordCount: wordCount || 0,
      createdAt: new Date().toISOString(),
    });
    
    return NextResponse.json({ 
      message: 'Content saved successfully',
      contentId: contentRef.id 
    });
  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
} 