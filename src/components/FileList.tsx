
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { File, FileText, FileImage, FileVideo, FileAudio, FileArchive, HelpCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  modified: Date;
  path: string;
}

interface FileListProps {
  files: FileItem[];
}

export function FileList({ files }: FileListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredFiles = useMemo(() => {
    if (!searchTerm.trim()) return files;
    
    const term = searchTerm.toLowerCase();
    return files.filter(file => 
      file.name.toLowerCase().includes(term) || 
      file.type.toLowerCase().includes(term)
    );
  }, [files, searchTerm]);
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };
  
  // Get appropriate icon for file type
  const getFileIcon = (fileType: string) => {
    switch(fileType.toLowerCase()) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return <FileText className="h-4 w-4" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <FileImage className="h-4 w-4" />;
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
        return <FileVideo className="h-4 w-4" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return <FileAudio className="h-4 w-4" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <FileArchive className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center p-12">
        <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No files found</h3>
        <p className="text-muted-foreground">Try a different command or folder.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Files ({filteredFiles.length})</h3>
        <Input
          placeholder="Filter files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead>Path</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFiles.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="flex items-center space-x-2">
                  {getFileIcon(file.type)}
                  <span>{file.name}</span>
                </TableCell>
                <TableCell>{file.type.toUpperCase()}</TableCell>
                <TableCell>{formatFileSize(file.size)}</TableCell>
                <TableCell>{formatDistanceToNow(file.modified, { addSuffix: true })}</TableCell>
                <TableCell className="text-muted-foreground truncate max-w-[200px]">
                  {file.path}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
