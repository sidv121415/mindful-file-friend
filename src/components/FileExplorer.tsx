
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Folder } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FolderSelector } from "./FolderSelector";
import { FileList } from "./FileList";
import { CommandProcessor } from "./CommandProcessor";
import { useFiles } from "@/hooks/useFiles";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { FileItem } from "@/types/file";

const downloadFile = async (fileHandle: FileSystemFileHandle | undefined) => {
  if (!fileHandle) {
    toast({
      title: "Error",
      description: "File not available for download",
      variant: "destructive"
    });
    return;
  }

  try {
    const file = await fileHandle.getFile();
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: `Downloaded ${file.name}`,
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to download file",
      variant: "destructive"
    });
  }
};

export function FileExplorer() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const { files, setFiles, filteredFiles, setFilteredFiles, isLoading, loadFilesFromDirectoryHandle, loadMockFiles } = useFiles();
  const [operationResult, setOperationResult] = useState<{
    type: string;
    message: string;
    targetFolder?: string;
  } | null>(null);

  const handleFolderSelect = (folderPath: string, dirHandle?: FileSystemDirectoryHandle) => {
    setSelectedFolder(folderPath);
    
    if (dirHandle) {
      setDirectoryHandle(dirHandle);
      loadFilesFromDirectoryHandle(dirHandle);
    } else {
      setDirectoryHandle(null);
      loadMockFiles(folderPath);
    }
    
    toast({
      title: "Folder Selected",
      description: `Analyzing files in ${folderPath}`,
    });
  };

  const handleCommandProcessed = (processedFiles: FileItem[], action: string, message?: string) => {
    if (action === "download") {
      processedFiles.forEach(file => {
        if (file.handle) {
          downloadFile(file.handle);
        }
      });
    }
    setFilteredFiles(processedFiles);
    if (message) {
      setOperationResult({
        type: action === "download" ? "success" : "info",
        message
      });
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      {!selectedFolder ? (
        <FolderSelector onSelect={handleFolderSelect} />
      ) : (
        <>
          <div className="flex items-center space-x-2">
            <Folder className="h-5 w-5" />
            <span className="font-medium">{selectedFolder}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedFolder(null)}
            >
              Change
            </Button>
            {directoryHandle && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Real Folder
              </span>
            )}
          </div>
          
          {isLoading && (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading files...</span>
            </div>
          )}
          
          {operationResult && (
            <Alert className={operationResult.type === "success" ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
              <AlertTitle>Operation Completed</AlertTitle>
              <AlertDescription>{operationResult.message}</AlertDescription>
            </Alert>
          )}
          
          <CommandProcessor 
            files={files}
            onCommandProcessed={handleCommandProcessed}
          />
          
          {!isLoading && (
            <FileList 
              files={filteredFiles} 
              onDownload={(file) => file.handle && downloadFile(file.handle)} 
            />
          )}
        </>
      )}
    </div>
  );
}
