import { lazy, Suspense } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { PageLoader } from "@/components/PageLoader"
import { ProtectedRoute } from "@/components/ProtectedRoute"

const WelcomePage = lazy(() =>
  import("@/features/welcome").then((module) => ({ default: module.WelcomePage }))
)
const ConnectPage = lazy(() =>
  import("@/features/integration/pages/ConnectPage").then((module) => ({ default: module.ConnectPage }))
)
const StoresPage = lazy(() =>
  import("@/features/linked-stores/pages/StoresPage").then((module) => ({ default: module.StoresPage }))
)
const DashboardWelcomePage = lazy(() =>
  import("@/features/welcome/pages/DashboardWelcomePage").then((module) => ({ default: module.DashboardWelcomePage }))
)
const DashboardLayout = lazy(() =>
  import("@/layouts/DashboardLayout").then((module) => ({ default: module.DashboardLayout }))
)
const LoginPage = lazy(() =>
  import("@/features/auth").then((module) => ({ default: module.LoginPage }))
)
const RegisterPage = lazy(() =>
  import("@/features/auth").then((module) => ({ default: module.RegisterPage }))
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
    path: "/register",
    element: (
      <Suspense fallback={<PageLoader />}>
        <RegisterPage />
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
            path: "/dashboard/stores",
            element: (
              <Suspense fallback={<PageLoader />}>
                <StoresPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "/connect",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ConnectPage />
          </Suspense>
        ),
      },
    ],
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
