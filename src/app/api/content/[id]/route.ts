import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, firestore } from '@/firebase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get content ID from URL
    const contentId = params.id;
    
    // Get authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // Fetch content from Firestore
    const contentDoc = await firestore
      .collection('users')
      .doc(userId)
      .collection('content')
      .doc(contentId)
      .get();
    
    if (!contentDoc.exists) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    
    const contentData = contentDoc.data();
    
    return NextResponse.json({ 
      success: true, 
      content: {
        id: contentDoc.id,
        ...contentData,
        created: contentData?.created.toDate().toISOString(),
        updated: contentData?.updated.toDate().toISOString(),
      }
    });
    
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch content' 
    }, { 
      status: 500 
    });
  }
} 