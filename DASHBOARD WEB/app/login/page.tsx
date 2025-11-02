'use client';

import { useState } from 'react';
import { Cloud, Lock, Mail, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AlertBanner from '@/components/ui/AlertBanner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Permitir que email y password estén vacíos temporalmente.
    // Quitar validación para poder avanzar durante pruebas.
    setLoading(true);

    // Simular autenticación: mostrar loading, luego success y redirigir.
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      // Marcar sesión como autenticada en el almacenamiento local para que la Navbar la detecte
      try {
        localStorage.setItem('isAuthenticated', 'true');
      } catch (e) {
        // si localStorage no está disponible, ignorar
      }

      // Mostrar breve estado de éxito antes de redirigir
      setTimeout(() => {
        router.push('/app/suscripcion');
      }, 700);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-neutral-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <Cloud className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Iniciar Sesión
            </h1>
            <p className="text-neutral-600">
              Accede al sistema de gestión de alertas
            </p>
          </div>

          {error && (
            <div className="mb-6">
              <AlertBanner type="error" title="Error de autenticación">
                {error}
              </AlertBanner>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="usuario@ejemplo.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-neutral-700">
                  Recordarme
                </label>
              </div>

              <Link
                href="/recuperar-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className={`w-full inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                success
                  ? 'bg-green-600 text-white focus:ring-green-500 shadow-sm'
                  : loading
                  ? 'bg-blue-400 text-white cursor-wait opacity-95 focus:ring-blue-300'
                  : 'btn-primary'
              }`}
            >
              {success ? (
                <>
                  <Check className="h-5 w-5 text-white" />
                  <span className="ml-2">Accediendo...</span>
                </>
              ) : loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Iniciando sesión...</span>
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
            <p className="text-sm text-neutral-600">
              ¿No tienes acceso?{' '}
              <Link href="/contacto" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Solicitar acceso
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
