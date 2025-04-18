
export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  modified: Date;
  path: string;
  handle?: FileSystemFileHandle; // Changed from FileSystemHandle to FileSystemFileHandle
}

// Add TypeScript interfaces for the File System Access API
declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  }
  
  interface FileSystemDirectoryHandle {
    kind: 'directory';
    name: string;
    entries: () => AsyncIterableIterator<[string, FileSystemHandle]>;
    getDirectoryHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemDirectoryHandle>;
    getFileHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemFileHandle>;
  }
  
  interface FileSystemFileHandle {
    kind: 'file';
    name: string;
    getFile: () => Promise<File>;
  }
  
  type FileSystemHandle = FileSystemFileHandle | FileSystemDirectoryHandle;
}
