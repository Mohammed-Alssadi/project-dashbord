import { AccordionContent, AccordionItem, AccordionTrigger } from "../../../../components/ui/accordion";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";
import { Plus, ChevronDown, Loader2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { useProductEditStore } from "../../store/productEditStore";
import { useProductVariants } from "../../hooks/useProductVariants";
import { VariantsTable } from "./components/VariantsTable";
import { NewOptionModal } from "./components/NewOptionModal";
import { NewValueModal } from "./components/NewValueModal";

export function VariantsSection() {
  const { isLoading, unifiedProduct } = useProductEditStore();
  const {
    variantFields,
    variantTypes,
    variantsRows,
    activeStockIdx,
    tempStocks,
    isNewOptionModalOpen,
    newOptionName,
    newOptionType,
    newOptionValues,
    collapsedValueIds,
    isNewValueModalOpen,
    newValueName,
    platform,
    removeVariant,
    handleAddRow,
    handleRemoveRow,
    handleChangeType,
    handleToggleValue,
    openStockModal,
    saveStockModal,
    closeStockModal,
    setTempStocks,
    setIsNewOptionModalOpen,
    setNewOptionName,
    setNewOptionType,
    toggleCollapseValue,
    setIsNewValueModalOpen,
    setNewValueName,
    activeTypeIdForNewValue,
    setActiveTypeIdForNewValue,
    handleAddOptionValue,
    handleRemoveOptionValue,
    handleOptionValueLabelChange,
    handleOptionValueColorChange,
    handleCreateNewOption,
    handleCreateNewValue,
    handleGenerateVariants,
    pendingDeleteOptionId,
    setPendingDeleteOptionId,
    handleConfirmDeleteOption,
    pendingDeleteVariantIdx,
    setPendingDeleteVariantIdx,
    handleConfirmDeleteVariant,
    pendingTypeChange,
    setPendingTypeChange,
    handleConfirmTypeChange,
    showConfirmButton,
    watch
  } = useProductVariants();

  const hasActiveSelections = variantsRows.length > 0 && variantsRows.every(row => row.typeId && row.selectedValues.length > 0);

  // إصلاح #11: حساب عدد التوليفات المتوقعة لعرضه في زر "تأكيد"
  const expectedCombinations = variantsRows
    .filter(r => r.typeId && r.selectedValues.length > 0)
    .reduce((count, row) => count * row.selectedValues.length, 1);


  if (!unifiedProduct) return null;

  return (
    <AccordionItem value="variants" className="border rounded-xl bg-card shadow-sm px-6">
      <AccordionTrigger className="hover:no-underline py-6">
        <div className="flex flex-col items-start gap-1 text-right">
          <h3 className="text-xl font-semibold tracking-tight">خيارات المنتج</h3>
          <p className="text-sm text-muted-foreground font-normal">
            الخيارات الفرعية مثل: الحجم، اللون، والخصائص الأخرى
          </p>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-2 pb-4">

          {/* ── حالة التحميل ────────────────────────────────────────────── */}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>جاري تحميل الخيارات...</span>
            </div>
          )}

          {/* ── لا توجد خيارات في API ──────────────────────────────────── */}
          {!isLoading && variantTypes.length === 0 && variantsRows.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm border rounded-xl border-dashed bg-muted/5">
              <p className="font-medium mb-1">لا توجد خيارات متاحة في المتجر</p>
              <p className="text-xs">يمكنك إنشاء خيار جديد من الزر أدناه</p>
            </div>
          )}

          {/* ── صفوف الخيارات ────────────────────────────────────────────── */}
          <div className="space-y-4">
            {variantsRows.map((vRow) => {
              const currentType = variantTypes.find(t => t.id === vRow.typeId);
              return (
                <div key={vRow.id} className="flex flex-col md:flex-row items-end gap-4 pb-4 border-b last:border-b-0 border-border">
                  {/* نوع الخيار */}
                  <div className="space-y-2 flex-1 w-full md:w-auto">
                    <Label>نوع الخيار</Label>
                    <Select value={vRow.typeId} onValueChange={(val) => handleChangeType(vRow.id, val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الخيار..." />
                      </SelectTrigger>
                      <SelectContent>
                        {variantTypes.map(t => (
                          <SelectItem
                            key={t.id}
                            value={t.id}
                            disabled={variantsRows.some(v => v.id !== vRow.id && v.typeId === t.id)}
                          >
                            {t.label}
                          </SelectItem>
                        ))}
                        <SelectSeparator />
                        <SelectItem value="create-new" className="text-primary font-medium py-2">
                          + إنشاء خيار جديد
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* قيم الخيار */}
                  <div className="space-y-2 flex-1 w-full md:w-auto">
                    <Label>القيم (اختيار متعدد)</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild disabled={!vRow.typeId}>
                        <button type="button" className="flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none hover:bg-muted/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          {/* إصلاح #12 (#27): badge يُظهر عدد القيم المُختارة في القائمة المغلقة */}
                          <div className="flex items-center gap-2 truncate">
                            {vRow.selectedValues.length > 0 && (
                              <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
                                {vRow.selectedValues.length}
                              </span>
                            )}
                            <span className="truncate">
                              {vRow.selectedValues.length > 0 && currentType
                                ? vRow.selectedValues.map((vId: string) => currentType.values.find(v => v.id === vId)?.label ?? vId).join('، ')
                                : vRow.typeId ? 'اختر القيم...' : 'يجب اختيار نوع الخيار أولاً'}
                            </span>
                          </div>
                          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px] rtl max-h-56 overflow-y-auto" align="center">
                        <DropdownMenuLabel>القيم المتاحة — {currentType?.label}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {currentType?.values.map(val => (
                          <DropdownMenuItem
                            key={val.id}
                            className="flex items-center gap-3 p-3 cursor-pointer"
                            onSelect={(e) => { e.preventDefault(); handleToggleValue(vRow.id, val.id); }}
                          >
                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${vRow.selectedValues.includes(val.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background'}`}>
                              {vRow.selectedValues.includes(val.id) && (
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
                                  <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                </svg>
                              )}
                            </div>
                            <span className="text-sm font-medium">{val.label}</span>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <button
                          type="button"
                          className="w-full text-start px-3 py-2 text-sm text-primary font-medium hover:bg-muted rounded-sm transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentType) {
                              setActiveTypeIdForNewValue(currentType.id);
                              setIsNewValueModalOpen(true);
                            }
                          }}
                        >
                          + إضافة قيمة جديدة
                        </button>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => handleRemoveRow(vRow.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* زر إضافة خيار جديد متموضع في المنتصف بشكل أكبر */}
          <div className="w-full flex justify-center py-6 border-t border-b border-border/40 mt-4">
            <Button
              type="button"
              variant="outline"
              size="default"
              className="gap-2 px-8 py-6 text-base border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all rounded-xl"
              onClick={handleAddRow}
            >
              <Plus className="h-5 w-5" />
              إضافة خيار جديد للمنتج
            </Button>
          </div>

          {/* زر تأكيد وإنشاء المتغيرات - يظهر فقط عند وجود خيارات وبحاجة للتوليد */}
          {showConfirmButton && variantsRows.length > 0 && (
            <div className="w-full flex justify-center pt-4">
              <Button
                type="button"
                variant={hasActiveSelections ? "default" : "secondary"}
                disabled={!hasActiveSelections}
                className={`w-full max-w-md py-6 text-base font-semibold rounded-xl gap-2 transition-all shadow-md ${hasActiveSelections
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20"
                    : "opacity-60 cursor-not-allowed bg-muted text-muted-foreground border border-border"
                  }`}
                onClick={handleGenerateVariants}
              >
                {/* إصلاح #11 (#25): إظهار عداد التوليفات المتوقعة في زر التأكيد */}
                {hasActiveSelections
                  ? `تأكيد وإنشاء ${expectedCombinations} ${expectedCombinations > 10 ? 'متغير' : 'متغيرات'}`
                  : 'تأكيد وإنشاء المتغيرات (يرجى اختيار القيم أولاً)'}
              </Button>
            </div>
          )}

          {variantFields.length > 0 && (
            <VariantsTable
              variantFields={variantFields}
              variantTypes={variantTypes}
              variantsRows={variantsRows}
              activeStockIdx={activeStockIdx}
              tempStocks={tempStocks}
              setTempStocks={setTempStocks}
              openStockModal={openStockModal}
              saveStockModal={saveStockModal}
              closeStockModal={closeStockModal}
              removeVariant={removeVariant}
              platform={platform}
            />
          )}
        </div>
      </AccordionContent>

      <NewOptionModal
        isOpen={isNewOptionModalOpen}
        onOpenChange={setIsNewOptionModalOpen}
        newOptionName={newOptionName}
        setNewOptionName={setNewOptionName}
        newOptionType={newOptionType}
        setNewOptionType={setNewOptionType}
        newOptionValues={newOptionValues}
        collapsedValueIds={collapsedValueIds}
        toggleCollapseValue={toggleCollapseValue}
        handleAddOptionValue={handleAddOptionValue}
        handleRemoveOptionValue={handleRemoveOptionValue}
        handleOptionValueLabelChange={handleOptionValueLabelChange}
        handleOptionValueColorChange={handleOptionValueColorChange}
        handleCreateNewOption={handleCreateNewOption}
      />

      <NewValueModal
        isOpen={isNewValueModalOpen}
        onOpenChange={setIsNewValueModalOpen}
        newValueName={newValueName}
        setNewValueName={setNewValueName}
        handleCreateNewValue={handleCreateNewValue}
        activeTypeId={activeTypeIdForNewValue}
        variantTypes={variantTypes}
      />

      {/* إصلاح #13 (#28): Dialog مخصص لتأكيد حذف الخيار نهائياً من سلة بدلاً من window.confirm البدائي */}
      <Dialog open={!!pendingDeleteOptionId} onOpenChange={(open) => !open && setPendingDeleteOptionId(null)}>
        <DialogContent className="max-w-md rtl">
          <DialogHeader>
            <DialogTitle className="text-destructive font-bold text-lg">تأكيد حذف الخيار</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2">
              هل أنت متأكد من رغبتك في حذف هذا الخيار وكافة قيمه ومتغيراته نهائياً من المتجر؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end pt-4">
            <Button variant="outline" type="button" onClick={() => setPendingDeleteOptionId(null)}>
              إلغاء
            </Button>
            <Button variant="destructive" type="button" onClick={handleConfirmDeleteOption}>
              حذف نهائياً
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog تأكيد حذف المتغير */}
      <Dialog open={pendingDeleteVariantIdx !== null} onOpenChange={(open) => !open && setPendingDeleteVariantIdx(null)}>
        <DialogContent className="max-w-md rtl">
          <DialogHeader>
            <DialogTitle className="text-destructive font-bold text-lg">تأكيد حذف المتغير</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2">
              {pendingDeleteVariantIdx !== null && (
                <>
                  هل أنت متأكد من حذف المتغير{' '}
                  <strong className="text-foreground">
                    {watch(`variants.${pendingDeleteVariantIdx}.displayName`) || `#${pendingDeleteVariantIdx + 1}`}
                  </strong>
                  {' '}نهائياً من المتجر؟ لا يمكن التراجع عن هذا الإجراء.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end pt-4">
            <Button variant="outline" type="button" onClick={() => setPendingDeleteVariantIdx(null)}>
              إلغاء
            </Button>
            <Button variant="destructive" type="button" onClick={handleConfirmDeleteVariant}>
              حذف نهائياً
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog تأكيد تغيير نوع الخيار — يُحذِّر من مسح بيانات المتغيرات */}
      <Dialog open={!!pendingTypeChange} onOpenChange={(open) => !open && setPendingTypeChange(null)}>
        <DialogContent className="max-w-md rtl">
          <DialogHeader>
            <DialogTitle className="text-amber-600 font-bold text-lg">تحذير: سيتم مسح المتغيرات</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2">
              تغيير نوع الخيار سيؤدي إلى <strong className="text-foreground">مسح جميع المتغيرات الحالية</strong> وبياناتها (الأسعار، الكميات، SKUs). هل تريد المتابعة؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end pt-4">
            <Button variant="outline" type="button" onClick={() => setPendingTypeChange(null)}>
              إلغاء
            </Button>
            <Button variant="destructive" type="button" onClick={handleConfirmTypeChange}>
              نعم، تغيير وحذف المتغيرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AccordionItem>
  );
}
