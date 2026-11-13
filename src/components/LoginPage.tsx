import React, { useState } from 'react';
import { UserCircle, Lock, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, KeyRound, Building2, Sparkles, Database, Users, Eye, EyeOff, Check, X } from 'lucide-react';
import { loginWithCedula, AuthenticatedUser, setUserCustomPassword, saveSession, validateCustomPassword } from '../services/authService';

interface LoginPageProps {
  onLoginSuccess: (user: AuthenticatedUser) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estados para modal obligatorio de cambio de contraseña en primer ingreso
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<AuthenticatedUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Validación de reglas en vivo
  const hasMinLength = newPassword.length >= 6;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[#$%&!¡?*@+=~^]/.test(newPassword);
  const hasNoSpaces = newPassword.length > 0 && !/\s/.test(newPassword);
  const hasNoPunctuation = newPassword.length > 0 && !/[.,:;\-_()[\]{}'"/\\]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isPasswordValid =
    hasMinLength &&
    hasUppercase &&
    hasNumber &&
    hasSpecialChar &&
    hasNoSpaces &&
    hasNoPunctuation &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await loginWithCedula(cedula, password);
      if (res.success && res.user) {
        if (res.user.mustChangePassword) {
          // Primer ingreso: Abrir modal obligatorio de cambio de contraseña
          setPendingUser(res.user);
          setShowPasswordChangeModal(true);
        } else {
          setSuccessMsg(res.message);
          setTimeout(() => {
            onLoginSuccess(res.user!);
          }, 600);
        }
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servicio de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!pendingUser) return;

    if (!isPasswordValid) {
      setModalError('Por favor verifique que la nueva contraseña cumpla con todos los requisitos.');
      return;
    }

    setSavingPassword(true);
    try {
      const saveRes = setUserCustomPassword(pendingUser.username, newPassword);
      if (saveRes.success) {
        setModalSuccess('¡Contraseña personalizada registrada exitosamente! Redirigiendo...');
        pendingUser.mustChangePassword = false;
        saveSession(pendingUser);

        setTimeout(() => {
          setShowPasswordChangeModal(false);
          onLoginSuccess(pendingUser);
        }, 800);
      } else {
        setModalError(saveRes.message);
      }
    } catch (err: any) {
      setModalError(err.message || 'Error al guardar la nueva contraseña');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col justify-between font-sans selection:bg-[#F1B400] selection:text-black">
      {/* Top Banner */}
      <header className="w-full bg-black/80 backdrop-blur-md border-b-2 border-[#F1B400] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-sm sm:text-base font-black tracking-wider uppercase text-white font-mono">
            Plataforma Oficial de Evaluaciones
          </h1>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-lg bg-zinc-900/90 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Card Top Gold Bar */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-6 sm:p-8 text-center border-b border-zinc-800 relative">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#F1B400] text-black font-black flex items-center justify-center text-2xl shadow-lg shadow-[#F1B400]/20 mb-3.5">
              <KeyRound size={32} />
            </div>
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white font-mono">
              Gestión del Desempeño
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Plataforma Oficial de Evaluaciones.
            </p>
            <div className="inline-block mt-3 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[10.5px] font-mono font-bold text-[#F1B400] uppercase tracking-wide">
              Autenticación Requerida
            </div>
          </div>

          {/* Form Area */}
          <div className="p-6 sm:p-8 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <UserCircle size={15} className="text-[#F1B400]" />
                  Usuario (Número de Identificación / Cédula):
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej: 12345678"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded-xl font-mono text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#F1B400] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Lock size={15} className="text-[#F1B400]" />
                  Contraseña:
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded-xl font-mono text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#F1B400] transition-all"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2.5 animate-in fade-in duration-200">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !cedula.trim() || !password.trim()}
                className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black font-mono uppercase tracking-wider bg-[#F1B400] hover:bg-[#d99c00] active:scale-[0.99] text-black shadow-lg shadow-[#F1B400]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Verificando Colaborador...' : 'Ingresar al Sistema'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Modal Obligatorio de Cambio de Contraseña en Primer Ingreso */}
      {showPasswordChangeModal && pendingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border-2 border-[#F1B400] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-6 border-b border-zinc-800 text-center relative">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-[#F1B400] text-black font-black flex items-center justify-center shadow-lg shadow-[#F1B400]/20 mb-3">
                <KeyRound size={28} />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#F1B400] uppercase block">
                Primer Ingreso al Sistema • Seguridad Institucional
              </span>
              <h3 className="text-lg font-black uppercase text-white font-mono mt-1">
                Cambio Obligatorio de Contraseña
              </h3>
              <p className="text-xs text-zinc-300 mt-1 max-w-md mx-auto">
                Bienvenido(a), <strong className="text-white">{pendingUser.fullName}</strong> ({pendingUser.position}).
                Por seguridad institucional, debe definir una <strong>contraseña personalizada y única</strong> para sus próximos inicios de sesión.
              </p>
            </div>

            {/* Contenido del Formulario */}
            <form onSubmit={handleSaveNewPassword} className="p-6 space-y-4">
              {/* Información del usuario */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Usuario Asignado (Cédula):</span>
                <span className="font-bold text-[#F1B400]">{pendingUser.username}</span>
              </div>

              {/* Campo: Nueva Contraseña */}
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Nueva Contraseña Personalizada:</span>
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    {showNewPass ? 'Ocultar' : 'Ver'}
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="Escriba su nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded-xl font-mono text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#F1B400] transition-all"
                  />
                </div>
              </div>

              {/* Campo: Confirmar Contraseña */}
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Confirmar Nueva Contraseña:</span>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    {showConfirmPass ? 'Ocultar' : 'Ver'}
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    placeholder="Repita la nueva contraseña exactamente igual"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded-xl font-mono text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#F1B400] transition-all"
                  />
                </div>
              </div>

              {/* Checklist en Vivo de Requisitos Normativos */}
              <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-2">
                <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-zinc-400 block border-b border-zinc-800/80 pb-1">
                  Requisitos Obligatorios de la Nueva Contraseña:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  {/* Regla 1: Mínimo 6 caracteres */}
                  <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {hasMinLength ? <Check size={14} className="text-emerald-400 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-zinc-600 shrink-0" />}
                    <span>Mínimo 6 caracteres</span>
                  </div>

                  {/* Regla 2: 1 Letra Mayúscula */}
                  <div className={`flex items-center gap-2 ${hasUppercase ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {hasUppercase ? <Check size={14} className="text-emerald-400 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-zinc-600 shrink-0" />}
                    <span>Al menos 1 MAYÚSCULA (A-Z)</span>
                  </div>

                  {/* Regla 3: 1 Número */}
                  <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {hasNumber ? <Check size={14} className="text-emerald-400 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-zinc-600 shrink-0" />}
                    <span>Al menos 1 número (0-9)</span>
                  </div>

                  {/* Regla 4: Carácter especial permitido */}
                  <div className={`flex items-center gap-2 ${hasSpecialChar ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {hasSpecialChar ? <Check size={14} className="text-emerald-400 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-zinc-600 shrink-0" />}
                    <span>1 especial (ej: #, $, %, &, !, ¡, ?)</span>
                  </div>

                  {/* Regla 5: Sin espacios en blanco */}
                  <div className={`flex items-center gap-2 ${hasNoSpaces ? 'text-emerald-400' : newPassword.length > 0 && !hasNoSpaces ? 'text-red-400' : 'text-zinc-500'}`}>
                    {hasNoSpaces ? <Check size={14} className="text-emerald-400 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-zinc-600 shrink-0" />}
                    <span>Sin espacios en blanco</span>
                  </div>

                  {/* Regla 6: Sin signos de puntuación */}
                  <div className={`flex items-center gap-2 ${hasNoPunctuation ? 'text-emerald-400' : newPassword.length > 0 && !hasNoPunctuation ? 'text-red-400' : 'text-zinc-500'}`}>
                    {hasNoPunctuation ? <Check size={14} className="text-emerald-400 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-zinc-600 shrink-0" />}
                    <span>Sin signos de puntuación (. , : ;)</span>
                  </div>
                </div>

                {/* Regla 7: Coincidencia */}
                <div className={`flex items-center gap-2 pt-1 border-t border-zinc-800/80 text-[11px] font-mono ${passwordsMatch ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {passwordsMatch ? <Check size={14} className="text-emerald-400 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-zinc-600 shrink-0" />}
                  <span>Las contraseñas coinciden exactamente</span>
                </div>
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {modalSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{modalSuccess}</span>
                </div>
              )}

              {/* Botón de Confirmación */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isPasswordValid || savingPassword}
                  className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black font-mono uppercase tracking-wider bg-[#F1B400] hover:bg-[#d99c00] active:scale-[0.99] text-black shadow-lg shadow-[#F1B400]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShieldCheck size={18} />
                  <span>{savingPassword ? 'Guardando Contraseña...' : 'Guardar Nueva Contraseña y Continuar'}</span>
                </button>
              </div>

              <p className="text-[10px] text-zinc-500 text-center font-mono leading-relaxed pt-1">
                A partir de su próximo inicio de sesión, su usuario será su cédula y su clave será esta nueva contraseña personalizada.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-black/60 border-t border-zinc-800/80 py-4 px-4 text-center text-xs text-zinc-500 font-mono">
        <p>
          Plataforma Oficial de Evaluaciones
        </p>
        <p className="text-[10px] text-zinc-600 mt-0.5">
          Caracas, Venezuela
        </p>
      </footer>
    </div>
  );
}
