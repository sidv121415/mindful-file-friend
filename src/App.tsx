
import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { FileExplorer } from './components/FileExplorer';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Intelligent File Manager</h1>
        <FileExplorer />
      </main>
      <Toaster />
    </div>
  );
}

export default App;
