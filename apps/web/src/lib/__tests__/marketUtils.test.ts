/**
 * Unit tests for market utility functions
 * Focus on binary market detection logic
 */

import {
  isBinaryMarketView,
  labelsAreYesNo,
  normalizeUiStyle,
} from '../marketUtils';

describe('marketUtils', () => {
  describe('labelsAreYesNo', () => {
    it('should return true for exact Yes/No labels', () => {
      expect(labelsAreYesNo(['Yes', 'No'])).toBe(true);
    });

    it('should return true for lowercase yes/no', () => {
      expect(labelsAreYesNo(['yes', 'no'])).toBe(true);
    });

    it('should return true for mixed case', () => {
      expect(labelsAreYesNo(['YES', 'no'])).toBe(true);
    });

    it('should return true with extra spaces', () => {
      expect(labelsAreYesNo([' Yes ', ' No '])).toBe(true);
    });

    it('should return false for non-Yes/No labels', () => {
      expect(labelsAreYesNo(['Option A', 'Option B'])).toBe(false);
    });

    it('should return false for single Yes', () => {
      expect(labelsAreYesNo(['Yes'])).toBe(false);
    });

    it('should return false for three outcomes', () => {
      expect(labelsAreYesNo(['Yes', 'No', 'Maybe'])).toBe(false);
    });

    it('should return false for empty array', () => {
      expect(labelsAreYesNo([])).toBe(false);
    });

    it('should handle undefined/null labels', () => {
      expect(labelsAreYesNo(['Yes', undefined as any])).toBe(false);
      expect(labelsAreYesNo(['Yes', null as any])).toBe(false);
    });
  });

  describe('normalizeUiStyle', () => {
    it('should convert "chance" to "binary"', () => {
      expect(normalizeUiStyle('chance')).toBe('binary');
    });

    it('should preserve "binary" style', () => {
      expect(normalizeUiStyle('binary')).toBe('binary');
    });

    it('should preserve "default" style', () => {
      expect(normalizeUiStyle('default')).toBe('default');
    });

    it('should return undefined for undefined input', () => {
      expect(normalizeUiStyle(undefined)).toBe(undefined);
    });
  });

  describe('isBinaryMarketView', () => {
    describe('explicit uiStyle detection', () => {
      it('should return true for uiStyle "binary"', () => {
        const market = { uiStyle: 'binary' };
        expect(isBinaryMarketView(market)).toBe(true);
      });

      it('should return true for uiStyle "chance" (normalized to binary)', () => {
        const market = { uiStyle: 'chance' };
        expect(isBinaryMarketView(market)).toBe(true);
      });

      it('should return false for uiStyle "default"', () => {
        const market = { uiStyle: 'default' };
        expect(isBinaryMarketView(market)).toBe(false);
      });

      it('should return false for undefined uiStyle', () => {
        const market = { uiStyle: undefined } as any;
        expect(isBinaryMarketView(market)).toBe(false);
      });
    });

    describe('Yes/No label detection', () => {
      it('should return true for Yes/No outcomes', () => {
        const market = {
          outcomes: [{ name: 'Yes' }, { name: 'No' }],
        };
        expect(isBinaryMarketView(market)).toBe(true);
      });

      it('should return true for yes/no outcomes', () => {
        const market = {
          outcomes: [{ name: 'yes' }, { name: 'no' }],
        };
        expect(isBinaryMarketView(market)).toBe(true);
      });

      it('should return true for mixed case Yes/No', () => {
        const market = {
          outcomes: [{ name: 'YES' }, { name: 'no' }],
        };
        expect(isBinaryMarketView(market)).toBe(true);
      });

      it('should return true for outcomes with label property', () => {
        const market = {
          outcomes: [{ label: 'Yes' }, { label: 'No' }],
        };
        expect(isBinaryMarketView(market)).toBe(true);
      });

      it('should return false for non-Yes/No outcomes', () => {
        const market = {
          outcomes: [{ name: 'Option A' }, { name: 'Option B' }],
        };
        expect(isBinaryMarketView(market)).toBe(false);
      });

      it('should return false for single outcome', () => {
        const market = {
          outcomes: [{ name: 'Yes' }],
        };
        expect(isBinaryMarketView(market)).toBe(false);
      });

      it('should return false for three outcomes', () => {
        const market = {
          outcomes: [{ name: 'Yes' }, { name: 'No' }, { name: 'Maybe' }],
        };
        expect(isBinaryMarketView(market)).toBe(false);
      });

      it('should return false for empty outcomes', () => {
        const market = { outcomes: [] };
        expect(isBinaryMarketView(market)).toBe(false);
      });

      it('should return false for undefined outcomes', () => {
        const market = { outcomes: undefined } as any;
        expect(isBinaryMarketView(market)).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle empty market object', () => {
        expect(isBinaryMarketView({})).toBe(false);
      });

      it('should handle null market', () => {
        expect(isBinaryMarketView(null as any)).toBe(false);
      });

      it('should handle undefined market', () => {
        expect(isBinaryMarketView(undefined as any)).toBe(false);
      });

      it('should prioritize uiStyle over outcomes', () => {
        const market = {
          uiStyle: 'binary',
          outcomes: [{ name: 'Option A' }, { name: 'Option B' }],
        };
        expect(isBinaryMarketView(market)).toBe(true);
      });

      it('should fall back to outcomes when uiStyle is not binary', () => {
        const market = {
          uiStyle: 'default',
          outcomes: [{ name: 'Yes' }, { name: 'No' }],
        };
        expect(isBinaryMarketView(market)).toBe(true);
      });
    });

    describe('real-world scenarios', () => {
      it('should detect true binary markets (Yes/No questions)', () => {
        const binaryMarket = {
          uiStyle: undefined,
          outcomes: [
            { name: 'Yes', probability: 60 },
            { name: 'No', probability: 40 },
          ],
        } as any;
        expect(isBinaryMarketView(binaryMarket)).toBe(true);
      });

      it('should detect fake binary markets (two candidates)', () => {
        const fakeBinaryMarket = {
          uiStyle: undefined,
          outcomes: [
            { name: 'Candidate A', probability: 60 },
            { name: 'Candidate B', probability: 40 },
          ],
        } as any;
        expect(isBinaryMarketView(fakeBinaryMarket)).toBe(false);
      });

      it('should detect multi-candidate markets', () => {
        const multiMarket = {
          uiStyle: undefined,
          outcomes: [
            { name: 'Candidate A', probability: 40 },
            { name: 'Candidate B', probability: 35 },
            { name: 'Candidate C', probability: 25 },
          ],
        } as any;
        expect(isBinaryMarketView(multiMarket)).toBe(false);
      });

      it('should detect explicitly tagged binary markets', () => {
        const taggedBinaryMarket = {
          uiStyle: 'binary',
          outcomes: [
            { name: 'Candidate A', probability: 60 },
            { name: 'Candidate B', probability: 40 },
          ],
        };
        expect(isBinaryMarketView(taggedBinaryMarket)).toBe(true);
      });
    });
  });
});
