
export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  modified: Date;
  path: string;
  handle?: FileSystemHandle; // File handle for the File System Access API
}
