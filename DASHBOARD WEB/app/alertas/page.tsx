'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Filter, Search } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import SeverityBadge from '@/components/ui/SeverityBadge';
import AlertBanner from '@/components/ui/AlertBanner';
import { supabase, MedicionHidrologica } from '@/lib/supabase';

// Marcar como dinámico para evitar generación estática
export const dynamic = 'force-dynamic';

interface AlertItem {
  id: string;
  fecha: string;
  hora: string;
  severidad: 'baja' | 'media' | 'alta';
  descripcion: string;
  datos?: MedicionHidrologica;
}

export default function AlertasPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('todas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [alertas, setAlertas] = useState<AlertItem[]>([]);

  useEffect(() => {
    cargarAlertas();
    // Refrescar cada 30 segundos
    const interval = setInterval(cargarAlertas, 30000);
    return () => clearInterval(interval);
  }, []);

  const determinarSeveridad = (medicion: MedicionHidrologica): 'baja' | 'media' | 'alta' => {
    const nivel = medicion.nivel_m;
    const proyeccion = medicion.proyeccion_30min;
    const ror = medicion.ror;
    const persistencia = medicion.persistencia;

    // Lógica de severidad basada en los umbrales del backend
    if (nivel > 0.5 || (proyeccion && proyeccion > 0.6) || (ror && ror > 0.1) || persistencia >= 3) {
      return 'alta';
    }
    if (nivel > 0.3 || persistencia >= 2) {
      return 'media';
    }
    return 'baja';
  };

  const generarDescripcion = (medicion: MedicionHidrologica): string => {
    const partes: string[] = [];
    
    if (medicion.nivel_m > 0.5) {
      partes.push(`Nivel crítico: ${medicion.nivel_m.toFixed(2)}m`);
    }
    if (medicion.proyeccion_30min && medicion.proyeccion_30min > 0.6) {
      partes.push(`Proyección a 30min: ${medicion.proyeccion_30min.toFixed(2)}m`);
    }
    if (medicion.ror && medicion.ror > 0.1) {
      partes.push(`RoR alto: ${medicion.ror.toFixed(4)} m/h`);
    }
    if (medicion.persistencia >= 3) {
      partes.push(`Persistencia: ${medicion.persistencia} mediciones`);
    }
    
    if (partes.length === 0) {
      return `Nivel: ${medicion.nivel_m.toFixed(2)}m, Lluvia: ${medicion.lluvia_mm.toFixed(2)}mm`;
    }
    
    return partes.join(' | ');
  };

  const cargarAlertas = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('mediciones_hidrologicas')
        .select('*')
        .order('ts', { ascending: false })
        .limit(50);

      if (supabaseError) {
        // Si es un error de configuración, mostrar mensaje específico
        if (supabaseError.code === 'CONFIG_ERROR' || supabaseError.message?.includes('credentials not configured')) {
          throw new Error('Credenciales de Supabase no configuradas. Por favor, configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local');
        }
        throw supabaseError;
      }

      if (data && data.length > 0) {
        const alertasGeneradas: AlertItem[] = data.map((medicion) => {
          const fechaHora = new Date(medicion.ts);
          return {
            id: medicion.id.toString(),
            fecha: fechaHora.toLocaleDateString('es-ES'),
            hora: fechaHora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            severidad: determinarSeveridad(medicion),
            descripcion: generarDescripcion(medicion),
            datos: medicion,
          };
        });
        
        setAlertas(alertasGeneradas);
      } else {
        setAlertas([]);
      }
    } catch (err) {
      console.error('Error cargando alertas:', err);
      setError('Error al cargar las alertas. Verifica la configuración de Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAlertas = alertas.filter((alerta) => {
    const matchesSearch = alerta.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'todas' || alerta.severidad === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const totalPages = Math.ceil(filteredAlertas.length / itemsPerPage);
  const paginatedAlertas = filteredAlertas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Alertas Públicas
          </h1>
          <p className="text-lg text-neutral-600">
            Consulta el historial de alertas emitidas por el sistema
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  id="search"
                  type="text"
                  placeholder="Buscar por descripción o zona..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="w-full lg:w-64">
              <label htmlFor="severity" className="block text-sm font-medium text-neutral-700 mb-2">
                <Filter className="inline h-4 w-4 mr-1" />
                Severidad
              </label>
              <select
                id="severity"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todas">Todas</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-xl font-semibold text-neutral-900">
              Leyenda de Severidad
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <SeverityBadge severity="baja" />
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">Baja</h3>
                  <p className="text-sm text-neutral-600">
                    Condiciones normales o incremento leve. Manténgase informado.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <SeverityBadge severity="media" />
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">Media</h3>
                  <p className="text-sm text-neutral-600">
                    Condiciones de precaución. Esté atento a actualizaciones.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <SeverityBadge severity="alta" />
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">Alta</h3>
                  <p className="text-sm text-neutral-600">
                    Peligro inminente. Evacue inmediatamente si está en zona de riesgo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" text="Cargando alertas..." />
        ) : error ? (
          <AlertBanner type="error" title="Error al cargar alertas" onClose={() => setError(null)}>
            {error}
          </AlertBanner>
        ) : filteredAlertas.length === 0 ? (
          <EmptyState
            icon={<AlertCircle className="h-8 w-8" />}
            title="No se encontraron alertas"
            description="No hay alertas que coincidan con los criterios de búsqueda."
          />
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                        Severidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                        Descripción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {paginatedAlertas.map((alerta) => (
                      <tr key={alerta.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          <div>{alerta.fecha}</div>
                          <div className="text-neutral-600">{alerta.hora}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <SeverityBadge severity={alerta.severidad} />
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-900">
                          {alerta.descripcion}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-600">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
                  {Math.min(currentPage * itemsPerPage, filteredAlertas.length)} de{' '}
                  {filteredAlertas.length} alertas
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn-tertiary text-sm disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn-tertiary text-sm disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
