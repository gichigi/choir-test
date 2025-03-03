import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, firestore } from '@/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get token
    const token = authHeader.split('Bearer ')[1];
    
    // Verify token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Get brand information document from Firestore
    const brandInfoDoc = await firestore.collection('brandInformation').doc(uid).get();
    
    if (!brandInfoDoc.exists) {
      return NextResponse.json({ error: 'Brand information not found' }, { status: 404 });
    }

    const brandData = brandInfoDoc.data();
    
    return NextResponse.json(brandData);
  } catch (error) {
    console.error('Error fetching brand information:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}