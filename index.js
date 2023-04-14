import { readdir, rename, copyFile, stat } from 'node:fs/promises';
import { statSync } from 'node:fs';
import { join, basename } from 'path';

const readUserInput = async () => {

  const [, , ...args] = process.argv;

  const [originPath, destinationPath, flags] = args;
  
  if (!originPath) {
    throw new Error('no input');
  }
  
  if (!destinationPath) {
    throw new Error('no destination dir');
  }

  let source = new URL(originPath, import.meta.url).pathname;
  let destination = new URL(destinationPath, import.meta.url).pathname;

  let copyFlag = flags === '-c';

  return { source, destination, copyFlag };
};

const handleUserInput = async (userInput) => {

  let { source, destination, copyFlag } = userInput;
  let sourceStats, destinationStats, files;

  try {
    sourceStats = await stat(source);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File or directory '${source}' does not exist.`);
    } else {
      throw new Error(error.message);
    }
  }

  try {
    destinationStats = await stat(destination);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new Error(error.message);
    }
  }

  if (sourceStats.isDirectory()) {
    try {
        files = await readdir(source);
        if(files) {
          await copyOrMove(files, source, destination, copyFlag);
        }
      } catch (err) {
        console.log(err);
        throw new Error('error trying to read files from source dir');
      }
  }

  if (sourceStats.isFile()) {
    if (destinationStats && destinationStats.isDirectory()) {
      destination = join(destination, basename(source));
    }
    copyFlag ? copy(source, destination) : move(source, destination);
  }
};

const copyOrMove = async (dirContent, source, destination, copyFlag) => {
  if (dirContent.length === 0) {
    return;
  }

  let files = [];
  let directories = [];
  
  dirContent.forEach(element => {
    let stats = statSync(element);
    if (stats.isFile()) {
      files.push(element);
    }
   
    if (stats.isDirectory()) {
      directories.push(element);
    }
  });

  files.forEach(file => {
    copyFlag ? copy(join(source, file), join(destination, file)) : move(join(source, file), join(destination, file))
  });
  
  // return copyOrMove(dirContent, source, destination, copyFlag);
};

const copy = async (source, destination) => {
  try {
    await copyFile(source, destination);
    console.log(source, 'was copied');
  } catch {
    throw new Error('error trying to copy file');
  }
};

const move = async (source, destination) => {
  try {
    await rename(source, destination);
    console.log(source, 'was moved');
  } catch {
    throw new Error('error trying to move file');
  }
};

const main = async () => {
  try {
    const userInput = await readUserInput();
    
    if (!userInput) {
      return;
    }

    await handleUserInput(userInput);

  } catch (error) {
    throw new Error(error);
  }
};

main();
