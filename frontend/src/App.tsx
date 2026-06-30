import { AppRoutes } from "@/routes/AppRoutes"
import { Toaster } from "sonner"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Toaster position="top-center" richColors />
      <AppRoutes />
    </div>
  )
}

export default App
