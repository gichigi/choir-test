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
    
    // Get count of content items
    const contentRef = firestore.collection('users').doc(userId).collection('content');
    const snapshot = await contentRef.count().get();
    const count = snapshot.data().count;
    
    return NextResponse.json({ 
      success: true, 
      count
    });
    
  } catch (error) {
    console.error('Error counting content:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to count content',
      count: 0
    }, { 
      status: 500 
    });
  }
} 