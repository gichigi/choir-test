import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, firestore } from '@/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    // Get authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // Get limit from query params (default 10)
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Fetch content from Firestore, ordered by creation date
    const contentRef = firestore.collection('users').doc(userId).collection('content')
      .orderBy('created', 'desc')
      .limit(limit);
    
    const contentSnapshot = await contentRef.get();
    
    // Format the results
    const contentHistory = contentSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        contentType: data.contentType,
        toneOfVoice: data.toneOfVoice,
        created: data.created.toDate().toISOString(),
        updated: data.updated.toDate().toISOString(),
        // Don't include full content to keep response size reasonable
        preview: data.content.substring(0, 150) + (data.content.length > 150 ? '...' : '')
      };
    });
    
    return NextResponse.json({ 
      success: true, 
      contentHistory
    });
    
  } catch (error) {
    console.error('Error fetching content history:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch content history' 
    }, { 
      status: 500 
    });
  }
} 