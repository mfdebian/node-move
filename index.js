import { readdir, rename, copyFile } from 'node:fs/promises';
import { extname, join } from 'path';

const getUserInput = async () => {

  const [, , ...args] = process.argv;
  const [flags, originPath, destinationPath] = args;
  
  if (!flags) {
    throw new Error('no input');
  }
  
  if (!destinationPath) {
    throw new Error('no destination dir');
  }

  let source = new URL(originPath, import.meta.url).pathname;
  let destination = new URL(destinationPath, import.meta.url).pathname;

  try {
    await readdir(destination);
  } catch (err) {
    throw new Error('error trying to read destination dir');
  }

  let copy = flags === '-c';

  return { source, destination, copy };
};

const handleUserInput = async (userInput) => {

  const { source, destination } = userInput;

  try {
    const files = await readdir(source);
    if(files) {
      await move(files, source, destination);
    }
  } catch (err) {
    throw new Error('error trying to read source dir');
  }
};

const move = async (files, source, destination) => {

  if (files?.length === 0) {
    return;
  }

  const images = files.filter(file => {
    const ext = extname(file).slice(1);
    return ext === 'png' || ext === 'jpg';
  });

  let fileToMove = images.pop();

  try {
    await rename(join(source, fileToMove), join(destination, fileToMove));
    console.log(fileToMove, 'was moved');
  } catch {
    throw new Error('error trying to move file');
  }

  return move(images, source, destination);
};

const main = async () => {

  try {
    const userInput = await getUserInput();
    
    if (!userInput) {
      return;
    }

    await handleUserInput(userInput);

  } catch (error) {
    throw new Error('error trying to read user input');
  }
};

main();
