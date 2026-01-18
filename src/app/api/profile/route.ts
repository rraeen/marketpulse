import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-helper';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { isPremiumInterested } = await request.json();

    if (typeof isPremiumInterested !== 'boolean') {
      return NextResponse.json(
        { error: 'isPremiumInterested must be a boolean' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Ensure _id is an ObjectId
    const userId = user._id instanceof ObjectId ? user._id : new ObjectId(user._id);
    
    console.log('Updating user preference:', {
      userId: userId.toString(),
      isPremiumInterested
    });

    const result = await db.collection('users').findOneAndUpdate(
      { _id: userId },
      { $set: { isPremiumInterested } },
      { returnDocument: 'after', projection: { passwordHash: 0 } }
    );

    console.log('Update result:', {
      found: !!result,
      value: result ? 'exists' : 'null'
    });

    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = result;

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
