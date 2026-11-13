import React, { useState } from 'react';
import { EmployeeInfo } from '../types';
import { Link, Copy, Mail, Send, CheckCircle, AlertTriangle } from 'lucide-react';

interface ProfileFormProps {
  info: EmployeeInfo;
  onChange: (info: EmployeeInfo) => void;
}

const EmailSender = ({ label, url, info }: { label: string, url: string, info: EmployeeInfo }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSend = async () => {
    if (!email) return;
    setStatus('sending');
    try {
      const resp = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: email,
          subject: 'Invitación a Evaluación de Desempeño - Canguro Venezuela',
          body: `Hola,\n\nSe requiere tu participación en el proceso de evaluación de desempeño de ${info.firstName} ${info.lastName}.\n\nRol de evaluación: ${label}\n\nPor favor, ingresa al siguiente enlace para completar la evaluación:\n${url}\n\nGracias por tu colaboración.\nEquipo de Talento Humano.`
        })
      });
      if (resp.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-3 w-full max-w-sm">
      <input 
        type="email" 
        placeholder="Correo electrónico del evaluador..." 
        value={email}
        onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
        className="flex-1 bg-black border border-[#F1B400]/50 text-white px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
      />
      <button
        onClick={handleSend}
        disabled={status === 'sending' || !email}
        className="flex items-center justify-center gap-1 px-3 py-1 bg-[#F1B400] text-black font-bold uppercase tracking-wider text-[9px] hover:bg-yellow-500 transition-colors disabled:opacity-50 min-w-[80px]"
      >
        {status === 'sending' && 'Enviando...'}
        {status === 'success' && <><CheckCircle size={10} /> Enviado</>}
        {status === 'error' && <><AlertTriangle size={10} /> Error</>}
        {status === 'idle' && <><Send size={10} /> Enviar</>}
      </button>
    </div>
  );
};

