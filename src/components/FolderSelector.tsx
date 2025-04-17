
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Folder, FolderOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface FolderSelectorProps {
  onSelect: (folderPath: string) => void;
}

export function FolderSelector({ onSelect }: FolderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Mock folders for demonstration
  const mockFolders = [
    "/Users/documents",
    "/Users/downloads",
    "/Users/pictures",
    "/Users/videos",
    "/Users/projects",
  ];

  const handleSelect = (folder: string) => {
    onSelect(folder);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/50">
      <Folder className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">Select a Folder to Begin</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Choose a folder to analyze. The system will automatically suggest 
        actions based on the content and allow you to use natural language 
        commands to manage your files.
      </p>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="lg">
            <FolderOpen className="h-5 w-5 mr-2" />
            Browse Folders
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select a folder</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col space-y-1 mt-4">
            {mockFolders.map((folder) => (
              <Button
                key={folder}
                variant="ghost"
                className="justify-start px-2 py-6"
                onClick={() => handleSelect(folder)}
              >
                <Folder className="h-5 w-5 mr-2" />
                {folder}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
