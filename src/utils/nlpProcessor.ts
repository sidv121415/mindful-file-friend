
// A more robust NLP processor to handle natural language commands for file operations

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  modified: Date;
  path: string;
}

interface ProcessResult {
  files: FileItem[];
  action: string;
  message?: string;
  targetFolder?: string;
}

export class NLPProcessor {
  // Process natural language commands with more flexibility
  static processCommand(command: string, files: FileItem[]): ProcessResult {
    if (!command || !command.trim()) {
      return { files, action: "none" };
    }
    
    const normalizedCommand = command.toLowerCase().trim();
    console.log("Processing command:", normalizedCommand);
    
    // Handle file movement commands
    if (this.containsAny(normalizedCommand, ["move", "copy", "transfer", "relocate"])) {
      // Handle moving documents to a folder
      if (this.containsAny(normalizedCommand, ["document", "documents", "doc", "docs", "pdf", "pdfs", "text", "texts"]) && 
          this.containsAny(normalizedCommand, ["to", "into", "in"]) &&
          this.containsAny(normalizedCommand, ["folder", "directory", "location"])) {
        
        // Extract target folder name if specified
        let targetFolder = "New Folder";
        
        // Try to find a folder name after keywords like "to", "into", "in"
        const folderMatch = normalizedCommand.match(/(to|into|in)\s+(?:the|a|an)?\s*(new\s+)?(\w+\s*\w*)\s+(folder|directory|location)/i);
        if (folderMatch && folderMatch[3]) {
          const extractedName = folderMatch[3].trim();
          if (extractedName && extractedName !== "new") {
            targetFolder = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);
          }
        }
        
        // Filter document files
        const docTypes = ["pdf", "doc", "docx", "txt", "rtf", "odt", "xlsx", "pptx"];
        const docFiles = files.filter(file => docTypes.includes(file.type));
        
        return {
          files: docFiles,
          action: "move",
          targetFolder: targetFolder,
          message: `Moving ${docFiles.length} document(s) to '${targetFolder}'`
        };
      }
    }
    
