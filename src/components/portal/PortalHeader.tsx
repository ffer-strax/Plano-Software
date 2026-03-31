export function PortalHeader({ projectName, architectName }: { projectName: string, architectName: string }) {
  return (
    <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
      <div className="mx-auto max-w-5xl px-4 h-20 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PROYECTO</span>
          <h1 className="text-xl font-bold text-slate-900 line-clamp-1">{projectName}</h1>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Arquitecto</span>
            <span className="text-xs font-semibold text-slate-700">{architectName}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
            {architectName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
