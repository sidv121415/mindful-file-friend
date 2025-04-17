
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Folder, FolderOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface FolderSelectorProps {
  onSelect: (folderPath: string, dirHandle?: FileSystemDirectoryHandle) => void;
}

export function FolderSelector({ onSelect }: FolderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Check if the File System Access API is supported
  const isFileSystemAccessSupported = () => {
    return 'showDirectoryPicker' in window;
  };

  const handleBrowseFolder = async () => {
    try {
      if (!isFileSystemAccessSupported()) {
        toast({
          title: "Not Supported",
          description: "File System Access API is not supported in your browser. Try using Chrome, Edge, or other Chromium-based browsers.",
          variant: "destructive"
        });
        return;
      }

      // Show directory picker dialog
      const dirHandle = await window.showDirectoryPicker();
      const folderPath = dirHandle.name;
      onSelect(folderPath, dirHandle);
      setIsOpen(false);
    } catch (error) {
      // User cancelled the dialog or another error occurred
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: "Error",
          description: `Failed to access folder: ${error.message}`,
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/50">
      <Folder className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">Select a Folder to Begin</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Choose a folder from your computer to analyze. The system will automatically suggest 
        actions based on the content and allow you to use natural language 
        commands to manage your files.
      </p>
      
      {isFileSystemAccessSupported() ? (
        <Button size="lg" onClick={handleBrowseFolder}>
          <FolderOpen className="h-5 w-5 mr-2" />
          Browse Folders
        </Button>
      ) : (
        <div className="space-y-4">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <FolderOpen className="h-5 w-5 mr-2" />
                Browse Folders (Mock)
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select a folder</DialogTitle>
              </DialogHeader>
              
              <div className="flex flex-col space-y-1 mt-4">
                {["/Users/documents", "/Users/downloads", "/Users/pictures", "/Users/videos", "/Users/projects"].map((folder) => (
                  <Button
                    key={folder}
                    variant="ghost"
                    className="justify-start px-2 py-6"
                    onClick={() => {
                      onSelect(folder);
                      setIsOpen(false);
                    }}
                  >
                    <Folder className="h-5 w-5 mr-2" />
                    {folder}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <p className="text-sm text-muted-foreground">
            Your browser does not support the File System Access API. Using mock data.
          </p>
        </div>
      )}
    </div>
  );
}
