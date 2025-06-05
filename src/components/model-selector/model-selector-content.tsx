'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Model, Provider } from '@/types/model.type';

interface ModelSelectorContentProps {
  providers: Provider[];
  selectedModelId?: string;
  onModelSelect: (model: Model) => void;
}

export function ModelSelectorContent({
  providers,
  selectedModelId,
  onModelSelect,
}: ModelSelectorContentProps) {
  return (
    <RadioGroup
      value={selectedModelId}
      onValueChange={(value) => {
        const model = providers
          .flatMap((provider) => provider.models)
          .find((model) => model.id === value);
        if (model) onModelSelect(model);
      }}
      className="space-y-4"
    >
      {providers.map((provider) => (
        <div key={provider.id} className="space-y-2">
          <div className="bg-muted/50 p-2 font-medium">{provider.name}</div>
          <div className="space-y-2 p-2">
            {provider.models.map((model) => (
              <Label
                key={model.id}
                htmlFor={model.id}
                className={`flex items-center gap-2 rounded-md border p-2 ${
                  selectedModelId === model.id ? 'border-primary bg-primary/10' : ''
                }`}
              >
                <RadioGroupItem value={model.id} id={model.id} />
                <span>{model.name}</span>
              </Label>
            ))}
          </div>
        </div>
      ))}
    </RadioGroup>
  );
}