    // Handle search/filter commands - more flexible matching
    if (this.containsAny(normalizedCommand, ["show", "find", "display", "list", "get", "search", "filter", "where"])) {
      // File type filtering - enhanced to handle more variations
      if (this.containsAny(normalizedCommand, ["pdf", "pdfs", "document", "documents", "doc", "docx", "text files"])) {
        const docTypes = ["pdf", "doc", "docx", "txt"];
        const docFiles = files.filter(file => docTypes.includes(file.type));
        return {
          files: docFiles,
          action: "filter",
          message: `Found ${docFiles.length} document files`
        };
      }
      
      if (this.containsAny(normalizedCommand, ["image", "images", "jpg", "jpeg", "png", "photo", "photos", "picture", "pictures"])) {
        const imageTypes = ["jpg", "jpeg", "png", "gif", "svg", "webp"];
        const imageFiles = files.filter(file => imageTypes.includes(file.type));
        return {
          files: imageFiles,
          action: "filter",
          message: `Found ${imageFiles.length} image files`
        };
      }
      
      if (this.containsAny(normalizedCommand, ["video", "videos", "mp4", "movie", "movies", "film", "films"])) {
        const videoTypes = ["mp4", "mov", "avi", "mkv", "webm"];
        const videoFiles = files.filter(file => videoTypes.includes(file.type));
        return {
          files: videoFiles,
          action: "filter",
          message: `Found ${videoFiles.length} video files`
        };
      }

      if (this.containsAny(normalizedCommand, ["audio", "music", "sound", "mp3", "wav"])) {
        const audioTypes = ["mp3", "wav", "ogg", "flac", "aac"];
        const audioFiles = files.filter(file => audioTypes.includes(file.type));
        return {
          files: audioFiles,
          action: "filter",
          message: `Found ${audioFiles.length} audio files`
        };
      }
      
      // Size filtering with improved detection
      if (this.containsAny(normalizedCommand, ["large", "big", "huge", "largest"])) {
        const largeFiles = files.filter(file => file.size > 5 * 1024 * 1024); // > 5MB
        return {
          files: largeFiles,
          action: "filter",
          message: `Found ${largeFiles.length} large files (>5MB)`
        };
      }
      
      if (this.containsAny(normalizedCommand, ["small", "tiny", "smallest"])) {
        const smallFiles = files.filter(file => file.size < 1024 * 1024); // < 1MB
        return {
          files: smallFiles,
          action: "filter",
          message: `Found ${smallFiles.length} small files (<1MB)`
        };
      }
      
      // Date filtering with more natural phrases
      if (this.containsAny(normalizedCommand, ["recent", "newest", "latest", "new", "last", "just added"])) {
        const recentFiles = [...files].sort((a, b) => b.modified.getTime() - a.modified.getTime());
        return {
          files: recentFiles.slice(0, 10), // Top 10 most recent
          action: "filter",
          message: "Showing the most recent files"
        };
      }
      
      if (this.containsAny(normalizedCommand, ["old", "oldest", "earlier", "first created"])) {
        const oldestFiles = [...files].sort((a, b) => a.modified.getTime() - b.modified.getTime());
        return {
          files: oldestFiles.slice(0, 10), // Top 10 oldest
          action: "filter",
          message: "Showing the oldest files"
        };
      }
      
      // Name-based filtering
      if (normalizedCommand.includes("name")) {
        const nameMatch = normalizedCommand.match(/name\s+(?:contains|with|having|like|containing)?\s*["']?([a-z0-9_\s-]+)["']?/i);
        if (nameMatch && nameMatch[1]) {
          const searchTerm = nameMatch[1].trim();
          const matchedFiles = files.filter(file => file.name.toLowerCase().includes(searchTerm));
          return {
            files: matchedFiles,
            action: "filter",
            message: `Found ${matchedFiles.length} files with name containing "${searchTerm}"`
          };
        }
      }
    }
    
    // Advanced intent: Find duplicates with more variations
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
      
      console.log(`Found ${potentialDuplicates.length} potential duplicates`);
      return {
        files: potentialDuplicates,
        action: "filter",
        message: `Found ${potentialDuplicates.length} potential duplicate files`
      };
    }
    
    // Sort commands
    if (this.containsAny(normalizedCommand, ["sort", "order", "arrange"])) {
      if (this.containsAny(normalizedCommand, ["size", "largest", "smallest"])) {
        if (this.containsAny(normalizedCommand, ["desc", "descending", "large", "largest", "biggest"])) {
          const sortedFiles = [...files].sort((a, b) => b.size - a.size);
          return {
            files: sortedFiles,
            action: "filter",
            message: "Files sorted by size (largest first)"
          };
        } else {
          const sortedFiles = [...files].sort((a, b) => a.size - b.size);
          return {
            files: sortedFiles,
            action: "filter",
            message: "Files sorted by size (smallest first)"
          };
        }
      }
      
      if (this.containsAny(normalizedCommand, ["date", "time", "newest", "oldest", "recent"])) {
        if (this.containsAny(normalizedCommand, ["desc", "descending", "new", "newest", "recent", "latest"])) {
          const sortedFiles = [...files].sort((a, b) => b.modified.getTime() - a.modified.getTime());
          return {
            files: sortedFiles,
            action: "filter",
            message: "Files sorted by date (newest first)"
          };
        } else {
          const sortedFiles = [...files].sort((a, b) => a.modified.getTime() - b.modified.getTime());
          return {
            files: sortedFiles,
            action: "filter",
            message: "Files sorted by date (oldest first)"
          };
        }
      }
      
      if (this.containsAny(normalizedCommand, ["name", "alphabetical", "alpha"])) {
        if (this.containsAny(normalizedCommand, ["desc", "descending", "reverse", "z-a"])) {
          const sortedFiles = [...files].sort((a, b) => b.name.localeCompare(a.name));
          return {
            files: sortedFiles,
            action: "filter",
            message: "Files sorted alphabetically (Z-A)"
          };
        } else {
          const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));
          return {
            files: sortedFiles,
            action: "filter",
            message: "Files sorted alphabetically (A-Z)"
          };
        }
      }
    }
    
    // Command not recognized but attempted
    if (normalizedCommand.length > 0) {
      console.log("Command not understood:", normalizedCommand);
      return {
        files: files,
        action: "unknown",
        message: "I'm not sure how to process that command. Try phrases like 'Show PDF files', 'Find duplicates', 'Sort by size', 'Show recent files', or 'Move documents to new folder'."
      };
    }
    
    // Default: return all files
    return {
      files: files,
      action: "none"
    };
  }
  
  // Improved helper method to check if command contains any of the phrases
  private static containsAny(command: string, phrases: string[]): boolean {
    return phrases.some(phrase => command.includes(phrase));
  }
}
