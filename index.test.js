import { describe, expect, test } from 'vitest';
import { readUserInput } from '.';

describe('readUserInput', () => {
  test('should throw `no input` error if no input is given', () => {
    expect(()=> readUserInput()).toThrowError('no input')
  });

  test('should throw `no destination dir` error when its not given', () => {
    process.argv = ['node', 'script', 'source/', null];
    expect(()=> readUserInput()).toThrowError('no destination dir')
  });

  test('should return correct input when no copyFlag is passed', async () => {
    process.argv = ['', '', 'source/', 'destination/'];
    const result = readUserInput();
    expect(result.source).toEqual(expect.stringContaining('source'));
    expect(result.destination).toEqual(expect.stringContaining('destination'));
    expect(result.copyFlag).toBe(false);
  });

  test('should return correct input when copyFlag is passed', async () => {
    process.argv = ['', '', 'source/', 'destination/', '-c'];
    const result = readUserInput();
    expect(result.source).toEqual(expect.stringContaining('source'));
    expect(result.destination).toEqual(expect.stringContaining('destination'));
    expect(result.copyFlag).toBe(true);
  });
});