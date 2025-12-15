import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { areSoundsEnabled, toggleSounds } from "@/lib/sounds";
import { useState } from "react";

export function SoundToggle() {
  const [enabled, setEnabled] = useState(areSoundsEnabled());

  const handleToggle = () => {
    toggleSounds();
    setEnabled(areSoundsEnabled());
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="relative"
          >
            {enabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{enabled ? "Desativar sons" : "Ativar sons"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
