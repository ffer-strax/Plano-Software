import { getPortalProject } from './actions';
import { PortalClientView } from '@/components/portal/PortalClientView';

export default async function PortalPage({ params }: { params: { token: string } }) {
  const project = await getPortalProject(params.token);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-2 italic tracking-tighter">PLANO</h1>
        <div className="bg-white border p-12 rounded-[2.5rem] shadow-xl max-w-md w-full">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Portal no encontrado</h2>
          <p className="text-slate-500 mb-8">El enlace ha expirado o es incorrecto.</p>
          <div className="h-2 w-12 bg-slate-100 mx-auto rounded-full"></div>
        </div>
      </div>
    );
  }

  return <PortalClientView project={project} />;
}
