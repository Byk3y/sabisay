import {
  truncateAddress,
  getAddressInitials,
  generateAddressGradient,
} from '../utils';

describe('Address formatting utilities', () => {
  describe('truncateAddress', () => {
    it('should truncate a standard Ethereum address', () => {
      const address = '0x4244BE8fA36a38a440C958';
      const result = truncateAddress(address);
      expect(result).toBe('0x4244...C958');
    });

    it('should handle empty string', () => {
      const result = truncateAddress('');
      expect(result).toBe('');
    });

    it('should handle short strings', () => {
      const short = '0x123';
      const result = truncateAddress(short);
      expect(result).toBe('0x123');
    });

    it('should handle malformed strings', () => {
      const malformed = 'not-an-address';
      const result = truncateAddress(malformed);
      expect(result).toBe('not-an...ress');
    });

    it('should use custom start and end lengths', () => {
      const address = '0x4244BE8fA36a38a440C958';
      const result = truncateAddress(address, 4, 6);
      expect(result).toBe('0x42...40C958');
    });
  });

  describe('getAddressInitials', () => {
    it('should extract initials from Ethereum address', () => {
      const address = '0x4244BE8fA36a38a440C958';
      const result = getAddressInitials(address);
      expect(result).toBe('42');
    });

    it('should handle empty string', () => {
      const result = getAddressInitials('');
      expect(result).toBe('U');
    });

    it('should handle short addresses', () => {
      const short = '0x';
      const result = getAddressInitials(short);
      expect(result).toBe('0x');
    });

    it('should handle non-Ethereum addresses', () => {
      const nonEth = 'abc123';
      const result = getAddressInitials(nonEth);
      expect(result).toBe('AB');
    });
  });

  describe('generateAddressGradient', () => {
    it('should generate a gradient for valid address', () => {
      const address = '0x4244BE8fA36a38a440C958';
      const result = generateAddressGradient(address);
      expect(result).toMatch(
        /^linear-gradient\(135deg, rgb\(\d+, \d+, \d+\), rgb\(\d+, \d+, \d+\)\)$/
      );
    });

    it('should return default gradient for empty address', () => {
      const result = generateAddressGradient('');
      expect(result).toBe('linear-gradient(135deg, #3B82F6, #1D4ED8)');
    });

    it('should generate consistent gradients for same address', () => {
      const address = '0x4244BE8fA36a38a440C958';
      const result1 = generateAddressGradient(address);
      const result2 = generateAddressGradient(address);
      expect(result1).toBe(result2);
    });
  });
});
