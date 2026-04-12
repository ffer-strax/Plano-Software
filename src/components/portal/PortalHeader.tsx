export function PortalHeader({ projectName }: { projectName: string }) {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="mx-auto max-w-5xl px-6 h-20 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Proyecto</span>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{projectName}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black text-slate-900 italic tracking-tighter">PLANO</span>
        </div>
      </div>
    </header>
  );
}
