import { ObjectId } from 'mongodb';

/**
 * Validates if a string is a valid MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  try {
    return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
  } catch {
    return false;
  }
}

/**
 * Safely converts a string to ObjectId, throws error if invalid
 */
export function toObjectId(id: string, errorMessage = 'Invalid ID format'): ObjectId {
  if (!isValidObjectId(id)) {
    throw new Error(errorMessage);
  }
  return new ObjectId(id);
}
