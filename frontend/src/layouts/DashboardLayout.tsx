import { Link, Outlet, useNavigate, useOutletContext } from "react-router-dom"
import { toast } from "sonner"
import { authService, type AuthUser } from "@/features/auth/services/authService"
import { useStoreProfile } from "@/features/settings/hooks/useStoreProfile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import {
  LogOut,
  Home,
  MoreVertical,
  CircleUser,
  CreditCard,
  Bell,
  Package,
  Folder,
  Settings
} from "lucide-react"

export function DashboardLayout() {
  const navigate = useNavigate()
  // الحصول على بيانات المستخدم المعرفة مسبقاً في ProtectedRoute بدون جلب إضافي
  const { user } = useOutletContext<{ user: AuthUser }>()
  
  // جلب بيانات المتجر الحية (كاش لمدة 5 دقائق في الباك اند) لعرض اللوجو والاسم المحدث
  const { profile: storeProfile, loading: loadingStore, refetch: refetchStore } = useStoreProfile()

  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate("/login")
    } catch (err) {
      console.error(err)
    }
  }

  // استخدام بيانات المتجر الحية للرأس (Header)
  const storeAvatar = storeProfile?.avatar || user?.avatarUrl
  const storeName = storeProfile?.name || user?.storeName || 'DashAI'

  // استخدام بيانات المستخدم للتذييل (Footer)
  const userAvatar = user?.avatarUrl || ''
  const userName = user?.name || user?.email?.split("@")[0] || ''

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-sans" dir="rtl">
        
        {/* 1. القائمة الجانبية Collapsible (RTL Desktop Sidebar) */}
        <Sidebar side="right" variant="sidebar" collapsible="icon">
          
          {/* رأس القائمة الجانبية */}
          <SidebarHeader className="border-b-0 pb-1">
            <div className="flex items-center gap-3 px-1 py-2 group-data-[collapsible=icon]:justify-center">
              
              {/* أيقونة اللوجو الرسمية */}
              <div className="relative flex items-center justify-center size-11 group-data-[collapsible=icon]:size-8 rounded-xl bg-background border border-border/80 shadow-sm shrink-0 transition-all duration-300 hover:scale-105 group-data-[collapsible=icon]:mx-auto overflow-hidden">
                {storeAvatar ? (
                  <img src={storeAvatar} alt={storeName} className="size-full object-cover" />
                ) : (
                  <img src="/logo.png" alt="DashAI" className="size-full object-cover" />
                )}
                <span className="absolute top-0.5 left-0.5 size-1.5 bg-emerald-500 rounded-full border border-card animate-ping" />
                <span className="absolute top-0.5 left-0.5 size-1.5 bg-emerald-500 rounded-full border border-card" />
              </div>
              
              {/* اسم المنصة (يختفي عند طي القائمة) */}
              <div className="flex flex-col overflow-hidden text-right group-data-[collapsible=icon]:hidden">
                <span className="font-extrabold text-[15px] tracking-tight text-foreground truncate max-w-[140px]" title={storeName}>
                  {storeName}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider -mt-0.5">
                  {storeProfile ? 'متجر متصل' : 'لوحة التحكم'}
                </span>
              </div>
            </div>
          </SidebarHeader>

          {/* محتوى القائمة (الروابط) */}
          <SidebarContent className="px-2 pt-2 gap-4">
            
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-1 tracking-wider px-2 group-data-[collapsible=icon]:hidden">
                الرئيسية
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="نظرة عامة">
                      <Link to="/dashboard">
                        <Home className="h-4 w-4" />
                        <span>نظرة عامة</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-1 tracking-wider px-2 group-data-[collapsible=icon]:hidden">
                إدارة المتجر
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="المنتجات">
                      <Link to="/dashboard/products">
                        <Package className="h-4 w-4" />
                        <span>المنتجات</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="الأقسام">
                      <Link to="/dashboard/categories">
                        <Folder className="h-4 w-4" />
                        <span>الأقسام</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-1 tracking-wider px-2 group-data-[collapsible=icon]:hidden">
                الإعدادات
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="معلومات المتجر">
                      <Link to="/dashboard/settings">
                        <Settings className="h-4 w-4" />
                        <span>إعدادات المتجر</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

          </SidebarContent>

          {/* تذييل القائمة (حساب المستخدم المدمج والمحسن) */}
          <SidebarFooter className="p-2 pb-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full hover:bg-muted/60 transition-colors rounded-lg px-2"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden w-full justify-between">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <Avatar className="size-8 rounded-lg border border-border">
                            <AvatarImage src={userAvatar} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs rounded-lg uppercase">
                              {userName.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col items-start leading-none overflow-hidden text-right group-data-[collapsible=icon]:hidden">
                            <span className="text-xs font-bold text-foreground  max-w-[110px] truncate">
                              {userName}
                            </span>
                            <span className="text-[12px] text-muted-foreground  max-w-[110px] mt-1 truncate">
                              {user.email || user.platformStoreId}
                            </span>
                          </div>
                        </div>
                        <MoreVertical className="h-4 w-4 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
                      </div>
                    </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent 
                      align="end" 
                      side="top" 
                      className="w-56 font-sans p-1.5 border border-border/60 shadow-md rounded-xl bg-popover"
                    >
                      <div className="flex items-center gap-2.5 p-2 pb-2.5 border-b border-border/40 mb-1">
                        <Avatar className="size-8 rounded-lg border border-border shrink-0">
                          <AvatarImage src={userAvatar} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs rounded-lg uppercase">
                            {userName.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start leading-tight text-right overflow-hidden">
                          <span className="text-xs font-bold text-foreground truncate max-w-[140px]">
                            {userName}
                          </span>
                          <span className="text-[12px] text-muted-foreground  max-w-[140px] mt-0.5">
                            {user.email || user.platformStoreId}
                          </span>
                        </div>
                      </div>
                      
                      <DropdownMenuItem className="flex items-center justify-start gap-2 cursor-pointer text-right py-2 px-2 text-xs font-medium rounded-md hover:bg-muted/50">
                        <CircleUser className="size-3.5 text-muted-foreground shrink-0" />
                        <span>حساب المتجر</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center justify-start gap-2 cursor-pointer text-right py-2 px-2 text-xs font-medium rounded-md hover:bg-muted/50">
                        <CreditCard className="size-3.5 text-muted-foreground shrink-0" />
                        <span>الاشتراكات والمدفوعات</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center justify-start gap-2 cursor-pointer text-right py-2 px-2 text-xs font-medium rounded-md hover:bg-muted/50">
                        <Bell className="size-3.5 text-muted-foreground shrink-0" />
                        <span>الإشعارات والتنبيهات</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="my-1 border-border/40" />
                      
                      <DropdownMenuItem 
                        onClick={async () => {
                          await handleLogout()
                          toast.success("تم تسجيل الخروج بنجاح")
                        }} 
                        className="flex items-center justify-start gap-2 cursor-pointer text-right py-2 px-2 text-xs font-semibold text-destructive hover:bg-destructive/5 hover:text-destructive rounded-md"
                      >
                        <LogOut className="size-3.5 shrink-0" />
                        <span>تسجيل الخروج</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
          </SidebarFooter>

        </Sidebar>

        {/* 2. منطقة المحتوى والترويسة */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          
          {/* الترويسة العلوية المثبتة */}
          <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 z-40">
            
            {/* زر فتح/إغلاق القائمة الجانبية */}
            <SidebarTrigger className="h-9 w-9 border border-border shrink-0" />

            <div className="flex w-full items-center gap-4 md:mr-auto md:gap-2 lg:gap-4">
              <div className="mr-auto flex-1 sm:flex-initial" />
            </div>
          </header>

          {/* محتوى الصفحة الفرعية القابل للتمرير */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#fafafa]">
            <Outlet context={{ user, storeProfile, loadingStore, refetchStore }} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
