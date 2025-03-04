import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, firestore } from '@/firebase/admin';

export async function POST(req: NextRequest) {
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
    
    // Update user document to mark onboarding as complete
    await firestore.collection('users').doc(userId).update({
      onboardingComplete: true,
      onboardingCompletedAt: new Date()
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Onboarding marked as complete' 
    });
    
  } catch (error) {
    console.error('Error marking onboarding as complete:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to mark onboarding as complete' 
    }, { 
      status: 500 
    });
  }
} 