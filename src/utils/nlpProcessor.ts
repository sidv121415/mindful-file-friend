
// A simplified NLP processor to handle natural language commands for file operations

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
}

export class NLPProcessor {
  // Process natural language commands
  static processCommand(command: string, files: FileItem[]): ProcessResult {
    const normalizedCommand = command.toLowerCase().trim();
    
    // Intent and entity recognition (simplified)
    if (this.matchIntent(normalizedCommand, ["show", "find", "display", "list", "get"])) {
      // File type filtering
      if (this.matchEntity(normalizedCommand, ["pdf", "pdfs", "document", "documents"])) {
        const pdfFiles = files.filter(file => file.type === "pdf");
        return {
          files: pdfFiles,
          action: "filter",
          message: `Found ${pdfFiles.length} PDF documents`
        };
      }
      
      if (this.matchEntity(normalizedCommand, ["image", "images", "jpg", "jpeg", "png"])) {
        const imageFiles = files.filter(file => ["jpg", "jpeg", "png", "gif"].includes(file.type));
        return {
          files: imageFiles,
          action: "filter",
          message: `Found ${imageFiles.length} image files`
        };
      }
      
      if (this.matchEntity(normalizedCommand, ["video", "videos", "mp4", "movie", "movies"])) {
        const videoFiles = files.filter(file => ["mp4", "mov", "avi", "mkv"].includes(file.type));
        return {
          files: videoFiles,
          action: "filter",
          message: `Found ${videoFiles.length} video files`
        };
      }
      
      // Size filtering
      if (this.matchEntity(normalizedCommand, ["large", "big"])) {
        const largeFiles = files.filter(file => file.size > 5 * 1024 * 1024); // > 5MB
        return {
          files: largeFiles,
          action: "filter",
          message: `Found ${largeFiles.length} large files (>5MB)`
        };
      }
      
      if (this.matchEntity(normalizedCommand, ["small"])) {
        const smallFiles = files.filter(file => file.size < 1024 * 1024); // < 1MB
        return {
          files: smallFiles,
          action: "filter",
          message: `Found ${smallFiles.length} small files (<1MB)`
        };
      }
      
      // Date filtering
      if (this.matchEntity(normalizedCommand, ["recent", "newest", "latest"])) {
        const recentFiles = [...files].sort((a, b) => b.modified.getTime() - a.modified.getTime());
        return {
          files: recentFiles.slice(0, 10), // Top 10 most recent
          action: "filter",
          message: "Showing the most recent files"
        };
      }
      
      if (this.matchEntity(normalizedCommand, ["old", "oldest"])) {
        const oldestFiles = [...files].sort((a, b) => a.modified.getTime() - b.modified.getTime());
        return {
          files: oldestFiles.slice(0, 10), // Top 10 oldest
          action: "filter",
          message: "Showing the oldest files"
        };
      }
    }
    
    // Advanced intent: Find duplicates
    if (this.matchIntent(normalizedCommand, ["duplicate", "duplicates", "same"])) {
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
    
    // Command not recognized
    if (normalizedCommand.length > 0) {
      return {
        files: files,
        action: "unknown",
        message: "Command not understood. Please try something like 'Show all PDFs' or 'Find large files'."
      };
    }
    
    // Default: return all files
    return {
      files: files,
      action: "none"
    };
  }
  
  // Helper method to match intent from command
  private static matchIntent(command: string, intents: string[]): boolean {
    return intents.some(intent => command.includes(intent));
  }
  
  // Helper method to match entity from command
  private static matchEntity(command: string, entities: string[]): boolean {
    return entities.some(entity => command.includes(entity));
  }
}
