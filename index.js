import { readFile, readdir } from 'node:fs/promises';
import { extname } from 'path';

const imageRetriever = (files) => {

  if (files?.length === 0) {
    return;
  }

  const images = files.filter(file => {
    const ext = extname(file).slice(1);
    return ext === 'png' || ext === 'jpg';
  });
  
  console.log(images[images.length-1]);

  images.pop();

  imageRetriever(images);
}

const getFilesInDir = async (dir) => {
  try {
    const files = await readdir(dir);
    imageRetriever(files);
  } catch (err) {
    console.error(err);
  }
}

const main = async () => {

  const userPath = process.argv[2];
  const options = process.argv[3];
  const destinationPath = process.argv[4];

  if (userPath === undefined) {
    console.log("no pasastes nada");
    return;
  }
  
  const filePath = new URL(userPath, import.meta.url);

  try {
    await readFile(filePath, { encoding: 'utf8' });
    return;
  }
  catch(err) {
    if(err.code === 'EISDIR') {
      getFilesInDir(filePath.pathname);
    }
  }

}

main();
