import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../../../components/ui/accordion";
import { Button } from "../../../../components/ui/button";
import { Plus, GripVertical, Trash2, Edit2 } from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Checkbox } from "../../../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { useProductEditStore } from "../../store/productEditStore";

const FIELD_TYPE_LABELS: Record<string, string> = {
  DROPDOWN: 'قائمة منسدلة',
  CHECKBOX: 'اختيار متعدد',
  RADIO: 'اختيار واحد',
  TEXT: 'حقل نصي',
  TEXTAREA: 'نص طويل',
  DATE: 'تاريخ',
  FILE: 'رفع ملف',
};

const FIELD_TYPE_ICONS: Record<string, string> = {
  DROPDOWN: '≡',
  CHECKBOX: '✓',
  RADIO: '◎',
  TEXT: 'T',
  TEXTAREA: '¶',
  DATE: '📅',
  FILE: '📎',
};

export function CustomizationsSection() {
  const { unifiedProduct } = useProductEditStore();
  const { control, watch } = useFormContext();
  const { fields: customFields, remove, append, update } = useFieldArray({
    control,
    name: 'customOptions'
  });

  // التحكم بنوافذ التعديل والإضافة
  const [activeCustomOptIdx, setActiveCustomOptIdx] = useState<number | null>(null);
  const [isNewOptOpen, setIsNewOptOpen] = useState(false);

  // حالة خيار التخصيص النشط للتعديل أو الإضافة
  const [editLabel, setEditLabel] = useState('');
  const [editType, setEditType] = useState('TEXT');
  const [editRequired, setEditRequired] = useState(false);
  const [editChoices, setEditChoices] = useState<string[]>([]);
  const [newChoiceInput, setNewChoiceInput] = useState('');

  if (!unifiedProduct || !unifiedProduct.customOptions) {
    return null;
  }

  const handleOpenEdit = (index: number) => {
    const item = watch(`customOptions.${index}`);
    if (item) {
      setActiveCustomOptIdx(index);
      setEditLabel(item.label || '');
      setEditType(item.type || 'TEXT');
      setEditRequired(item.isRequired || false);
      setEditChoices(Array.isArray(item.choices) ? item.choices.map((c: any) => c.label) : []);
    }
  };

  const handleSaveEdit = () => {
    if (activeCustomOptIdx !== null) {
      const originalItem = watch(`customOptions.${activeCustomOptIdx}`);
      const updatedChoices = editChoices.map((c, idx) => ({
        id: originalItem?.choices?.[idx]?.id || `choice-${Date.now()}-${idx}`,
        label: c
      }));

      update(activeCustomOptIdx, {
        ...originalItem,
        label: editLabel,
        type: editType,
        isRequired: editRequired,
        choices: updatedChoices
      });
      setActiveCustomOptIdx(null);
    }
  };

  const handleOpenCreate = () => {
    setEditLabel('');
    setEditType('TEXT');
    setEditRequired(false);
    setEditChoices([]);
    setNewChoiceInput('');
    setIsNewOptOpen(true);
  };

  const handleSaveCreate = () => {
    if (editLabel.trim()) {
      append({
        id: `opt-${Date.now()}`,
        type: editType,
        label: editLabel,
        isRequired: editRequired,
        choices: editChoices.map((c, idx) => ({
          id: `choice-${Date.now()}-${idx}`,
          label: c
        }))
      });
      setIsNewOptOpen(false);
    }
  };

  const handleAddChoice = () => {
    if (newChoiceInput.trim() && !editChoices.includes(newChoiceInput.trim())) {
      setEditChoices([...editChoices, newChoiceInput.trim()]);
      setNewChoiceInput('');
    }
  };

  const handleRemoveChoice = (index: number) => {
    setEditChoices(editChoices.filter((_, idx) => idx !== index));
  };

  const typeHasChoices = ['DROPDOWN', 'CHECKBOX', 'RADIO'].includes(editType);

  return (
    <AccordionItem value="customizations" className="border rounded-xl bg-card shadow-sm px-6">
      <AccordionTrigger className="hover:no-underline py-6">
        <div className="flex flex-col items-start gap-1 text-right">
          <h3 className="text-xl font-semibold tracking-tight">تخصيص المنتج</h3>
          <p className="text-sm text-muted-foreground font-normal">
            حقول تظهر للعميل في صفحة المنتج لجمع معلومات إضافية عند الطلب
          </p>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-2 pb-4">

          {/* ── لا توجد حقول تخصيص ─────────────────────────────────────── */}
          {customFields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm border rounded-xl border-dashed bg-muted/5">
              <p className="font-medium mb-1">لا توجد حقول تخصيص</p>
              <p className="text-xs">أضف حقلاً ليتمكن العميل من تخصيص طلبه</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customFields.map((field, idx) => {
                const item = watch(`customOptions.${idx}`);
                if (!item) return null;

                const fieldType = item.type ?? '';
                const labelAr = item.label;
                const typeName = FIELD_TYPE_LABELS[fieldType] ?? fieldType;
                const typeIcon = FIELD_TYPE_ICONS[fieldType] ?? '?';
                const isRequired = item.isRequired;
                const choices = item.choices || [];

                return (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center font-bold text-muted-foreground text-sm select-none">
                        {typeIcon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-right">
                          <p className="text-sm font-medium">{labelAr}</p>
                          {isRequired && (
                            <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium">
                              مطلوب
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground text-right">{typeName}</p>
                        {choices.length > 0 && (
                          <p className="text-xs text-muted-foreground/70 text-right">
                            {choices.length} خيار
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleOpenEdit(idx)}>
                        <Edit2 className="h-3.5 w-3.5 ml-1" />
                        تعديل
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(idx)}
                        className="text-destructive border-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 flex justify-center">
            <Button type="button" variant="outline" className="gap-2" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
              إضافة تخصيص
            </Button>
          </div>
        </div>
      </AccordionContent>

      {/* ── Dialog: إضافة / تعديل تخصيص ── */}
      <Dialog open={activeCustomOptIdx !== null || isNewOptOpen} onOpenChange={(open) => { if (!open) { setActiveCustomOptIdx(null); setIsNewOptOpen(false); } }}>
        <DialogContent className="rtl max-w-lg p-6 rounded-2xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-xl font-bold text-right">
              {isNewOptOpen ? 'إنشاء حقل تخصيص جديد' : 'تعديل حقل التخصيص'}
            </DialogTitle>
            <DialogDescription className="text-right text-muted-foreground text-sm mt-1">
              قم بتهيئة الحقل وخياراته ليتمكن العميل من تخصيص منتجه.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 pr-1">
            <div className="space-y-2 text-right">
              <Label>اسم الحقل / التخصيص (مثل: الاسم المكتوب على القميص)</Label>
              <Input
                value={editLabel}
                onChange={e => setEditLabel(e.target.value)}
                placeholder="أدخل عنوان الحقل..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="space-y-2 text-right">
                <Label>نوع المدخل</Label>
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FIELD_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 rtl:space-x-reverse pt-6">
                <Checkbox
                  id="required-field"
                  checked={editRequired}
                  onCheckedChange={(checked) => setEditRequired(!!checked)}
                />
                <Label htmlFor="required-field" className="text-sm font-semibold cursor-pointer select-none">
                  حقل مطلوب للطلب
                </Label>
              </div>
            </div>

            {/* إدخال وتعديل الخيارات (Dropdown, Checkbox, Radio) */}
            {typeHasChoices && (
              <div className="space-y-3 pt-3 border-t">
                <Label className="text-sm font-bold block text-right">خيارات الإدخال المتاحة للعميل</Label>
                
                <div className="flex gap-2">
                  <Input
                    value={newChoiceInput}
                    onChange={e => setNewChoiceInput(e.target.value)}
                    placeholder="أدخل خياراً جديداً..."
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddChoice(); } }}
                  />
                  <Button type="button" onClick={handleAddChoice}>إضافة</Button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {editChoices.map((c, index) => (
                    <span key={index} className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                      <span>{c}</span>
                      <button type="button" onClick={() => handleRemoveChoice(index)} className="text-blue-400 hover:text-blue-600">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setActiveCustomOptIdx(null); setIsNewOptOpen(false); }}
              className="px-4"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={isNewOptOpen ? handleSaveCreate : handleSaveEdit}
              className="px-6"
              disabled={!editLabel.trim() || (typeHasChoices && editChoices.length === 0)}
            >
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AccordionItem>
  );
}
