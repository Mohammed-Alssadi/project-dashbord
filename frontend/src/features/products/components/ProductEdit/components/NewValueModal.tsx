import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NewValueModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newValueName: string;
  setNewValueName: (val: string) => void;
  handleCreateNewValue: (name: string, color?: string) => Promise<void>;
  activeTypeId: string | null;
  variantTypes: Array<{ id: string; label: string }>;
}

export function NewValueModal({
  isOpen,
  onOpenChange,
  newValueName,
  setNewValueName,
  handleCreateNewValue,
  activeTypeId,
  variantTypes,
}: NewValueModalProps) {
  const activeTypeLabel = variantTypes.find(t => t.id === activeTypeId)?.label || 'الخيار';
  const isColorOption = activeTypeLabel === 'اللون' || activeTypeLabel.toLowerCase().includes('color') || activeTypeLabel.toLowerCase() === 'لون';
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    if (isOpen) {
      setColor('#000000');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (newValueName.trim()) {
      handleCreateNewValue(newValueName, isColorOption ? color : undefined);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rtl">
        <DialogHeader>
          <DialogTitle>إضافة قيمة جديدة</DialogTitle>
          <DialogDescription className="text-right">
            إضافة قيمة جديدة لـ "{activeTypeLabel}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 text-right">
          {isColorOption && (
            <div className="space-y-1.5 flex flex-col items-start rtl:items-end">
              <Label className="text-xs text-muted-foreground mb-1 block">اللون</Label>
              <button
                type="button"
                className="w-10 h-10 rounded-full border shadow-sm relative overflow-hidden cursor-pointer flex items-center justify-center"
                style={{ backgroundColor: color }}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("new-value-color-picker")?.click();
                }}
              >
                <input
                  id="new-value-color-picker"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </button>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>اسم القيمة</Label>
            <Input
              placeholder="أدخل اسم القيمة..."
              value={newValueName}
              onChange={e => setNewValueName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newValueName.trim()) {
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter className="flex flex-row gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!newValueName.trim()}>
            إضافة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
