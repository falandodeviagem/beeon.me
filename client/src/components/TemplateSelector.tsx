import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { FileText, ChevronDown, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  category: string;
  onSelect: (content: string) => void;
  disabled?: boolean;
}

export function TemplateSelector({ category, onSelect, disabled }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: templates } = trpc.moderation.getTemplates.useQuery({ category });
  const useMutation = trpc.moderation.useTemplate.useMutation();

  const handleSelect = async (template: any) => {
    setSelectedId(template.id);
    onSelect(template.content);
    setOpen(false);
    
    // Increment use count
    try {
      await useMutation.mutateAsync({ id: template.id });
    } catch (e) {
      // Silent fail for use count
    }
  };

  if (!templates || templates.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-2"
        >
          <FileText className="w-4 h-4" />
          Usar Template
          <ChevronDown className="w-3 h-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar template..." />
          <CommandList>
            <CommandEmpty>Nenhum template encontrado</CommandEmpty>
            <CommandGroup>
              {templates.map((template: any) => (
                <CommandItem
                  key={template.id}
                  value={template.name}
                  onSelect={() => handleSelect(template)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedId === template.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{template.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{template.content.substring(0, 50)}...</p>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">{template.useCount}x</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
