import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";

interface NewOptionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newOptionName: string;
  setNewOptionName: (val: string) => void;
  newOptionType: string;
  setNewOptionType: (val: string) => void;
  newOptionValues: { id: string; label: string; color?: string }[];
  collapsedValueIds: string[];
  toggleCollapseValue: (id: string) => void;
  handleAddOptionValue: () => void;
  handleRemoveOptionValue: (id: string) => void;
  handleOptionValueLabelChange: (id: string, val: string) => void;
  handleOptionValueColorChange: (id: string, color: string) => void;
  handleCreateNewOption: () => Promise<void>;
}

export function NewOptionModal({
  isOpen,
  onOpenChange,
  newOptionName,
  setNewOptionName,
  newOptionType,
  setNewOptionType,
  newOptionValues,
  collapsedValueIds,
  toggleCollapseValue,
  handleAddOptionValue,
  handleRemoveOptionValue,
  handleOptionValueLabelChange,
  handleOptionValueColorChange,
  handleCreateNewOption,
}: NewOptionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rtl max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-xl font-bold text-right">إنشاء خيار</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 border rounded-xl bg-muted/10 space-y-4">
            <div className="space-y-1 text-right">
              <h4 className="text-sm font-bold text-foreground">اسم خيار المنتج</h4>
              <Label className="text-xs text-muted-foreground">اسم خيار المنتج (العربية)</Label>
              <Input
                placeholder="الاسم"
                value={newOptionName}
                onChange={e => setNewOptionName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <Select value={newOptionType} onValueChange={setNewOptionType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="color">اللون</SelectItem>
                  <SelectItem value="size">المقاس</SelectItem>
                  <SelectItem value="text">حقل نصي</SelectItem>
                </SelectContent>
              </Select>
              <Label className="shrink-0 text-sm font-semibold">نوع الخيار</Label>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-base font-bold text-foreground text-right">القيم الخاصة بخيارات المنتج</h4>
            <div className="space-y-3">
              {newOptionValues.map((val, i) => {
                const isCollapsed = collapsedValueIds.includes(val.id);
                return (
                  <div key={val.id} className="border rounded-xl p-4 bg-card shadow-sm space-y-3 transition-all">
                    <div
                      className="flex items-center justify-between border-b pb-2 cursor-pointer select-none"
                      onClick={() => toggleCollapseValue(val.id)}
                    >
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
                      <span className="text-sm font-semibold">قيمة الخيار {i + 1} {val.label ? `(${val.label})` : ''}</span>
                    </div>

                    {!isCollapsed && (
                      <>
                        <div className="flex items-end gap-3 text-right">
                          {newOptionType === 'color' && (
                            <div className="relative shrink-0 flex flex-col items-center">
                              <Label className="text-xs text-muted-foreground block mb-1.5">اللون</Label>
                              <input
                                type="color"
                                value={val.color || '#000000'}
                                onChange={(e) => handleOptionValueColorChange(val.id, e.target.value)}
                                className="w-10 h-10 rounded-full border shadow-sm cursor-pointer p-0 overflow-hidden bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full"
                              />
                            </div>
                          )}

                          <div className="flex-1 space-y-1">
                            <Label className="text-xs text-muted-foreground">قيمة خيار المنتج (العربية)</Label>
                            <Input
                              placeholder="قيمة خيار المنتج"
                              value={val.label}
                              onChange={e => handleOptionValueLabelChange(val.id, e.target.value)}
                              className="h-10"
                            />
                          </div>
                        </div>

                        <div className="flex justify-start">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs text-muted-foreground border-border hover:bg-destructive/10 hover:text-destructive h-8 px-4"
                            onClick={() => handleRemoveOptionValue(val.id)}
                            disabled={newOptionValues.length === 1}
                          >
                            حذف
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed rounded-full h-11 text-sm bg-background text-muted-foreground gap-1.5 justify-center mt-2"
              onClick={handleAddOptionValue}
            >
              أضف قيمة جديدة لهذا الخيار
            </Button>
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-2 border-t pt-4">
          <Button
            type="button"
            className="flex-1 h-11 bg-primary text-primary-foreground font-semibold rounded-full"
            onClick={handleCreateNewOption}
            disabled={!newOptionName.trim()}
          >
            إنشاء
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11 border-border font-semibold rounded-full"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