export function ProfileForm({ info, onChange }: ProfileFormProps) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleChange = (field: keyof EmployeeInfo, value: string) => {
    onChange({ ...info, [field]: value });
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const POSITIONS = [
    'Analista',
    'Especialista',
    'Coordinador',
    'Supervisor',
    'Gerente',
    'Director'
  ];

  const DIRECTORATES = [
    'Dirección de Operaciones',
    'Dirección de Transporte y Logística',
    'Dirección de Compras',
    'Dirección Comercial',
    'Dirección de Control Interno',
    'Dirección de Recursos Humanos',
    'Dirección de Tecnología',
    'Dirección de Administración y Finanzas'
  ];

  const positionsWithSubordinates = ['Coordinador', 'Supervisor', 'Gerente', 'Director'];
  const hasSubordinates = positionsWithSubordinates.includes(info.position);

  const employeeNameQuery = encodeURIComponent(`${info.firstName} ${info.lastName}`.trim());
  const baseUrl = `${window.location.origin}${window.location.pathname}#/evaluate`;

  const cleanId = (info.idNumber || '').replace(/[\.\s-]/g, '').toLowerCase() || 'collab';
  const idQuery = encodeURIComponent(info.idNumber || '');
  const deptQuery = encodeURIComponent(info.department || '');
  const dirQuery = encodeURIComponent(info.directorate || '');

  const links = [
    { id: 'self', label: 'Autoevaluación', url: `${baseUrl}/self?employee=${employeeNameQuery}&position=${encodeURIComponent(info.position)}&idNumber=${idQuery}&dept=${deptQuery}&dir=${dirQuery}&token=${encodeURIComponent(`canguro_${cleanId}_self`)}` },
    { id: 'supervisor', label: 'Supervisor Inmediato', url: `${baseUrl}/supervisor?employee=${employeeNameQuery}&position=${encodeURIComponent(info.position)}&idNumber=${idQuery}&dept=${deptQuery}&dir=${dirQuery}&token=${encodeURIComponent(`canguro_${cleanId}_supervisor`)}` },
  ];

  if (hasSubordinates) {
    links.push({ id: 'subordinate', label: 'Subordinado', url: `${baseUrl}/subordinate?employee=${employeeNameQuery}&position=${encodeURIComponent(info.position)}&idNumber=${idQuery}&dept=${deptQuery}&dir=${dirQuery}&token=${encodeURIComponent(`canguro_${cleanId}_subordinate`)}` });
  }
  
  const isFormComplete = info.firstName && info.position && info.department && info.directorate;

  return (
    <div className="bg-[#111] border border-[#F1B400] p-6 text-xs font-sans">
      <div className="mb-6 border-b border-[#F1B400]/30 pb-4">
        <h2 className="text-xl font-bold text-[#F1B400] tracking-tight uppercase">Datos del Colaborador</h2>
        <p className="text-sm text-gray-400 mt-2 italic">Defina la información básica del colaborador para iniciar su proceso de evaluación.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[#F1B400] font-mono tracking-widest uppercase mb-1">Nombre</label>
            <input
              type="text"
              value={info.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="w-full bg-black border border-[#F1B400]/50 text-white p-2 focus:ring-1 focus:ring-[#F1B400] focus:outline-none"
              placeholder="Ej: Juan"
            />
          </div>

          <div>
            <label className="block text-[#F1B400] font-mono tracking-widest uppercase mb-1">Apellido</label>
            <input
              type="text"
              value={info.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="w-full bg-black border border-[#F1B400]/50 text-white p-2 focus:ring-1 focus:ring-[#F1B400] focus:outline-none"
              placeholder="Ej: Pérez"
            />
          </div>

          <div>
            <label className="block text-[#F1B400] font-mono tracking-widest uppercase mb-1">Cédula de Identidad</label>
            <input
              type="text"
              value={info.idNumber}
              onChange={(e) => handleChange('idNumber', e.target.value)}
              className="w-full bg-black border border-[#F1B400]/50 text-white p-2 focus:ring-1 focus:ring-[#F1B400] focus:outline-none"
              placeholder="Ej: V-12345678"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[#F1B400] font-mono tracking-widest uppercase mb-1">Cargo actual</label>
            <select
              value={info.position}
              onChange={(e) => handleChange('position', e.target.value)}
              className="w-full bg-black border border-[#F1B400]/50 text-white p-2 focus:ring-1 focus:ring-[#F1B400] focus:outline-none appearance-none"
            >
              <option value="" disabled>Seleccione un cargo</option>
              {POSITIONS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#F1B400] font-mono tracking-widest uppercase mb-1">Área/Gerencia a la que pertenece (si aplica)</label>
            <input
              type="text"
              value={info.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full bg-black border border-[#F1B400]/50 text-white p-2 focus:ring-1 focus:ring-[#F1B400] focus:outline-none"
              placeholder="Ej: Gerencia de Ventas, IT..."
            />
          </div>

          <div>
            <label className="block text-[#F1B400] font-mono tracking-widest uppercase mb-1">Dirección a la que está adscrita</label>
            <select
              value={info.directorate}
              onChange={(e) => handleChange('directorate', e.target.value)}
              className="w-full bg-black border border-[#F1B400]/50 text-white p-2 focus:ring-1 focus:ring-[#F1B400] focus:outline-none appearance-none"
            >
              <option value="" disabled>Seleccione una dirección</option>
              {DIRECTORATES.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {isFormComplete && (
        <div className="mt-8 pt-6 border-t border-[#F1B400]/30 animate-in fade-in duration-500">
          <h3 className="text-sm font-bold text-[#F1B400] mb-4 uppercase tracking-wider">Enlaces de Evaluación</h3>
          <p className="text-[11px] text-gray-400 mb-4">
            A continuación, comparta los enlaces correspondientes con cada evaluador. Puede enviarles el enlace directamente o enviarles una invitación por correo.
          </p>
          
          <div className="space-y-4">
             {links.map((link) => (
              <div key={link.id} className="bg-black border border-gray-800 p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                 <div className="flex-1">
                    <span className="text-[#F1B400] font-bold block mb-1 uppercase tracking-wider text-[11px]">{link.label}</span>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-[10px] break-all truncate max-w-sm block">
                      {link.url}
                    </a>
                    
                    {/* Componente para envío por email directamente */}
                    <EmailSender label={link.label} url={link.url} info={info} />
                 </div>
                 <div className="flex items-start gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => copyToClipboard(link.url, link.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-[#111] border border-[#F1B400]/50 text-[#F1B400] hover:bg-[#F1B400] hover:text-black transition-colors min-w-[120px]"
                    >
                      <Copy size={12} />
                      {copiedLink === link.id ? 'Copiado!' : 'Copiar'}
                    </button>
                 </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-[#1a1a1a] p-4 text-center border-l-2 border-[#F1B400]">
            <p className="text-[11px] text-gray-300 italic">
              "Al finalizar el proceso de evaluaciones, el colaborador recibirá los resultados consolidados correspondientes a su perfil y evaluación de desempeño."
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-[#F1B400]/30 hidden md:block text-[10px] text-gray-500 italic">
        Nota: El proceso de evaluación y el tipo de formularios requeridos se ajustarán automáticamente basados en el "Cargo actual" seleccionado.
      </div>
    </div>
  );
}
