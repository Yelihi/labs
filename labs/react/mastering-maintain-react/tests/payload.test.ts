import { describe, expect, it } from 'vitest';
import { add, substract } from '../src/services/payload';

describe('calculator', () => {
  describe('addition', () => {
    it('returns 5 when add 2 and 3', () => {
      const result = add(2, 3);
      expect(result).toEqual(5);
    });

    it('returns 6 when add 2 and 4', () => {
      const result = add(2, 4);
      expect(result).toEqual(6);
    });
  });

  describe('substraction', () => {
    it('returns 3 when substract 6 and 3', () => {
      const result = substract(6, 3);
      expect(result).toEqual(3);
    });
  });
});
