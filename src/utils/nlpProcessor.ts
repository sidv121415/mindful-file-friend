
import { FileItem } from "@/types/file";

export class NLPProcessor {
  static processCommand(command: string, files: FileItem[]): ProcessResult {
    if (!command || !command.trim()) {
      return { files, action: "none" };
    }
    
    const normalizedCommand = command.toLowerCase().trim();
    console.log("Processing command:", normalizedCommand);
    
    // Extract key information from command using regex patterns
    const fileTypePattern = /(pdf|doc|text|image|video|audio|picture|screenshot|jpg|png|mp4|mp3)/gi;
    const sizePattern = /(?:larger|bigger|greater|more) than (\d+)\s*(kb|mb|gb|b)/i;
    const folderNamePattern = /(?:to|into|in)\s+(?:a\s+)?(?:new\s+)?(?:folder|directory)?\s*(?:named|called)?\s*\[?([^\]]+)\]?/i;
    const folderBracketPattern = /\[([^\]]+)\]/i;
    
    // Extract file types mentioned in command
    const fileTypesRaw = normalizedCommand.match(fileTypePattern) || [];
    const fileTypes = [...new Set(fileTypesRaw.map(type => type.toLowerCase()))]; // Remove duplicates
    
    // Extract size constraints
    const sizeMatch = normalizedCommand.match(sizePattern);
    let sizeThreshold = 0;
    let sizeUnit = "kb";
    
    if (sizeMatch) {
      sizeThreshold = parseInt(sizeMatch[1]);
      sizeUnit = sizeMatch[2].toLowerCase();
    }
    
    // Convert size to bytes for comparison
    const sizeInBytes = (() => {
      switch (sizeUnit) {
        case "b": return sizeThreshold;
        case "kb": return sizeThreshold * 1024;
        case "mb": return sizeThreshold * 1024 * 1024;
        case "gb": return sizeThreshold * 1024 * 1024 * 1024;
        default: return sizeThreshold * 1024; // Default to KB
      }
    })();
    
    // Extract target folder name
    let targetFolder = "";
    const folderMatch = normalizedCommand.match(folderNamePattern);
    const bracketMatch = normalizedCommand.match(folderBracketPattern);
    
    if (bracketMatch) {
      // Prioritize bracketed folder names
      targetFolder = bracketMatch[1].trim();
    } else if (folderMatch) {
      targetFolder = folderMatch[1].trim();
    } else if (this.containsAny(normalizedCommand, ["move", "copy"]) && !targetFolder) {
      // Default folder naming based on content
      if (fileTypes.includes("screenshot") || fileTypes.includes("image") || 
          fileTypes.includes("jpg") || fileTypes.includes("png")) {
        targetFolder = "Screenshots";
      } else if (fileTypes.includes("document") || fileTypes.includes("pdf") || fileTypes.includes("doc")) {
        targetFolder = "Documents";
      } else if (fileTypes.includes("video") || fileTypes.includes("mp4")) {
        targetFolder = "Videos";
      } else {
        const timestamp = new Date().toISOString().replace(/[-:.]/g, "").substring(0, 14);
        targetFolder = `Organized_${timestamp}`;
      }
    }
    
    // Handle file movement commands
    if (this.containsAny(normalizedCommand, ["move", "copy", "transfer", "relocate"])) {
      // Filter files based on type and size constraints
      let selectedFiles: FileItem[] = [...files];
      
      // Apply file type filtering if specified
      if (fileTypes.length > 0) {
        // Map common terms to file extensions
        const typeMap: Record<string, string[]> = {
          "document": ["pdf", "doc", "docx", "txt", "rtf", "odt", "xlsx", "pptx"],
          "image": ["jpg", "jpeg", "png", "gif", "svg", "webp"],
          "picture": ["jpg", "jpeg", "png", "gif", "svg", "webp"],
          "screenshot": ["jpg", "jpeg", "png", "gif"],
          "video": ["mp4", "mov", "avi", "mkv", "webm"],
          "audio": ["mp3", "wav", "ogg", "flac", "aac"],
          "pdf": ["pdf"],
          "doc": ["doc", "docx"],
          "text": ["txt"],
          "jpg": ["jpg", "jpeg"],
          "png": ["png"],
          "mp4": ["mp4"],
          "mp3": ["mp3"],
        };
        
        // Expand file types to include all related extensions
        const expandedTypes = fileTypes.flatMap(type => typeMap[type] || [type]);
        
        selectedFiles = selectedFiles.filter(file => 
          expandedTypes.some(ext => file.type.toLowerCase() === ext)
        );
      }
      
      // Apply size filtering if specified
      if (sizeThreshold > 0) {
        if (normalizedCommand.includes("larger") || 
            normalizedCommand.includes("bigger") ||
            normalizedCommand.includes("greater") ||
            normalizedCommand.includes("more")) {
          selectedFiles = selectedFiles.filter(file => file.size > sizeInBytes);
        } else if (normalizedCommand.includes("smaller") || 
                  normalizedCommand.includes("less")) {
          selectedFiles = selectedFiles.filter(file => file.size < sizeInBytes);
        }
      }
      
      // Handle the move operation
      if (selectedFiles.length > 0 && targetFolder) {
        return {
          files: selectedFiles,
          action: "move",
          targetFolder: targetFolder,
          message: `Moving ${selectedFiles.length} file(s) to folder '${targetFolder}'`
        };
      } else if (selectedFiles.length === 0) {
        return {
          files: files,
          action: "none",
          message: "No files matching your criteria were found"
        };
      }
    }
    
    // Handle search/filter commands with improved pattern matching
    if (this.containsAny(normalizedCommand, ["show", "find", "display", "list", "get", "search", "filter", "where"])) {
      let selectedFiles = [...files];
      
      // Apply file type filtering
      if (fileTypes.length > 0) {
        const typeMap: Record<string, string[]> = {
          "document": ["pdf", "doc", "docx", "txt", "rtf", "odt", "xlsx", "pptx"],
          "image": ["jpg", "jpeg", "png", "gif", "svg", "webp"],
          "picture": ["jpg", "jpeg", "png", "gif", "svg", "webp"],
          "screenshot": ["jpg", "jpeg", "png", "gif"],
          "video": ["mp4", "mov", "avi", "mkv", "webm"],
          "audio": ["mp3", "wav", "ogg", "flac", "aac"],
          "pdf": ["pdf"],
          "doc": ["doc", "docx"],
          "text": ["txt"],
          "jpg": ["jpg", "jpeg"],
          "png": ["png"],
          "mp4": ["mp4"],
          "mp3": ["mp3"],
        };
        
        const expandedTypes = fileTypes.flatMap(type => typeMap[type] || [type]);
        selectedFiles = selectedFiles.filter(file => 
          expandedTypes.some(ext => file.type.toLowerCase() === ext)
        );
      }
      
      // Apply size filtering if specified
      if (sizeThreshold > 0) {
        if (normalizedCommand.includes("larger") || 
            normalizedCommand.includes("bigger") ||
            normalizedCommand.includes("greater") ||
            normalizedCommand.includes("more")) {
          selectedFiles = selectedFiles.filter(file => file.size > sizeInBytes);
        } else if (normalizedCommand.includes("smaller") || 
                  normalizedCommand.includes("less")) {
          selectedFiles = selectedFiles.filter(file => file.size < sizeInBytes);
        }
      }
      
      // Apply date filtering
      if (this.containsAny(normalizedCommand, ["recent", "newest", "latest", "new", "last"])) {
        selectedFiles = [...selectedFiles].sort((a, b) => b.modified.getTime() - a.modified.getTime());
        if (!normalizedCommand.includes("all")) {
          selectedFiles = selectedFiles.slice(0, 10); // Limit to top 10 unless "all" is specified
        }
      } else if (this.containsAny(normalizedCommand, ["old", "oldest", "earlier"])) {
        selectedFiles = [...selectedFiles].sort((a, b) => a.modified.getTime() - b.modified.getTime());
        if (!normalizedCommand.includes("all")) {
          selectedFiles = selectedFiles.slice(0, 10); // Limit to top 10 unless "all" is specified
        }
      }
      
      // Apply name-based filtering
      const namePattern = /name\s+(?:contains|with|having|like|containing)?\s*["']?([a-z0-9_\s-]+)["']?/i;
      const nameMatch = normalizedCommand.match(namePattern);
      if (nameMatch && nameMatch[1]) {
        const searchTerm = nameMatch[1].trim();
        selectedFiles = selectedFiles.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      
      return {
        files: selectedFiles,
        action: "filter",
        message: `Found ${selectedFiles.length} file(s) matching your criteria`
      };
    }
    
    // Handle sort commands
    if (this.containsAny(normalizedCommand, ["sort", "order", "arrange"])) {
      let selectedFiles = [...files];
      
      // Apply file type filtering if present alongside sort
      if (fileTypes.length > 0) {
        const typeMap: Record<string, string[]> = {
          "document": ["pdf", "doc", "docx", "txt", "rtf", "odt", "xlsx", "pptx"],
          "image": ["jpg", "jpeg", "png", "gif", "svg", "webp"],
          "picture": ["jpg", "jpeg", "png", "gif", "svg", "webp"],
          "screenshot": ["jpg", "jpeg", "png", "gif"],
          "video": ["mp4", "mov", "avi", "mkv", "webm"],
          "audio": ["mp3", "wav", "ogg", "flac", "aac"],
        };
        
        const expandedTypes = fileTypes.flatMap(type => typeMap[type] || [type]);
        selectedFiles = selectedFiles.filter(file => 
          expandedTypes.some(ext => file.type.toLowerCase() === ext)
        );
      }
      
      if (this.containsAny(normalizedCommand, ["size", "largest", "smallest"])) {
        if (this.containsAny(normalizedCommand, ["desc", "descending", "large", "largest", "biggest"])) {
          selectedFiles = selectedFiles.sort((a, b) => b.size - a.size);
        } else {
          selectedFiles = selectedFiles.sort((a, b) => a.size - b.size);
        }
      } else if (this.containsAny(normalizedCommand, ["date", "time", "newest", "oldest", "recent"])) {
        if (this.containsAny(normalizedCommand, ["desc", "descending", "new", "newest", "recent", "latest"])) {
          selectedFiles = selectedFiles.sort((a, b) => b.modified.getTime() - a.modified.getTime());
        } else {
          selectedFiles = selectedFiles.sort((a, b) => a.modified.getTime() - b.modified.getTime());
        }
      } else if (this.containsAny(normalizedCommand, ["name", "alphabetical", "alpha"])) {
        if (this.containsAny(normalizedCommand, ["desc", "descending", "reverse", "z-a"])) {
          selectedFiles = selectedFiles.sort((a, b) => b.name.localeCompare(a.name));
        } else {
          selectedFiles = selectedFiles.sort((a, b) => a.name.localeCompare(b.name));
        }
      }
      
      return {
        files: selectedFiles,
        action: "filter",
        message: `Sorted ${selectedFiles.length} file(s)`
      };
    }
    
    // Find duplicates command with improved detection
    if (this.containsAny(normalizedCommand, ["duplicate", "duplicates", "same", "copies", "similar", "identical"])) {
      console.log("Looking for duplicates");
      const potentialDuplicates: FileItem[] = [];
      const sizeTypeMap = new Map<string, FileItem[]>();
      
      files.forEach(file => {
        const key = `${file.size}-${file.type}`;
        if (!sizeTypeMap.has(key)) {
          sizeTypeMap.set(key, []);
        }
        sizeTypeMap.get(key)?.push(file);
      });
      
      sizeTypeMap.forEach((items) => {
        if (items.length > 1) {
          potentialDuplicates.push(...items);
        }
      });
      
      return {
        files: potentialDuplicates,
        action: "filter",
        message: `Found ${potentialDuplicates.length} potential duplicate files`
      };
    }
    
    // Command not recognized but attempted
    if (normalizedCommand.length > 0) {
      return {
        files: files,
        action: "unknown",
        message: "I'm not sure how to process that command. Try something like 'Move images larger than 5MB to [Photos]', 'Show PDF files', 'Find duplicates', 'Sort by size', or 'Show recent files'."
      };
    }
    
    // Default: return all files
    return {
      files: files,
      action: "none"
    };
  }
  
  // Helper method to check if command contains any of the phrases
  private static containsAny(command: string, phrases: string[]): boolean {
    return phrases.some(phrase => command.includes(phrase));
  }
}

interface ProcessResult {
  files: FileItem[];
  action: string;
  message?: string;
  targetFolder?: string;
}
