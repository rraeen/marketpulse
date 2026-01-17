import { cookies } from 'next/headers';
import { verifyToken } from './services/auth';
import { getDb } from './db';
import { ObjectId } from 'mongodb';

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) return null;

  const decoded = await verifyToken(token);
  if (!decoded) return null;

  const db = await getDb();
  const user = await db.collection('users').findOne(
    { _id: new ObjectId(decoded.userId) },
    { projection: { passwordHash: 0 } }
  );

  return user;
}

export async function isAdmin() {
  const user = await getSessionUser();
  return user?.role === 'Admin';
}
