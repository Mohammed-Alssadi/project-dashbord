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
import { Trash2, Plus } from "lucide-react";

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
  handleAddOptionValue,
  handleRemoveOptionValue,
  handleOptionValueLabelChange,
  handleOptionValueColorChange,
  handleCreateNewOption,
}: NewOptionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rtl p-6 rounded-xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold text-right text-primary">إنشاء خيار منتج جديد</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* قسم تعريف الخيار: الاسم والنوع أفقي متساويين كلياً */}
          <div className="p-5 border rounded-xl bg-muted/5 border-border/80 grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
            <div className="space-y-1.5 text-right w-full">
              <Label className="text-sm font-bold text-foreground">اسم خيار المنتج</Label>
              <Input
                placeholder="أدخل اسم الخيار (مثال: اللون، المقاس، المادة)"
                value={newOptionName}
                onChange={e => setNewOptionName(e.target.value)}
                className="h-11 rounded-xl text-right placeholder:text-muted-foreground/60 w-full"
              />
            </div>

            <div className="space-y-1.5 text-right w-full">
              <Label className="text-sm font-bold text-foreground">نوع الخيار</Label>
              <Select value={newOptionType || undefined} onValueChange={setNewOptionType}>
                <SelectTrigger className="h-11 rounded-xl w-full text-right cursor-pointer">
                  <SelectValue placeholder="اختر نوع الخيار من القائمة" />
                </SelectTrigger>
                <SelectContent className="rtl">
                  <SelectItem value="color">اللون</SelectItem>
                  <SelectItem value="size">المقاس</SelectItem>
                  <SelectItem value="text">حقل نصي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* قسم القيم: يظهر بشكل ديناميكي تفاعلي بعد اختيار النوع */}
          {!newOptionType ? (
            <div className="border border-dashed border-border/80 rounded-xl p-8 text-center text-muted-foreground text-sm bg-muted/5">
              يرجى اختيار "نوع الخيار" أولاً لتتمكن من إضافة وتعبئة قيم الخيار للمنتج.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-primary/30 text-primary hover:bg-primary/5 text-xs font-semibold px-4 h-9 gap-1"
                  onClick={handleAddOptionValue}
                >
                  <Plus className="h-3.5 w-3.5" />
                  أضف قيمة جديدة
                </Button>
                <h4 className="text-base font-bold text-foreground text-right">القيم المتاحة لهذا الخيار</h4>
              </div>

              <div className="space-y-3">
                {newOptionValues.map((val, i) => (
                  <div key={val.id} className="flex flex-row items-center gap-3 border rounded-2xl p-3 bg-card hover:shadow-sm border-border/80 transition-all rtl">
                    <div className="text-sm font-bold text-muted-foreground/80 shrink-0 min-w-[70px] text-right">
                      القيمة {i + 1}
                    </div>

                    <div className="flex-1">
                      <Input
                        placeholder={
                          newOptionType === 'color'
                            ? "مثال: أحمر، أزرق، أسود"
                            : newOptionType === 'size'
                            ? "مثال: S، M، XL"
                            : "أدخل القيمة المطلوبة"
                        }
                        value={val.label}
                        onChange={e => handleOptionValueLabelChange(val.id, e.target.value)}
                        className="h-11 rounded-xl text-right placeholder:text-muted-foreground/50"
                      />
                    </div>

                    {newOptionType === 'color' && (
                      <div className="flex items-center gap-2.5 border rounded-xl px-3 h-11 bg-muted/10 border-border/60 shrink-0">
                        <span className="text-[11px] text-muted-foreground/90 font-medium">لون العنصر</span>
                        <input
                          type="color"
                          value={val.color || '#000000'}
                          onChange={(e) => handleOptionValueColorChange(val.id, e.target.value)}
                          className="w-7 h-7 rounded-full border shadow-sm cursor-pointer p-0 overflow-hidden bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full shrink-0"
                        />
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-11 w-11 rounded-xl shrink-0 cursor-pointer transition-colors"
                      onClick={() => handleRemoveOptionValue(val.id)}
                      disabled={newOptionValues.length === 1}
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row gap-3 border-t pt-5">
          <Button
            type="button"
            className="flex-1 h-12 bg-primary text-primary-foreground font-bold rounded-xl text-sm transition-all hover:bg-primary/95"
            onClick={handleCreateNewOption}
            disabled={!newOptionName.trim() || !newOptionType || newOptionValues.some(v => !v.label.trim())}
          >
            إنشاء الخيار والقيم
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-12 border-border font-semibold rounded-xl text-sm transition-all hover:bg-muted/10"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
