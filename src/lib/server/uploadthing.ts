import { UTApi, UTFile } from "uploadthing/server";

const utapi = new UTApi();

export async function uploadFiles(files: {
  name: string;
  data: string;
  type: string;
}[]) {
  const utFiles = files.map((file) => new UTFile([file.data], `${file.name}.${file.type}`));
  const response = await utapi.uploadFiles(utFiles);
  return response;
}

export async function deleteFiles(images: string[]) {
  const res = await utapi.deleteFiles(images);
  console.log(`Deleted ${res.deletedCount} files`);
  return res;
}