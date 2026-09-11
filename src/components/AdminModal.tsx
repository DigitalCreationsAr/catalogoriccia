import { useState } from 'react';
import { Product, Category, AdminSettings } from '../types';
import { User } from 'firebase/auth';
import { googleSignIn, logout, isAuthorizedAdmin } from '../lib/firebase';
import { AdminPanel } from './AdminPanel';
import { ShieldCheck, Lock, AlertOctagon, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  token: string | null;
  products: Product[];
  categories: Category[];
  settings: AdminSettings;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateSettings: (settings: AdminSettings) => void;
  onAuthSuccess: (user: User, token: string) => void;
  onAuthLogout: () => void;
}

export function AdminModal({
  isOpen,
  onClose,
  currentUser,
  token,
  products,
  categories,
  settings,
  onUpdateProducts,
  onUpdateCategories,
  onUpdateSettings,
  onAuthSuccess,
  onAuthLogout,
}: AdminModalProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const authorized = currentUser
    ? isAuthorizedAdmin(currentUser.email, settings.authorizedEmails)
    : false;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        onAuthSuccess(result.user, result.accessToken);
      }
    } catch (err: any) {
      console.error('Sign in failure:', err);
      setAuthError(err.message || 'No se pudo completar el inicio de sesión con Google.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onAuthLogout();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-5xl bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#E8E1D7] overflow-hidden min-h-[550px] max-h-[92vh] flex flex-col"
        >
          {/* Close button for non-full panel or header */}
          {!currentUser || !authorized ? (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-[#8C948D] hover:text-[#1C3B2B] rounded-full hover:bg-white transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          ) : null}

          {/* Unauthenticated View: Google Sign In */}
          {!currentUser && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-lg mx-auto space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-[#EBF0EC] border border-[#2B523E]/20 text-[#1C3B2B] flex items-center justify-center shadow-xs">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8C948D]">
                  Acceso Restringido · Oriccia
                </span>
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#1C3B2B] font-romantic">
                  Área Administrativa
                </h2>
                <p className="text-xs sm:text-sm text-[#6B726C] leading-relaxed">
                  Para ingresar y gestionar el catálogo de productos, inventario y sincronización con Google Sheets, debes iniciar sesión con la cuenta de Google autorizada.
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 text-left w-full">
                  {authError}
                </div>
              )}

              {/* Official Google Sign-In button */}
              <div className="pt-2 w-full flex flex-col items-center gap-3">
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="flex items-center justify-center gap-3 px-6 py-3 w-full max-w-sm rounded-xl bg-white border border-[#D5CDC2] hover:border-[#1C3B2B] hover:shadow-md text-[#2C332D] text-xs font-semibold transition-all duration-200"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>{isSigningIn ? 'Conectando con Google...' : 'Continuar con Google'}</span>
                </button>

                <div className="flex items-center gap-1.5 text-[11px] text-[#8C948D]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1C3B2B]" />
                  <span>Protegido por Google Auth y Google Workspace</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#F5EFEB] rounded-xl border border-[#E8E1D7] text-left text-[11px] text-[#6B726C] w-full">
                <span className="font-semibold text-[#1C3B2B] block mb-0.5">Nota de Privacidad y Permisos:</span>
                Al iniciar sesión, se solicitarán permisos para vincular tu hoja de cálculo en Google Sheets y administrar los productos de Oriccia de forma segura.
              </div>
            </div>
          )}

          {/* Authenticated BUT Not Authorized */}
          {currentUser && !authorized && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
                <AlertOctagon className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[#1C3B2B] font-romantic">
                  Cuenta no autorizada
                </h3>
                <p className="text-xs text-[#6B726C] leading-relaxed">
                  Has iniciado sesión como <strong className="text-[#2C332D]">{currentUser.email}</strong>, pero esta cuenta no se encuentra en la lista de administradores autorizados de Oriccia.
                </p>
                <p className="text-[11px] text-[#8C948D] italic">
                  Cuenta principal autorizada: rara.digitalcreations@gmail.com
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-[#1C3B2B] text-[#FAF7F2] rounded-lg text-xs font-semibold hover:bg-[#152D1F] transition-colors"
                >
                  Cerrar Sesión / Cambiar Cuenta
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-[#E8E1D7] text-xs font-medium text-[#6B726C] rounded-lg hover:bg-white"
                >
                  Volver al Catálogo
                </button>
              </div>
            </div>
          )}

          {/* Authenticated AND Authorized -> Full Admin Panel */}
          {currentUser && authorized && (
            <AdminPanel
              user={currentUser}
              token={token}
              products={products}
              categories={categories}
              settings={settings}
              onUpdateProducts={onUpdateProducts}
              onUpdateCategories={onUpdateCategories}
              onUpdateSettings={onUpdateSettings}
              onLogout={handleLogout}
              onClose={onClose}
            />
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
