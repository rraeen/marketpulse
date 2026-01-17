import { ObjectId } from 'mongodb';

/**
 * Validates if a string is a valid MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  try {
    if (!id || typeof id !== 'string') {
      return false;
    }
    const trimmed = id.trim();
    
    // Check if it's a valid ObjectId format (24 hex characters)
    if (!ObjectId.isValid(trimmed)) {
      return false;
    }
    
    // Try to create ObjectId to verify it can be instantiated
    // This catches any edge cases where isValid() might return true but
    // the string can't actually be converted to ObjectId
    try {
      new ObjectId(trimmed);
      return true;
    } catch {
      return false;
    }
  } catch (error) {
    console.error("isValidObjectId error:", error, "ID:", id);
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
