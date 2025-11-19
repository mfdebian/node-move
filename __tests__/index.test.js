import { stat } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';
import {
  readUserInput,
  handleUserInput,
  copyOrMove,
  checkAndMakeDirectory,
  checkAndRemoveDirectory,
} from '../index.js';

describe('readUserInput', () => {
  test('should throw `no input` error if no input is given', () => {
    expect(() => readUserInput()).toThrowError('no input');
  });

  test('should throw `no destination dir` error when its not given', () => {
    process.argv = ['node', 'script', 'source/', null];
    expect(() => readUserInput()).toThrowError('no destination dir');
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

    await expect(() => handleUserInput(userInput)).rejects.toThrowError(
      "File or directory 'path/to/nonexisting/file' does not exist",
    );
  });

  test('should move source file to destination if copyFlag is false', async () => {
    const userInput = {
      source: './__tests__/__fixtures__/01-source/01-source_file.txt',
      destination: './__tests__/__fixtures__/01-destination/',
      copyFlag: false,
    };

    await handleUserInput(userInput);

    await expect(
      stat('./__tests__/__fixtures__/01-source/01-source_file.txt'),
    ).rejects.toThrow(Error, /ENOENT/);

    let fileInDestinationStat = stat(
      './__tests__/__fixtures__/01-destination/01-source_file.txt',
    );

    expect(fileInDestinationStat).toBeTruthy();
  });

  test('should copy source file to destination if copyFlag is true', async () => {
    const userInput = {
      source: './__tests__/__fixtures__/01-destination/01-source_file.txt',
      destination: './__tests__/__fixtures__/01-source/',
      copyFlag: true,
    };

    await handleUserInput(userInput);

    let fileInDestinationStat = stat(
      './__tests__/__fixtures__/01-source/01-source_file.txt',
    );

    expect(() => handleUserInput(userInput)).not.toThrow();
    expect(fileInDestinationStat).toBeTruthy();
  });
});

describe('moveOrCopy', () => {
  test('should move source dir and files to destination if copyFlag is false', async () => {
    let source = './__tests__/__fixtures__/01-source/02-source/';
    let destination = './__tests__/__fixtures__/01-destination/02-destination/';
    let copyFlag = false;

    await copyOrMove(source, destination, copyFlag);

    await expect(
      stat(
        './__tests__/__fixtures__/01-source/02-source/03-source/03-source-file.txt',
      ),
    ).rejects.toThrow(Error, /ENOENT/);

    let fileInDestinationStat = stat(
      './__tests__/__fixtures__/01-destination/02-destination/03-source/03-source-file.txt',
    );
    expect(fileInDestinationStat).toBeTruthy();
  });

  test('should copy source dir and files to destination if copyFlag is true', async () => {
    let source = './__tests__/__fixtures__/01-destination/02-destination/';
    let destination = './__tests__/__fixtures__/01-source/02-source/';
    let copyFlag = true;

    await copyOrMove(source, destination, copyFlag);

    let source2Stat = stat(
      './__tests__/__fixtures__/01-source/02-source/02-source_file.txt',
    );

    expect(source2Stat).toBeTruthy();

    let source3Stat = stat(
      './__tests__/__fixtures__/01-source/02-source/03-source/03-source-file.txt',
    );

    expect(source3Stat).toBeTruthy();
  });
});

describe('checkAndMakeDirectory', () => {
  test('should create a new directory with name 04-source', async () => {
    let dirname =
      './__tests__/__fixtures__/01-source/02-source/03-source/04-source';
    await checkAndMakeDirectory(dirname);
    let source4Stat = stat(
      './__tests__/__fixtures__/01-source/02-source/03-source/04-source',
    );

    expect(source4Stat).toBeTruthy();
    expect((await source4Stat).isDirectory()).toBe(true);
  });
});

describe('checkAndRemoveDirectory', () => {
  test('should remove a directory with name 04-source', async () => {
    let dirname =
      './__tests__/__fixtures__/01-source/02-source/03-source/04-source';
    await checkAndRemoveDirectory(dirname);
    await expect(
      stat('./__tests__/__fixtures__/01-source/02-source/03-source/04-source'),
    ).rejects.toThrow(Error, /ENOENT/);
  });
});
