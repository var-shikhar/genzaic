/**
 * Delivery Type Selector Component
 * Radio group for selecting product delivery method
 */

import React from 'react';
import { Download, Link2, Mail } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export type DeliveryType = 'download' | 'external_link' | 'manual';

interface DeliveryTypeOption {
  id: DeliveryType;
  icon: React.ElementType;
  title: string;
  description: string;
}

const deliveryTypeOptions: DeliveryTypeOption[] = [
  {
    id: 'download',
    icon: Download,
    title: 'Digital Download',
    description: 'Upload a file that buyers can download instantly after purchase',
  },
  {
    id: 'external_link',
    icon: Link2,
    title: 'External Link',
    description: 'Redirect buyers to a URL (Notion, Google Drive, Gumroad, etc.)',
  },
  {
    id: 'manual',
    icon: Mail,
    title: 'Manual Delivery',
    description:
      'For subscriptions, services, or custom delivery. You contact the buyer after purchase.',
  },
];

interface DeliveryTypeSelectorProps {
  value: DeliveryType;
  onChange: (value: DeliveryType) => void;
}

export function DeliveryTypeSelector({ value, onChange }: DeliveryTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-foreground mb-1">Delivery Method</h3>
        <p className="text-sm text-muted-foreground">How will buyers receive this product?</p>
      </div>

      <RadioGroup 
        value={value} 
        onValueChange={(val) => onChange(val as DeliveryType)}
        className="grid gap-3"
      >
        {deliveryTypeOptions.map((option) => (
          <label
            key={option.id}
            htmlFor={`delivery-${option.id}`}
            className={`relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              value === option.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/50'
            }`}
          >
            <RadioGroupItem 
              value={option.id} 
              id={`delivery-${option.id}`} 
              className="mt-1" 
            />
            <div className="flex-1">
              <div className="text-base font-medium flex items-center gap-2">
                <option.icon className="w-4 h-4" />
                {option.title}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
            </div>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
