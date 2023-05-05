import { describe, expect, test } from 'vitest';
import { readUserInput, handleUserInput } from '..';

describe('readUserInput', () => {
  test('should throw `no input` error if no input is given', () => {
    expect(()=> readUserInput()).toThrowError('no input');
  });

  test('should throw `no destination dir` error when its not given', () => {
    process.argv = ['node', 'script', 'source/', null];
    expect(()=> readUserInput()).toThrowError('no destination dir');
  });

  test('should return correct input when no copyFlag is passed', async () => {
    process.argv = ['node', 'script', 'source/', 'destination/'];
    const result = readUserInput();
    expect(result.source).toEqual(expect.stringContaining('source'));
    expect(result.destination).toEqual(expect.stringContaining('destination'));
    expect(result.copyFlag).toBe(false);
  });

  test('should return correct input when copyFlag is passed', async () => {
    process.argv = ['node', 'script', 'source/', 'destination/', '-c'];
    const result = readUserInput();
    expect(result.source).toEqual(expect.stringContaining('source'));
    expect(result.destination).toEqual(expect.stringContaining('destination'));
    expect(result.copyFlag).toBe(true);
  });
});

describe('handleUserInput', () => {
  test('should throw an error if source file or directory does not exist', async () => {
    const userInput = {
      source: 'path/to/nonexisting/file',
      destination: '/path/to/destination',
      copyFlag: false,
    };

    await expect(()=> handleUserInput(userInput)).rejects.toThrowError('File or directory \'path/to/nonexisting/file\' does not exist');
  });
});