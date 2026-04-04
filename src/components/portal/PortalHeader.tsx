export function PortalHeader({ projectName, architectName }: { projectName: string, architectName: string }) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-5xl px-4 h-16 md:h-20 flex items-center justify-between">
        <div className="flex flex-col overflow-hidden">
          <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest overflow-hidden text-ellipsis whitespace-nowrap">PROYECTO</span>
          <h1 className="text-sm md:text-xl font-bold text-slate-900 line-clamp-1">{projectName}</h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 bg-slate-50 md:px-4 md:py-2 p-1.5 rounded-full border border-slate-100 shrink-0">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Arquitecto</span>
            <span className="text-xs font-semibold text-slate-700">{architectName}</span>
          </div>
          <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
            {architectName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
