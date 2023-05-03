import { rename, copyFile, stat, opendir, mkdir } from 'node:fs/promises';
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
  let sourceStats, destinationStats;

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
    await copyOrMove(source, destination, copyFlag);
  }

  if (sourceStats.isFile()) {
    if (destinationStats && destinationStats.isDirectory()) {
      destination = join(destination, basename(source));
    }
    copyFlag ? await copy(source, destination) : await move(source, destination);
  }
};

const checkAndMakeDirectory = async (dirname) => {
  try {
    await stat(dirname);
  } catch (error) {
    if (error.code === "ENOENT") {
      const projectFolder = new URL(dirname, import.meta.url);
      try {
        await mkdir(projectFolder);
      } catch (err) {
        console.error(err.message);
      }
    }
  }
}

const copyOrMove = async (source, destination, copyFlag) => {

  let files = [];
  let directories = [];

  try {
    const dir = await opendir(source);
    for await (const dirent of dir) {
      if(dirent.name !== '.git') {
        let sourcePath = join(source, dirent.name);
        let stats = await stat(sourcePath);
        if (stats.isFile()) {
          files.push(dirent.name)
        }
        
        if(stats.isDirectory()) {
          directories.push(dirent.name)
        }
      }
    }
  } catch (err) {
    throw new Error(err);
  }

  for await (const file of files) {
    let sourcePath = join(source, file);
    let destinationPath = join(destination, file);
    await checkAndMakeDirectory(destination);

    copyFlag ? await copy(sourcePath, destinationPath) : await move(sourcePath, destinationPath);
  }

  directories.forEach(dir => {
    source = join(source, dir);
    destination = join(destination, dir);
    return copyOrMove(source, destination, copyFlag);
  });

};

const copy = async (source, destination) => {
  try {
    await copyFile(source, destination);
    console.log(source, 'was copied');
  } catch(err) {
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
