// Routes config for the app
import { lazy, Suspense } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { PageLoader } from "@/components/PageLoader"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuthStore } from "@/features/auth/store/authStore"
import { useStoreProfileStore } from "@/features/store/store/storeProfileStore"
import { useMerchantProfileStore } from "@/features/dashboard/store/merchantProfileStore"
import { useDashboardStore } from "@/features/dashboard/store/dashboardStore"
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary"
import { DashboardRouteErrorBoundary } from "./components/DashboardRouteErrorBoundary"

const WelcomePage = lazy(() =>
  import("@/features/welcome").then((module) => ({ default: module.WelcomePage }))
)
const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage").then((module) => ({ default: module.DashboardPage }))
)
const ProductsPage = lazy(() =>
  import("@/features/products").then((module) => ({ default: module.ProductsPage }))
)
const ProductDetailPage = lazy(() =>
  import("@/features/products").then((module) => ({ default: module.ProductDetailPage }))
)
const ProductEditPage = lazy(() =>
  import("@/features/products/pages/ProductEditPage").then((module) => ({ default: module.default }))
)

const CategoriesPage = lazy(() =>
  import("@/features/categories/pages/CategoriesPage").then((module) => ({ default: module.CategoriesPage }))
)
const CategoryDetailPage = lazy(() =>
  import("@/features/categories/pages/CategoryDetailPage").then((module) => ({ default: module.CategoryDetailPage }))
)
const StoreInfoPage = lazy(() =>
  import("@/features/store/pages/StoreInfoPage").then((m) => ({ default: m.StoreInfoPage }))
)
const StoreBrandingPage = lazy(() =>
  import("@/features/store/pages/StoreBrandingPage").then((m) => ({ default: m.StoreBrandingPage }))
)
const StoreLocalizationPage = lazy(() =>
  import("@/features/store/pages/StoreLocalizationPage").then((m) => ({ default: m.StoreLocalizationPage }))
)
const StoreSocialPage = lazy(() =>
  import("@/features/store/pages/StoreSocialPage").then((m) => ({ default: m.StoreSocialPage }))
)
const StoreBusinessPage = lazy(() =>
  import("@/features/store/pages/StoreBusinessPage").then((m) => ({ default: m.StoreBusinessPage }))
)
const UserProfilePage = lazy(() =>
  import("@/features/profile/pages/UserProfilePage").then((module) => ({ default: module.UserProfilePage }))
)
const DashboardLayout = lazy(() =>
  import("@/layouts/DashboardLayout").then((module) => ({ default: module.DashboardLayout }))
)
const LoginPage = lazy(() =>
  import("@/features/auth").then((module) => ({ default: module.LoginPage }))
)
const CustomersPage = lazy(() =>
  import("@/features/customers").then((module) => ({ default: module.CustomersPage }))
)
const CustomerDetailPage = lazy(() =>
  import("@/features/customers").then((module) => ({ default: module.CustomerDetailPage }))
)
const OrdersPage = lazy(() =>
  import("@/features/orders").then((module) => ({ default: module.OrdersPage }))
)
const OrderDetailPage = lazy(() =>
  import("@/features/orders").then((module) => ({ default: module.OrderDetailPage }))
)



const router = createBrowserRouter([
  {
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        path: "/",
        loader: async () => {
          try {
            await useAuthStore.getState().fetchUser();
          } catch (e) {
            // تجاهل الأخطاء لصفحة الهبوط لعدم منع تحميلها
          }
          return null;
        },
        element: (
          <Suspense fallback={<PageLoader />}>
            <WelcomePage />
          </Suspense>
        ),
      },
      {
        path: "/login",
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        element: <ProtectedRoute />,
        loader: () => {
          useAuthStore.getState().fetchUser();
          return null;
        },
        children: [
          {
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardLayout />
              </Suspense>
            ),
            loader: () => {
              useMerchantProfileStore.getState().fetchProfile();
              useStoreProfileStore.getState().fetchProfile();
              return null;
            },
            children: [
              {
                errorElement: <DashboardRouteErrorBoundary />,
                children: [
                  {
                    path: "/dashboard",
                    loader: () => {
                      useDashboardStore.getState().fetchStats();
                      return null;
                    },
                    element: (
                      <Suspense fallback={<PageLoader fullScreen={false} />}>
                        <DashboardPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "/products",
                    element: (
                      <Suspense fallback={<PageLoader fullScreen={false} />}>
                        <ProductsPage />
                      </Suspense>
                    ),
                  },
                  {
                    // تعديل المنتج يجب أن يكون قبل /products/:id لمنع تفسير 'edit' كـ ID
                    path: "/products/edit/:id",
                    element: (
                      <Suspense fallback={<PageLoader fullScreen={false} />}>
                        <ProductEditPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "/products/:id",
                    element: (
                      <Suspense fallback={<PageLoader fullScreen={false} />}>
                        <ProductDetailPage />
                      </Suspense>
                    ),
                  },

                  {
                    path: "/categories",
                    element: (
                      <Suspense fallback={<PageLoader fullScreen={false} />}>
                        <CategoriesPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "/categories/:id",
                    element: (
                      <Suspense fallback={<PageLoader fullScreen={false} />}>
                        <CategoryDetailPage />
                      </Suspense>
                    ),
                  },
                  {
                    // المسار الأب /store — يجلب البيانات مرة واحدة لكل الصفحات الفرعية
                    path: "/store",
                    loader: () => {
                      useStoreProfileStore.getState().fetchProfile();
                      return null;
                    },
                    children: [
                      {
                        index: true,
                        // redirect تلقائي لـ /store/info
                        loader: () => { return Response.redirect('/store/info'); },
                        element: null,
                      },
                      {
                        path: "info",
                        element: (
                          <Suspense fallback={<PageLoader fullScreen={false} />}>
                            <StoreInfoPage />
                          </Suspense>
                        ),
                      },
                      {
                        path: "branding",
                        element: (
                          <Suspense fallback={<PageLoader fullScreen={false} />}>
                            <StoreBrandingPage />
                          </Suspense>
                        ),
                      },
                      {
                        path: "localization",
                        element: (
                          <Suspense fallback={<PageLoader fullScreen={false} />}>
                            <StoreLocalizationPage />
                          </Suspense>
                        ),
                      },
                      {
                        path: "social",
                        element: (
                          <Suspense fallback={<PageLoader fullScreen={false} />}>
                            <StoreSocialPage />
                          </Suspense>
                        ),
                      },
                      {
                        path: "business",
                        element: (
                          <Suspense fallback={<PageLoader fullScreen={false} />}>
                            <StoreBusinessPage />
                          </Suspense>
                        ),
                      },
                    ],
                  },
                  {
                    path: "/profile",
                    element: (
                      <Suspense fallback={<PageLoader fullScreen={false} />}>
                        <UserProfilePage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "/customers",
                    element: (
                      <Suspense fallback={<PageLoader fullScreen={false} />}>
                        <CustomersPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "/customers/:id",
                    element: (
                      <Suspense fallback={<PageLoader fullScreen={false} />}>
                        <CustomerDetailPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "/orders",
                    element: (
                      <Suspense fallback={<PageLoader fullScreen={false} />}>
                        <OrdersPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "/orders/:id",
                    element: (
                      <Suspense fallback={<PageLoader fullScreen={false} />}>
                        <OrderDetailPage />
                      </Suspense>
                    ),
                  },
                ]
              }
            ],
          },
        ],
      },
    ],
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
