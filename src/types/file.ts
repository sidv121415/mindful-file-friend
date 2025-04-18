
export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  modified: Date;
  path: string;
  handle?: FileSystemFileHandle;
}

// Add TypeScript interfaces for the File System Access API
declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  }
  
  interface FileSystemDirectoryHandle extends FileSystemHandle {
    entries: () => AsyncIterableIterator<[string, FileSystemHandle]>;
    getDirectoryHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemDirectoryHandle>;
    getFileHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemFileHandle>;
  }
  
  interface FileSystemFileHandle extends FileSystemHandle {
    getFile: () => Promise<File>;
  }
  
  interface FileSystemHandle {
    readonly kind: 'file' | 'directory';
    readonly name: string;
  }
}
