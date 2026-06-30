import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Store, Link2Off, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLinkedStores } from "../hooks/useLinkedStores"

export function StoresPage() {
  const { stores, loading, disconnectStore } = useLinkedStores()

  return (
    <div className="flex flex-col gap-4 md:gap-8 w-full animate-fade-in font-sans">
      <div className="w-full space-y-6">
        
        {/* رأس الصفحة مع عنوان وزر ربط جديد */}
        <div className="flex flex-row items-center justify-between">
          <div className="grid gap-1 text-right">
            <h2 className="text-lg font-bold tracking-tight text-foreground m-0">المتاجر المرتبطة</h2>
            <p className="text-xs text-muted-foreground">جميع المتاجر التي قمت بربطها بمشروعك عبر سلة أو زد.</p>
          </div>
          {stores.length > 0 && (
            <Button asChild size="sm" className="mr-auto gap-1 border-0">
              <Link to="/connect">
                <span>ربط متجر جديد</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* عرض المتاجر ديناميكياً */}
        {loading ? (
          <div className="space-y-4 py-4 w-full">
            <div className="h-12 w-full bg-card animate-pulse rounded-lg border border-border" />
            <div className="h-12 w-full bg-card animate-pulse rounded-lg border border-border" />
          </div>
        ) : stores.length > 0 ? (
          <div className="w-full border border-border/60 rounded-xl bg-card overflow-hidden shadow-xs">
            <Table className="text-right w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3.5 px-4 font-bold text-foreground">المتجر</TableHead>
                  <TableHead className="py-3.5 px-4 font-bold text-foreground">المنصة</TableHead>
                  <TableHead className="py-3.5 px-4 font-bold text-foreground">تاريخ الربط</TableHead>
                  <TableHead className="py-3.5 px-4 font-bold text-foreground text-left">التحكم</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id} className="hover:bg-muted/30">
                    <TableCell className="py-4 px-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg border border-border bg-background flex items-center justify-center shrink-0">
                          <Store className="size-4.5 text-muted-foreground" />
                        </div>
                        <div className="font-semibold text-foreground text-sm">{store.platformStoreId}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 align-middle">
                      {store.platform === "salla" ? (
                        <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/10">
                          سلة
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-purple-500/5 text-purple-600 border-purple-500/10">
                          زد
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-4 align-middle text-xs text-muted-foreground">
                      {new Date(store.createdAt).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell className="py-4 px-4 align-middle text-left">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => disconnectStore(store.id)}
                          className="rounded-lg h-8 px-2.5 cursor-pointer text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive transition-colors border-0"
                          title="قطع الارتباط"
                        >
                          <Link2Off className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          /* كرت حالة عدم وجود متاجر مرتبطة (Empty State UI) */
          <div className="text-center py-16 flex flex-col items-center justify-center gap-5 border border-dashed border-border/80 rounded-xl bg-card w-full">
            <Store className="size-10 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">لم يتم ربط أي متجر</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                قم بربط متجرك على سلة أو زد لمزامنة المنتجات والطلبات وتفعيل ميزات الذكاء الاصطناعي.
              </p>
            </div>
            <Button asChild size="sm" className="rounded-lg h-9 px-4 cursor-pointer border-0">
              <Link to="/connect">ربط متجرك الأول</Link>
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}
