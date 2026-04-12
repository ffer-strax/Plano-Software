export function PortalHeader({ projectName }: { projectName: string, architectName?: string }) {
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">{projectName}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-slate-900 italic tracking-tighter">PLANO</span>
          <div className="h-1 w-6 bg-slate-900 rounded-full hidden md:block" />
        </div>
      </div>
    </header>
  );
}
