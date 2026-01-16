import { validateEmail, validateName, validatePassword } from '@/lib/utils/validation';

describe('Validation Utils Unit Tests', () => {
  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'admin+tag@marketpulse.com',
        'name123@test.org'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com',
        '',
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('validateName', () => {
    it('should accept valid names', () => {
      const validNames = [
        'John Doe',
        'Jane',
        'Mary-Anne Smith',
        "O'Brien",
        'José García',
        'AB' // minimum 2 characters
      ];

      validNames.forEach(name => {
        const result = validateName(name);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject empty name', () => {
      const result = validateName('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('2 characters');
    });

    it('should reject name that is too short', () => {
      const result = validateName('A');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('2 characters');
    });

    it('should reject whitespace-only name', () => {
      const result = validateName('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('2 characters');
    });
  });

  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      const result = validatePassword('Test@1234');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('123');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
