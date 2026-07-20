import { AppRoutes } from "@/routes/AppRoutes"
import { Toaster } from "sonner"

import { TooltipProvider } from "@/components/ui/tooltip"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Toaster position="top-center" richColors />
      <TooltipProvider>
        <AppRoutes />
      </TooltipProvider>
    </div>
  )
}

export default App
