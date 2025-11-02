'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Filter, Search } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import SeverityBadge from '@/components/ui/SeverityBadge';
import AlertBanner from '@/components/ui/AlertBanner';

interface AlertItem {
  id: string;
  fecha: string;
  hora: string;
  severidad: 'baja' | 'media' | 'alta';
  descripcion: string;
  zona: string;
}

export default function AlertasPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('todas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const mockAlertas: AlertItem[] = [
    {
      id: '1',
      fecha: '2025-11-01',
      hora: '14:30',
      severidad: 'alta',
      descripcion: 'Nivel de agua crítico detectado en sensor principal',
      zona: 'Zona A - Centro',
    },
    {
      id: '2',
      fecha: '2025-11-01',
      hora: '10:15',
      severidad: 'media',
      descripcion: 'Incremento de precipitación por encima del umbral',
      zona: 'Zona B - Norte',
    },
    {
      id: '3',
      fecha: '2025-10-31',
      hora: '18:45',
      severidad: 'baja',
      descripcion: 'Nivel de agua en aumento moderado',
      zona: 'Zona C - Sur',
    },
  ];

  const [alertas, setAlertas] = useState<AlertItem[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setAlertas(mockAlertas);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAlertas = alertas.filter((alerta) => {
    const matchesSearch = alerta.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alerta.zona.toLowerCase().includes(searchTerm.toLowerCase());
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
          <AlertBanner type="error" title="Error al cargar alertas">
            No se pudieron cargar las alertas. Por favor, inténtelo de nuevo más tarde.
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                        Zona
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {alerta.zona}
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
