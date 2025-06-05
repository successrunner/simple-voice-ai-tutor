import { ChevronDown } from 'lucide-react';

import { AVAILABLE_PROVIDERS } from '@/constants/models';
import { Model } from '@/types/model.type';

import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ModelSelectorContent } from './model-selector-content';

interface ModelSelectorProps {
  open: boolean;
  selectedModel: Model;
  onOpenChange: (open: boolean) => void;
  handleModelSelect: (model: Model) => void;
}

export default function ModelSelector({
  open,
  selectedModel,
  onOpenChange,
  handleModelSelect,
}: ModelSelectorProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-10 w-full justify-between px-3 text-left"
        >
          <span className="truncate text-sm">
            {selectedModel ? (
              <>
                <span className="font-medium">{selectedModel.name}</span>
                <span className="text-muted-foreground ml-1 text-xs">
                  ({selectedModel.provider})
                </span>
              </>
            ) : (
              'Select a Model...'
            )}
          </span>
          <ChevronDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0">
        <div className="text-muted-foreground border-b p-1.5 text-center text-xs">
          Available Models
        </div>
        <div className="custom-scrollbar max-h-[40vh] overflow-y-auto p-1.5">
          <ModelSelectorContent
            providers={AVAILABLE_PROVIDERS}
            selectedModelId={selectedModel.id}
            onModelSelect={handleModelSelect}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
