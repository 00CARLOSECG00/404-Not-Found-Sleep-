'use client';

import { useState, useEffect } from 'react';
import { FileUp, Mail, Phone, Plus, UserCheck } from 'lucide-react';
import TabNavigation from '@/components/ui/TabNavigation';
import AlertBanner from '@/components/ui/AlertBanner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { supabase, Comunidad } from '@/lib/supabase';

// Marcar como dinámico para evitar generación estática
export const dynamic = 'force-dynamic';

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
  const [loadingList, setLoadingList] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre_completo: '',
    correo: '',
    telefono: '',
    direccion: '',
    rol: 'Residente' as 'Residente' | 'Centinela' | 'Admin_JAC' | 'Admin_Cabildo',
    es_arrendatario: false,
    consentimiento: false,
  });

  const [activos, setActivos] = useState<Comunidad[]>([]);

  useEffect(() => {
    cargarComunidad();
  }, []);

  const tabs = [
    { id: 'agregar', label: 'Añadir Persona', icon: <Plus className="h-4 w-4" /> },
    { id: 'activos', label: 'Activos', icon: <UserCheck className="h-4 w-4" /> },
    { id: 'csv', label: 'Cargar CSV', icon: <FileUp className="h-4 w-4" /> },
  ];

  const cargarComunidad = async () => {
    try {
      setLoadingList(true);
      const { data, error: supabaseError } = await supabase
        .from('tbl_comunidad')
        .select('*')
        .eq('esta_activo', true)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        // Si es un error de configuración, mostrar mensaje específico
        if (supabaseError.code === 'CONFIG_ERROR' || supabaseError.message?.includes('credentials not configured')) {
          throw new Error('Credenciales de Supabase no configuradas. Por favor, configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local');
        }
        throw supabaseError;
      }

      if (data) {
        setActivos(data);
      }
    } catch (err) {
      console.error('Error cargando comunidad:', err);
      setError('Error al cargar los datos de la comunidad.');
    } finally {
      setLoadingList(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.consentimiento) {
      setError('Debe aceptar el consentimiento para continuar');
      return;
    }

    if (!formData.telefono || !formData.nombre_completo) {
      setError('Nombre completo y teléfono son obligatorios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: supabaseError } = await supabase
        .from('tbl_comunidad')
        .insert({
          nombre_completo: formData.nombre_completo,
          telefono: formData.telefono,
          rol: formData.rol,
          direccion_notas: formData.direccion || null,
          es_arrendatario: formData.es_arrendatario,
          esta_activo: true,
        })
        .select();

      if (supabaseError) {
        // Si es un error de configuración, mostrar mensaje específico
        if (supabaseError.code === 'CONFIG_ERROR' || supabaseError.message?.includes('credentials not configured')) {
          throw new Error('Credenciales de Supabase no configuradas. Por favor, configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local');
        }
        throw supabaseError;
      }

      setSuccess(true);
      setFormData({ 
        nombre_completo: '', 
        correo: '', 
        telefono: '', 
        direccion: '',
        rol: 'Residente',
        es_arrendatario: false,
        consentimiento: false 
      });
      
      await cargarComunidad();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error guardando:', err);
      setError(err.message || 'Error al guardar el suscriptor. El teléfono podría estar duplicado.');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarActivo = async (id: number) => {
    if (!confirm('¿Está seguro de dar de baja a este suscriptor?')) {
      return;
    }

    try {
      const { error: supabaseError } = await supabase
        .from('tbl_comunidad')
        .update({ esta_activo: false })
        .eq('comunidad_id', id);

      if (supabaseError) {
        // Si es un error de configuración, mostrar mensaje específico
        if (supabaseError.code === 'CONFIG_ERROR' || supabaseError.message?.includes('credentials not configured')) {
          throw new Error('Credenciales de Supabase no configuradas. Por favor, configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local');
        }
        throw supabaseError;
      }

      await cargarComunidad();
    } catch (err) {
      console.error('Error eliminando:', err);
      setError('Error al dar de baja al suscriptor.');
    }
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      setError('Por favor seleccione un archivo CSV válido');
    }
  };

  const parseCSV = (text: string): Array<Record<string, string>> => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('El CSV debe tener al menos una fila de encabezado y una fila de datos');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['nombre_completo', 'telefono'];
    
    // Verificar que tenga los headers requeridos
    const hasRequired = requiredHeaders.every(req => headers.includes(req));
    if (!hasRequired) {
      throw new Error('El CSV debe contener las columnas: nombre_completo, telefono');
    }

    const data: Array<Record<string, string>> = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      // Validar que tenga los campos requeridos
      if (row['nombre_completo'] && row['telefono']) {
        data.push(row);
      }
    }

    return data;
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      setError('Por favor seleccione un archivo CSV');
      return;
    }

    setCsvLoading(true);
    setError('');

    try {
      const text = await csvFile.text();
      const parsedData = parseCSV(text);

      if (parsedData.length === 0) {
        throw new Error('No se encontraron datos válidos en el CSV');
      }

      // Preparar datos para insertar
      const datosInsertar = parsedData.map(row => ({
        nombre_completo: row['nombre_completo'],
        telefono: row['telefono'],
        rol: (row['rol'] || 'Residente') as 'Residente' | 'Centinela' | 'Admin_JAC' | 'Admin_Cabildo',
        direccion_notas: row['direccion_notas'] || row['direccion'] || null,
        es_arrendatario: row['es_arrendatario']?.toLowerCase() === 'true' || false,
        esta_activo: true,
      }));

      // Insertar en lotes para evitar problemas con duplicados
      let insertados = 0;
      let errores = 0;

      for (const dato of datosInsertar) {
        try {
          const { error: insertError } = await supabase
            .from('tbl_comunidad')
            .insert(dato);

          if (insertError) {
            // Si es un error de configuración, mostrar mensaje específico
            if (insertError.code === 'CONFIG_ERROR' || insertError.message?.includes('credentials not configured')) {
              throw new Error('Credenciales de Supabase no configuradas. Por favor, configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local');
            }
            console.error('Error insertando:', insertError);
            errores++;
          } else {
            insertados++;
          }
        } catch (err) {
          errores++;
        }
      }

      setSuccess(true);
      setError('');
      
      if (errores > 0) {
        setError(`${insertados} registros insertados. ${errores} errores (posibles teléfonos duplicados)`);
      } else {
        setError('');
      }

      setCsvFile(null);
      await cargarComunidad();
      
      // Resetear input file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error procesando CSV:', err);
      setError(err.message || 'Error al procesar el archivo CSV');
    } finally {
      setCsvLoading(false);
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
                    value={formData.nombre_completo}
                    onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Juan Pérez"
                  />
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

                <div>
                  <label htmlFor="direccion" className="block text-sm font-medium text-neutral-700 mb-2">
                    Dirección / Notas
                  </label>
                  <textarea
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dirección o notas adicionales"
                    rows={2}
                  />
                </div>

                <div>
                  <label htmlFor="rol" className="block text-sm font-medium text-neutral-700 mb-2">
                    Rol
                  </label>
                  <select
                    id="rol"
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Residente">Residente</option>
                    <option value="Centinela">Centinela</option>
                    <option value="Admin_JAC">Admin JAC</option>
                    <option value="Admin_Cabildo">Admin Cabildo</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="es_arrendatario"
                    checked={formData.es_arrendatario}
                    onChange={(e) => setFormData({ ...formData, es_arrendatario: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="es_arrendatario" className="ml-2 text-sm text-neutral-700">
                    Es arrendatario
                  </label>
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
                    onClick={() => setFormData({ 
                      nombre_completo: '', 
                      correo: '', 
                      telefono: '', 
                      direccion: '',
                      rol: 'Residente',
                      es_arrendatario: false,
                      consentimiento: false 
                    })}
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

              {loadingList ? (
                <LoadingSpinner size="lg" text="Cargando suscriptores..." />
              ) : activos.length === 0 ? (
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
                          Teléfono
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                          Dirección / Notas
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
                        <tr key={persona.comunidad_id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                            {persona.nombre_completo}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600">
                            {persona.telefono}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600">
                            {persona.rol}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600">
                            {persona.direccion_notas || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600">
                            {persona.created_at 
                              ? new Date(persona.created_at).toLocaleDateString('es-ES')
                              : '-'}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <button
                              onClick={() => persona.comunidad_id && handleEliminarActivo(persona.comunidad_id)}
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
                El archivo CSV debe contener las columnas: <strong>nombre_completo</strong>, <strong>telefono</strong> (obligatorias). Opcionales: <strong>rol</strong> (Residente/Centinela/Admin_JAC/Admin_Cabildo), <strong>direccion_notas</strong>, <strong>es_arrendatario</strong> (true/false)
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
                    {csvFile && (
                      <p className="text-sm text-blue-600 mt-2">
                        Archivo seleccionado: {csvFile.name}
                      </p>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    onChange={handleCsvFileChange}
                  />
                </label>

                <div className="mt-6">
                  <button 
                    className="btn-primary"
                    onClick={handleCsvUpload}
                    disabled={!csvFile || csvLoading}
                  >
                    {csvLoading ? 'Procesando...' : 'Procesar archivo'}
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
