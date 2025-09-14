import { UTApi, UTFile } from 'uploadthing/server';

const utapi = new UTApi();

function dataUrlToUTFile(
  dataUrl: string,
  filename: string
): UTFile | undefined {
  const arr = dataUrl.split(',');
  if (arr.length < 2) {
    return undefined;
  }
  const mimeArr = arr[0].match(/:(.*?);/);
  if (!mimeArr || mimeArr.length < 2) {
    return undefined;
  }
  const mime = mimeArr[1];
  const buff = Buffer.from(arr[1], 'base64');
  return new UTFile([buff], filename, { type: mime });
}

export async function uploadFiles(
  files: {
    name: string;
    data: string;
    type: string;
  }[]
) {
  const utFiles = files.map(
    (file) => dataUrlToUTFile(file.data, `${file.name}.${file.type}`)!
  );
  const validFiles = utFiles.filter((file) => file !== undefined);
  if (validFiles.length === 0) {
    return [];
  }
  const response = await utapi.uploadFiles(utFiles);
  return response;
}

export async function uploadFile(file: File) {
  const uploadedFiles = await utapi.uploadFiles([file]);
  return uploadedFiles;
}

export async function deleteFiles(images: string[]) {
  const res = await utapi.deleteFiles(images);
  console.log(`Deleted ${res.deletedCount} files`);
  return res;
}
