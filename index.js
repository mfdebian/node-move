import { readFile, readdir } from 'node:fs/promises';
import { extname } from 'path';

const filePath = new URL('./', import.meta.url);

const imageRetriever = (files) => {

  if (files?.length === 0) {
    return;
  }

  const images = files.filter(file => {
    return extname(file).slice(1) === 'png' || extname(file).slice(1) === 'jpg';
  });
  
  images.forEach(file => {
    console.log("arshibo:", file);
  })

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
    const contents = await readFile(filePath, { encoding: 'utf8' });
    return contents;
}

main()
  .then(res => console.log(res))
  .catch(err => {
    if(err.code === 'EISDIR') {
      getFilesInDir(filePath.pathname);
    }
  })

