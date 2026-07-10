import { lazy, Suspense } from "react"
import { createBrowserRouter, RouterProvider, useRouteError } from "react-router-dom"
import { PageLoader } from "@/components/PageLoader"
import { ProtectedRoute } from "@/components/ProtectedRoute"

const WelcomePage = lazy(() =>
  import("@/features/welcome").then((module) => ({ default: module.WelcomePage }))
)

const DashboardWelcomePage = lazy(() =>
  import("@/features/welcome/pages/DashboardWelcomePage").then((module) => ({ default: module.DashboardWelcomePage }))
)
const ProductsPage = lazy(() =>
  import("@/features/products").then((module) => ({ default: module.ProductsPage }))
)
const ProductDetailPage = lazy(() =>
  import("@/features/products").then((module) => ({ default: module.ProductDetailPage }))
)
const CategoriesPage = lazy(() =>
  import("@/features/categories/pages/CategoriesPage").then((module) => ({ default: module.CategoriesPage }))
)
const CategoryDetailPage = lazy(() =>
  import("@/features/categories/pages/CategoryDetailPage").then((module) => ({ default: module.CategoryDetailPage }))
)
const StoreSettingsPage = lazy(() =>
  import("@/features/settings").then((module) => ({ default: module.StoreSettingsPage }))
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
const OrdersPage = lazy(() =>
  import("@/features/orders").then((module) => ({ default: module.OrdersPage }))
)

function GlobalErrorBoundary() {
  const error = useRouteError() as any;
  const isChunkLoadError = error?.name === 'ChunkLoadError' || 
    (error?.message && error.message.includes("Failed to fetch dynamically imported module"));

  if (isChunkLoadError) {
    window.location.reload();
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center" dir="rtl">
      <h1 className="text-2xl font-bold mb-4 text-destructive">عذراً، حدث خطأ غير متوقع!</h1>
      <p className="text-muted-foreground mb-6 text-sm">نعتذر، يبدو أن هناك مشكلة في تحميل هذه الصفحة.</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
      >
        إعادة تحميل الصفحة
      </button>
    </div>
  );
}

const router = createBrowserRouter([
  {
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        path: "/",
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
        children: [
          {
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardLayout />
              </Suspense>
            ),
            children: [
          {
            path: "/dashboard",
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardWelcomePage />
              </Suspense>
            ),
          },
          {
            path: "/dashboard/products",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProductsPage />
              </Suspense>
            ),
          },
          {
            path: "/dashboard/products/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProductDetailPage />
              </Suspense>
            ),
          },
          {
            path: "/dashboard/categories",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CategoriesPage />
              </Suspense>
            ),
          },
          {
            path: "/dashboard/categories/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CategoryDetailPage />
              </Suspense>
            ),
          },
          {
            path: "/dashboard/settings",
            element: (
              <Suspense fallback={<PageLoader />}>
                <StoreSettingsPage />
              </Suspense>
            ),
          },
          {
            path: "/dashboard/customers",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomersPage />
              </Suspense>
            ),
          },
          {
            path: "/dashboard/orders",
            element: (
              <Suspense fallback={<PageLoader />}>
                <OrdersPage />
              </Suspense>
            ),
          },
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
