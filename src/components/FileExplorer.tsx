
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Folder, File, Search, AlertTriangle, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FolderSelector } from "./FolderSelector";
import { FileList } from "./FileList";
import { NLPProcessor } from "../utils/nlpProcessor";

// Mock file data structure
interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  modified: Date;
  path: string;
}

export function FileExplorer() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [command, setCommand] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock function to load files from a folder
  const loadFilesFromFolder = (folderPath: string) => {
    // In a real app, this would connect to a backend API to get files
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
    ];

    setFiles(mockFiles);
    setFilteredFiles(mockFiles);
    generateSuggestions(mockFiles);
  };

  // Generate automatic suggestions based on file analysis
  const generateSuggestions = (files: FileItem[]) => {
    const newSuggestions = [];
    
    // Find potential duplicates (same size and type)
    const sizeTypeMap = new Map<string, FileItem[]>();
    files.forEach(file => {
      const key = `${file.size}-${file.type}`;
      if (!sizeTypeMap.has(key)) {
        sizeTypeMap.set(key, []);
      }
      sizeTypeMap.get(key)?.push(file);
    });
    
    sizeTypeMap.forEach((items, key) => {
      if (items.length > 1) {
        newSuggestions.push(`Possible duplicates found: ${items.map(i => i.name).join(", ")}`);
      }
    });
    
    // Find large files
    const largeFiles = files.filter(file => file.size > 10 * 1024 * 1024); // > 10MB
    if (largeFiles.length > 0) {
      newSuggestions.push(`Large files found: ${largeFiles.map(f => f.name).join(", ")}`);
    }
    
    // Suggest organization by file type
    const fileTypes = new Set(files.map(file => file.type));
    if (fileTypes.size > 3) {
      newSuggestions.push(`Consider organizing files by type: ${Array.from(fileTypes).join(", ")}`);
    }
    
    setSuggestions(newSuggestions);
  };

  // Process natural language command
  const processCommand = () => {
    if (!command.trim()) return;
    
    setIsProcessing(true);
    
    // Use our NLP processor to interpret the command
    const result = NLPProcessor.processCommand(command, files);
    
    setFilteredFiles(result.files);
    setIsProcessing(false);
    
    if (result.action === "save") {
      const savedLocation = "/saved-results";
      toast({
        title: "Files Processed",
        description: `Results saved to ${savedLocation}`,
      });
    }
    
    if (result.message) {
      toast({
        title: "Command Processed",
        description: result.message,
      });
    }
  };

  const handleFolderSelect = (folderPath: string) => {
    setSelectedFolder(folderPath);
    loadFilesFromFolder(folderPath);
    toast({
      title: "Folder Selected",
      description: `Analyzing files in ${folderPath}`,
    });
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
          </div>
          
          {suggestions.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <h3 className="flex items-center text-amber-800 font-medium mb-2">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Automatic Suggestions
              </h3>
              <ul className="space-y-1 text-amber-700">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm">• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Input
              placeholder="Enter command (e.g., 'Show all PDFs', 'Find duplicates')"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="flex-1"
            />
            <Button onClick={processCommand} disabled={isProcessing}>
              <Search className="h-4 w-4 mr-2" />
              Process
            </Button>
          </div>
          
          <FileList files={filteredFiles} />
        </>
      )}
    </div>
  );
}
