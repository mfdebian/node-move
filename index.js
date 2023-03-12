import { readdir, copyFile } from 'node:fs/promises';
import { extname } from 'path';

const args = {
  originPath: process.argv[2],
  options: process.argv[3],
  destinationPath: process.argv[4],
}

const move = async (files) => {

  if (files?.length === 0) {
    return;
  }

  const images = files.filter(file => {
    const ext = extname(file).slice(1);
    return ext === 'png' || ext === 'jpg';
  });

  let fileToCopy = images.pop();

  try {
    await copyFile(fileToCopy, args.destinationPath.pathname+fileToCopy);
    console.log(fileToCopy, 'was copied');
  } catch {
    console.error('The file could not be copied');
  }

  return move(images);
}

const readDir = async (filePath) => {
  try {
    const files = await readdir(filePath);
    return files;
  } catch (err) {
    console.log(filePath.pathname, "error:", err.code);
  }

}

const main = async () => {

  if (!args.originPath) {
    console.log('no input');
    return;
  }
  
  if (!args.destinationPath) {
    console.log('no destination dir');
    return;
  }

  args.originPath = new URL(args.originPath, import.meta.url);
  args.destinationPath = new URL(args.destinationPath, import.meta.url);

  if(!await readDir(args.destinationPath)){
    return;
  }

  const files = await readDir(args.originPath);
  if(files) {
    move(files);
  }
}

main();
