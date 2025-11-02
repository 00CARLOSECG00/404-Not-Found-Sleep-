'use client';

import { useState, useEffect } from 'react';
import { Download, Eye, Filter, Search } from 'lucide-react';
import SeverityBadge from '@/components/ui/SeverityBadge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
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
  datos: MedicionHidrologica;
}

export default function AlertasPrivadaPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('todas');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
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
        .limit(200);

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
            hora: fechaHora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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

    let matchesDate = true;
    if (dateFrom && dateTo) {
      const alertaDate = new Date(alerta.datos.ts).toISOString().split('T')[0];
      matchesDate = alertaDate >= dateFrom && alertaDate <= dateTo;
    }

    return matchesSearch && matchesSeverity && matchesDate;
  });

  const totalPages = Math.ceil(filteredAlertas.length / itemsPerPage);
  const paginatedAlertas = filteredAlertas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    // Convertir alertas a CSV
    const headers = ['ID', 'Fecha', 'Hora', 'Severidad', 'Nivel (m)', 'Lluvia (mm)', 'RoR (m/h)', 'Intensidad Lluvia (mm/h)', 'Proyección 30min (m)', 'Pendiente Hidráulica', 'Persistencia', 'Descripción'];
    const csvContent = [
      headers.join(','),
      ...filteredAlertas.map(alerta => {
        const m = alerta.datos;
        return [
          alerta.id,
          alerta.fecha,
          alerta.hora,
          alerta.severidad,
          m.nivel_m.toFixed(2),
          m.lluvia_mm.toFixed(2),
          m.ror ? m.ror.toFixed(4) : '',
          m.intensidad_lluvia ? m.intensidad_lluvia.toFixed(2) : '',
          m.proyeccion_30min ? m.proyeccion_30min.toFixed(2) : '',
          m.pendiente_hidraulica.toFixed(6),
          m.persistencia.toString(),
          `"${alerta.descripcion.replace(/"/g, '""')}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `alertas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Base de Datos de Alertas
            </h1>
            <p className="text-lg text-neutral-600">
              Consulta detallada del historial completo de alertas
            </p>
          </div>
          <button onClick={handleExport} className="btn-secondary inline-flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Exportar CSV
          </button>
        </div>

        {error && (
          <div className="mb-6">
            <AlertBanner type="error" title="Error" onClose={() => setError(null)}>
              {error}
            </AlertBanner>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Filtros</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-neutral-700 mb-2">
                Fecha desde
              </label>
              <input
                type="date"
                id="dateFrom"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium text-neutral-700 mb-2">
                Fecha hasta
              </label>
              <input
                type="date"
                id="dateTo"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-neutral-700 mb-2">
                Severidad
              </label>
              <select
                id="severity"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>

            <div>
              <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  id="search"
                  placeholder="Buscar en descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterSeverity('todas');
                setDateFrom('');
                setDateTo('');
              }}
              className="btn-tertiary text-sm"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" text="Cargando alertas..." />
        ) : filteredAlertas.length === 0 ? (
          <EmptyState
            icon={<Filter className="h-8 w-8" />}
            title="No se encontraron alertas"
            description="Intenta ajustar los filtros para ver más resultados."
          />
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                        Fecha y Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                        Severidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-neutral-700 uppercase">
                        Acciones
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
                        <td className="px-6 py-4 text-sm text-neutral-900 max-w-xs">
                          {alerta.descripcion}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedAlert(alerta)}
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver detalle
                          </button>
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
                    className="btn-tertiary text-sm"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn-tertiary text-sm"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <Modal
          isOpen={selectedAlert !== null}
          onClose={() => setSelectedAlert(null)}
          title="Detalle de Alerta"
          size="lg"
        >
          {selectedAlert && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 uppercase mb-4">
                    Información General
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-neutral-600">Fecha y Hora</dt>
                      <dd className="text-sm font-medium text-neutral-900">
                        {selectedAlert.fecha} {selectedAlert.hora}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-neutral-600">Severidad</dt>
                      <dd className="mt-1">
                        <SeverityBadge severity={selectedAlert.severidad} />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-neutral-600">Descripción</dt>
                      <dd className="text-sm font-medium text-neutral-900">
                        {selectedAlert.descripcion}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 uppercase mb-4">
                    Mediciones Hidrológicas
                  </h3>
                  <dl className="space-y-3">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <dt className="text-sm text-blue-700">Nivel del Agua</dt>
                      <dd className="text-2xl font-bold text-blue-900">
                        {selectedAlert.datos.nivel_m.toFixed(2)} m
                      </dd>
                      <dd className="text-xs text-blue-600 mt-1">
                        Base Level: {selectedAlert.datos.base_level.toFixed(2)} m
                      </dd>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <dt className="text-sm text-blue-700">Lluvia</dt>
                      <dd className="text-2xl font-bold text-blue-900">
                        {selectedAlert.datos.lluvia_mm.toFixed(2)} mm
                      </dd>
                      {selectedAlert.datos.intensidad_lluvia && (
                        <dd className="text-xs text-blue-600 mt-1">
                          Intensidad: {selectedAlert.datos.intensidad_lluvia.toFixed(2)} mm/h
                        </dd>
                      )}
                    </div>
                    {selectedAlert.datos.ror && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <dt className="text-sm text-blue-700">Rate of Rise (RoR)</dt>
                        <dd className="text-2xl font-bold text-blue-900">
                          {selectedAlert.datos.ror.toFixed(4)} m/h
                        </dd>
                      </div>
                    )}
                    {selectedAlert.datos.proyeccion_30min && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <dt className="text-sm text-blue-700">Proyección 30min</dt>
                        <dd className="text-2xl font-bold text-blue-900">
                          {selectedAlert.datos.proyeccion_30min.toFixed(2)} m
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-sm font-semibold text-neutral-700 uppercase mb-4">
                  Parámetros Hidrológicos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 text-center">
                    <p className="text-sm text-neutral-600 mb-1">ΔH</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {selectedAlert.datos.delta_h.toFixed(2)} m
                    </p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 text-center">
                    <p className="text-sm text-neutral-600 mb-1">Pendiente Hidráulica</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {selectedAlert.datos.pendiente_hidraulica.toFixed(6)}
                    </p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 text-center">
                    <p className="text-sm text-neutral-600 mb-1">Persistencia</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {selectedAlert.datos.persistencia}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-sm font-semibold text-neutral-700 uppercase mb-4">
                  Información de Procesamiento
                </h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-neutral-600">Procesado en:</dt>
                    <dd className="text-sm font-medium text-neutral-900">
                      {new Date(selectedAlert.datos.procesado_en).toLocaleString('es-ES')}
                    </dd>
                  </div>
                  {selectedAlert.datos.created_at && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-neutral-600">Registrado en:</dt>
                      <dd className="text-sm font-medium text-neutral-900">
                        {new Date(selectedAlert.datos.created_at).toLocaleString('es-ES')}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

