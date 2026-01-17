import { isValidObjectId } from '@/lib/utils/objectid-validation';
import { ObjectId } from 'mongodb';

describe('ObjectId Validation Unit Tests', () => {
  describe('isValidObjectId', () => {
    it('should return true for valid ObjectId strings', () => {
      const validIds = [
        new ObjectId().toString(),
        '507f1f77bcf86cd799439011',
        '123456789012345678901234',
        '000000000000000000000000',
        'ffffffffffffffffffffffff' // lowercase
      ];

      validIds.forEach(id => {
        expect(isValidObjectId(id)).toBe(true);
      });
    });

    it('should return false for invalid ObjectId strings', () => {
      const invalidIds = [
        'invalid-id',
        '123',
        'not-an-objectid',
        '507f1f77bcf86cd79943901', // too short
        '507f1f77bcf86cd7994390111', // too long
        '507f1f77bcf86cd79943901g', // invalid character
        '',
        'undefined',
        'null'
      ];

      invalidIds.forEach(id => {
        expect(isValidObjectId(id)).toBe(false);
      });
    });

    it('should return false for non-string values', () => {
      expect(isValidObjectId(null as any)).toBe(false);
      expect(isValidObjectId(undefined as any)).toBe(false);
      expect(isValidObjectId(123 as any)).toBe(false);
      expect(isValidObjectId({} as any)).toBe(false);
      expect(isValidObjectId([] as any)).toBe(false);
    });
  });
});
