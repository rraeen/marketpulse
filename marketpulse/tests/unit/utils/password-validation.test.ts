import { validatePasswordStrength } from '@/lib/utils/password-validation';

describe('Password Validation Unit Tests', () => {
  describe('validatePasswordStrength', () => {
    it('should accept strong passwords', () => {
      const strongPasswords = [
        'Test@1234',
        'MyP@ssw0rd',
        'SecurePass123!',
        'Abc@123456'
      ];

      strongPasswords.forEach(password => {
        const result = validatePasswordStrength(password);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject passwords that are too short', () => {
      const result = validatePasswordStrength('Ab@1');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('8 characters');
    });

    it('should reject passwords without uppercase', () => {
      const result = validatePasswordStrength('test@1234');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject passwords without lowercase', () => {
      const result = validatePasswordStrength('TEST@1234');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject passwords without numbers', () => {
      const result = validatePasswordStrength('TestPassword@');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject passwords without special characters', () => {
      const result = validatePasswordStrength('TestPassword123');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject empty password', () => {
      const result = validatePasswordStrength('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
