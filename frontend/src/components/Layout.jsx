import React from 'react';

export function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <aside className="w-full md:w-64 bg-card border-b md:border-b-0 md:border-r border-border p-4">
        <div className="font-extrabold text-xl mb-6">DashAI</div>
        <nav className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">التنقل</div>
          {/* Menu links will go here */}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border flex items-center px-6 justify-between bg-card">
          <div className="text-sm">لوحة التحكم</div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
