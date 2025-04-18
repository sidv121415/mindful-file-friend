
import { useState } from "react";
import { Command, CommandInput, CommandList, CommandGroup, CommandItem } from "@/components/ui/command";
import { NLPProcessor } from "../utils/nlpProcessor";
import { FileItem } from "@/types/file";
import { toast } from "@/hooks/use-toast";

interface CommandProcessorProps {
  files: FileItem[];
  onCommandProcessed: (files: FileItem[], action: string, message?: string) => void;
}

export function CommandProcessor({ files, onCommandProcessed }: CommandProcessorProps) {
  const [command, setCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandSuggestions] = useState<string[]>([
    "Show all PDF files",
    "Find duplicate files",
    "Sort by size",
    "Find large files",
    "Show most recent files",
    "Move screenshots larger than 2MB to [SCREENSHOTS]"
  ]);

  const processCommand = () => {
    if (!command.trim()) return;
    
    setIsProcessing(true);
    
    const result = NLPProcessor.processCommand(command, files);
    
    if (result.action === "download") {
      onCommandProcessed(result.files, "download", result.message);
    } else {
      onCommandProcessed(result.files, result.action, result.message);
    }
    
    setIsProcessing(false);
    
    if (result.message) {
      toast({
        title: "Command Processed",
        description: result.message,
      });
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <Command className="rounded-lg border">
        <CommandInput 
          placeholder="Enter command (e.g., 'Move documents', 'Show PDFs')"
          value={command}
          onValueChange={setCommand}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              processCommand();
            }
          }}
        />
        <CommandList>
          {command && (
            <CommandGroup heading="Try these commands">
              {commandSuggestions
                .filter(sugg => 
                  sugg.toLowerCase().includes(command.toLowerCase()) && 
                  sugg.toLowerCase() !== command.toLowerCase()
                )
                .map(sugg => (
                  <CommandItem 
                    key={sugg}
                    onSelect={() => {
                      setCommand(sugg);
                      processCommand();
                    }}
                  >
                    {sugg}
                  </CommandItem>
                ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </div>
  );
}
