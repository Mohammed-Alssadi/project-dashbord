import { lazy, Suspense } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
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
const CategoriesPage = lazy(() =>
  import("@/features/categories/pages/CategoriesPage").then((module) => ({ default: module.CategoriesPage }))
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

const router = createBrowserRouter([
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
            path: "/dashboard/categories",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CategoriesPage />
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
        ],
      },
    ],
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
