'use client';

import { useState } from 'react';
import { FileUp, Mail, Phone, Plus, UserCheck } from 'lucide-react';
import TabNavigation from '@/components/ui/TabNavigation';
import AlertBanner from '@/components/ui/AlertBanner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

interface Subscriber {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  estado: 'activo' | 'pendiente';
  fechaRegistro: string;
}

export default function SuscripcionPage() {
  const [activeTab, setActiveTab] = useState('agregar');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    consentimiento: false,
  });

  // Se eliminaron las suscripciones pendientes — mantenemos solo suscriptores activos.

  const [activos, setActivos] = useState<Subscriber[]>([
    {
      id: '2',
      nombre: 'Carlos Rodríguez',
      correo: 'carlos.rodriguez@ejemplo.com',
      telefono: '3007654321',
      estado: 'activo',
      fechaRegistro: '2025-10-15',
    },
    {
      id: '3',
      nombre: 'Ana Martínez',
      correo: 'ana.martinez@ejemplo.com',
      telefono: '3009876543',
      estado: 'activo',
      fechaRegistro: '2025-10-20',
    },
  ]);

  const tabs = [
    { id: 'agregar', label: 'Añadir Persona', icon: <Plus className="h-4 w-4" /> },
    { id: 'activos', label: 'Activos', icon: <UserCheck className="h-4 w-4" /> },
    { id: 'csv', label: 'Cargar CSV', icon: <FileUp className="h-4 w-4" /> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.consentimiento) {
      setError('Debe aceptar el consentimiento para continuar');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({ nombre: '', correo: '', telefono: '', consentimiento: false });

      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  // Las funciones relacionadas con 'pendientes' fueron eliminadas porque ya no existe esa sección.

  const handleEliminarActivo = (id: string) => {
    if (confirm('¿Está seguro de dar de baja a este suscriptor?')) {
      setActivos(activos.filter(a => a.id !== id));
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Gestión de Suscripciones
          </h1>
          <p className="text-lg text-neutral-600">
            Administra los suscriptores del sistema de alertas
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-6">
          <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === 'agregar' && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                Añadir Nueva Persona
              </h2>

              {success && (
                <div className="mb-6">
                  <AlertBanner type="success" title="Suscriptor agregado">
                    Se ha enviado un correo de confirmación al suscriptor.
                  </AlertBanner>
                </div>
              )}

              {error && (
                <div className="mb-6">
                  <AlertBanner type="error" title="Error" onClose={() => setError('')}>
                    {error}
                  </AlertBanner>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-neutral-700 mb-2">
                    Nombre completo <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label htmlFor="correo" className="block text-sm font-medium text-neutral-700 mb-2">
                    Correo electrónico <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="email"
                      id="correo"
                      required
                      value={formData.correo}
                      onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="juan.perez@ejemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-neutral-700 mb-2">
                    Teléfono <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="tel"
                      id="telefono"
                      required
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="3001234567"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="consentimiento"
                      checked={formData.consentimiento}
                      onChange={(e) => setFormData({ ...formData, consentimiento: e.target.checked })}
                      className="mt-1 h-4 w-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="consentimiento" className="ml-3 text-sm text-neutral-700">
                      <span className="font-semibold">Consentimiento informado:</span> Confirmo que el suscriptor ha autorizado
                      el uso de sus datos personales para recibir alertas y notificaciones del sistema de alerta temprana,
                      de acuerdo con la Ley 1581 de 2012 sobre protección de datos personales.
                    </label>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Guardando...' : 'Agregar suscriptor'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ nombre: '', correo: '', telefono: '', consentimiento: false })}
                    className="btn-tertiary"
                  >
                    Limpiar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sección 'Pendientes' eliminada */}

          {activeTab === 'activos' && (
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                Suscriptores Activos
              </h2>

              {activos.length === 0 ? (
                <EmptyState
                  icon={<UserCheck className="h-8 w-8" />}
                  title="No hay suscriptores activos"
                  description="Comienza agregando nuevos suscriptores al sistema."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                          Contacto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                          Fecha de Registro
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {activos.map((persona) => (
                        <tr key={persona.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                            {persona.nombre}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600">
                            <div>{persona.correo}</div>
                            <div>{persona.telefono}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600">
                            {persona.fechaRegistro}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-700 mr-4">
                              Editar
                            </button>
                            <button
                              onClick={() => handleEliminarActivo(persona.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Dar de baja
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'csv' && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                Carga Masiva desde CSV
              </h2>

              <AlertBanner type="info" title="Formato del archivo">
                El archivo CSV debe contener las columnas: nombre, correo, telefono
              </AlertBanner>

              <div className="mt-6">
                <label className="block">
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <FileUp className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-sm font-medium text-neutral-900 mb-1">
                      Haz clic para seleccionar un archivo CSV
                    </p>
                    <p className="text-xs text-neutral-600">
                      o arrastra el archivo aquí
                    </p>
                  </div>
                  <input type="file" accept=".csv" className="hidden" />
                </label>

                <div className="mt-6">
                  <button className="btn-primary">
                    Procesar archivo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
