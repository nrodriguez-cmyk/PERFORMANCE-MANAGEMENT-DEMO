import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.removeItem('canguro_talent_state');
    } catch {
      // ignore
    }
    window.location.hash = '#/';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-5 border-t-4 border-[#F1B400]">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 text-[#F1B400] flex items-center justify-center mx-auto border border-[#F1B400]/20">
              <AlertTriangle size={28} />
            </div>

            <div>
              <h2 className="text-lg font-black uppercase tracking-wider text-white">
                Se ha producido un error de visualización
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                La plataforma detectó una inconsistencia en los datos temporales del navegador.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 text-left max-h-32 overflow-y-auto space-y-1">
                <div className="font-bold text-amber-400">{this.state.error.message || String(this.state.error)}</div>
                {this.state.error.stack && (
                  <pre className="text-[9px] text-zinc-500 whitespace-pre-wrap font-mono">
                    {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#F1B400] text-black font-black text-xs uppercase tracking-wider hover:bg-[#d49e00] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <RefreshCw size={14} />
                <span>Reintentar</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetCache}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 text-zinc-200 font-bold text-xs uppercase tracking-wider hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-zinc-700"
              >
                <Home size={14} />
                <span>Reiniciar Datos</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
