import { useState } from "react";
import { FileItem } from "@/types/file";
import { toast } from "@/hooks/use-toast";

export const useFiles = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFilesFromDirectoryHandle = async (dirHandle: FileSystemDirectoryHandle) => {
    setIsLoading(true);
    try {
      const fileItems: FileItem[] = [];
      
      for await (const [name, entry] of dirHandle.entries()) {
        try {
          if (entry.kind === 'file') {
            const fileHandle = entry as FileSystemFileHandle;
            const file = await fileHandle.getFile();
            const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
            
            fileItems.push({
              id: crypto.randomUUID(),
              name: file.name,
              type: fileExtension,
              size: file.size,
              modified: new Date(file.lastModified),
              path: `${dirHandle.name}/${file.name}`,
              handle: fileHandle
            });
          }
        } catch (error) {
          console.error(`Error processing entry ${name}:`, error);
        }
      }
      
      setFiles(fileItems);
      setFilteredFiles(fileItems);
      
      toast({
        title: "Files Loaded",
        description: `Loaded ${fileItems.length} files from ${dirHandle.name}`,
      });
    } catch (error) {
      console.error("Error loading files:", error);
      toast({
        title: "Error",
        description: "Failed to load files from the selected folder",
        variant: "destructive"
      });
      loadMockFiles(dirHandle.name);
    }
    setIsLoading(false);
  };

  const loadMockFiles = (folderPath: string) => {
    const mockFiles: FileItem[] = [
      {
        id: "1",
        name: "Document1.pdf",
        type: "pdf",
        size: 1024 * 1024 * 2.5, // 2.5MB
        modified: new Date(2023, 3, 15),
        path: `${folderPath}/Document1.pdf`,
      },
      {
        id: "2",
        name: "Image1.jpg",
        type: "jpg",
        size: 1024 * 512, // 512KB
        modified: new Date(2023, 4, 10),
        path: `${folderPath}/Image1.jpg`,
      },
      {
        id: "3",
        name: "Video1.mp4",
        type: "mp4",
        size: 1024 * 1024 * 15, // 15MB
        modified: new Date(2023, 5, 5),
        path: `${folderPath}/Video1.mp4`,
      },
      {
        id: "4",
        name: "Document2.pdf",
        type: "pdf",
        size: 1024 * 1024 * 1.2, // 1.2MB
        modified: new Date(2023, 3, 20),
        path: `${folderPath}/Document2.pdf`,
      },
      {
        id: "5",
        name: "Image1_copy.jpg",
        type: "jpg",
        size: 1024 * 512, // 512KB - same as Image1.jpg
        modified: new Date(2023, 4, 11),
        path: `${folderPath}/Image1_copy.jpg`,
      },
      {
        id: "6",
        name: "Music1.mp3",
        type: "mp3",
        size: 1024 * 1024 * 5, // 5MB
        modified: new Date(2023, 5, 20),
        path: `${folderPath}/Music1.mp3`,
      },
      {
        id: "7",
        name: "Spreadsheet.xlsx",
        type: "xlsx",
        size: 1024 * 800, // 800KB
        modified: new Date(2023, 6, 5),
        path: `${folderPath}/Spreadsheet.xlsx`,
      },
      {
        id: "8",
        name: "Presentation.pptx",
        type: "pptx",
        size: 1024 * 1024 * 3.5, // 3.5MB
        modified: new Date(2023, 6, 20),
        path: `${folderPath}/Presentation.pptx`,
      },
    ];

    setFiles(mockFiles);
    setFilteredFiles(mockFiles);
  };

  return {
    files,
    setFiles,
    filteredFiles,
    setFilteredFiles,
    isLoading,
    loadFilesFromDirectoryHandle,
    loadMockFiles
  };
};
