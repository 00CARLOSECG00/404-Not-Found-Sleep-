'use client';

import { useState } from 'react';
import { Download, Eye, Filter, MapPin, Search } from 'lucide-react';
import SeverityBadge from '@/components/ui/SeverityBadge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';

interface AlertDetail {
  id: string;
  fecha: string;
  hora: string;
  severidad: 'baja' | 'media' | 'alta';
  descripcion: string;
  zona: string;
  sensor: string;
  nivelAgua: string;
  precipitacion: string;
  temperatura: string;
  destinatarios: number;
  entregados: number;
  fallidos: number;
  coordenadas: string;
}

export default function AlertasPrivadaPage() {
  const [selectedAlert, setSelectedAlert] = useState<AlertDetail | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('todas');
  const [filterZona, setFilterZona] = useState('todas');
  const [filterSensor, setFilterSensor] = useState('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const mockAlertas: AlertDetail[] = [
    {
      id: '1',
      fecha: '2025-11-01',
      hora: '14:30:25',
      severidad: 'alta',
      descripcion: 'Nivel de agua crítico detectado en sensor principal',
      zona: 'Zona A - Centro',
      sensor: 'Sensor-01',
      nivelAgua: '1.8 m',
      precipitacion: '35 mm/h',
      temperatura: '16.5°C',
      destinatarios: 150,
      entregados: 148,
      fallidos: 2,
      coordenadas: '4.9592° N, 73.9156° W',
    },
    {
      id: '2',
      fecha: '2025-11-01',
      hora: '10:15:42',
      severidad: 'media',
      descripcion: 'Incremento de precipitación por encima del umbral',
      zona: 'Zona B - Norte',
      sensor: 'Sensor-02',
      nivelAgua: '1.2 m',
      precipitacion: '22 mm/h',
      temperatura: '15.8°C',
      destinatarios: 150,
      entregados: 150,
      fallidos: 0,
      coordenadas: '4.9612° N, 73.9145° W',
    },
    {
      id: '3',
      fecha: '2025-10-31',
      hora: '18:45:10',
      severidad: 'baja',
      descripcion: 'Nivel de agua en aumento moderado',
      zona: 'Zona C - Sur',
      sensor: 'Sensor-03',
      nivelAgua: '0.9 m',
      precipitacion: '8 mm/h',
      temperatura: '17.2°C',
      destinatarios: 150,
      entregados: 149,
      fallidos: 1,
      coordenadas: '4.9572° N, 73.9167° W',
    },
  ];

  const [alertas] = useState<AlertDetail[]>(mockAlertas);

  const filteredAlertas = alertas.filter((alerta) => {
    const matchesSearch = alerta.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'todas' || alerta.severidad === filterSeverity;
    const matchesZona = filterZona === 'todas' || alerta.zona === filterZona;
    const matchesSensor = filterSensor === 'todos' || alerta.sensor === filterSensor;

    let matchesDate = true;
    if (dateFrom && dateTo) {
      matchesDate = alerta.fecha >= dateFrom && alerta.fecha <= dateTo;
    }

    return matchesSearch && matchesSeverity && matchesZona && matchesSensor && matchesDate;
  });

  const totalPages = Math.ceil(filteredAlertas.length / itemsPerPage);
  const paginatedAlertas = filteredAlertas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    alert('Exportando a CSV...');
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

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Filtros</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
              <label htmlFor="zona" className="block text-sm font-medium text-neutral-700 mb-2">
                Zona
              </label>
              <select
                id="zona"
                value={filterZona}
                onChange={(e) => setFilterZona(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas</option>
                <option value="Zona A - Centro">Zona A - Centro</option>
                <option value="Zona B - Norte">Zona B - Norte</option>
                <option value="Zona C - Sur">Zona C - Sur</option>
              </select>
            </div>

            <div>
              <label htmlFor="sensor" className="block text-sm font-medium text-neutral-700 mb-2">
                Sensor
              </label>
              <select
                id="sensor"
                value={filterSensor}
                onChange={(e) => setFilterSensor(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="Sensor-01">Sensor-01</option>
                <option value="Sensor-02">Sensor-02</option>
                <option value="Sensor-03">Sensor-03</option>
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
                setFilterZona('todas');
                setFilterSensor('todos');
                setDateFrom('');
                setDateTo('');
              }}
              className="btn-tertiary text-sm"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {filteredAlertas.length === 0 ? (
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                        Zona
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                        Sensor
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {alerta.zona}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {alerta.sensor}
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
                    <div>
                      <dt className="text-sm text-neutral-600">Zona</dt>
                      <dd className="text-sm font-medium text-neutral-900">
                        {selectedAlert.zona}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-neutral-600">Sensor</dt>
                      <dd className="text-sm font-medium text-neutral-900">
                        {selectedAlert.sensor}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 uppercase mb-4">
                    Mediciones del Sensor
                  </h3>
                  <dl className="space-y-3">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <dt className="text-sm text-blue-700">Nivel del Agua</dt>
                      <dd className="text-2xl font-bold text-blue-900">
                        {selectedAlert.nivelAgua}
                      </dd>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <dt className="text-sm text-blue-700">Precipitación</dt>
                      <dd className="text-2xl font-bold text-blue-900">
                        {selectedAlert.precipitacion}
                      </dd>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <dt className="text-sm text-blue-700">Temperatura</dt>
                      <dd className="text-2xl font-bold text-blue-900">
                        {selectedAlert.temperatura}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-sm font-semibold text-neutral-700 uppercase mb-4">
                  Estado de Entrega de Notificaciones
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 text-center">
                    <p className="text-sm text-neutral-600 mb-1">Total Destinatarios</p>
                    <p className="text-3xl font-bold text-neutral-900">
                      {selectedAlert.destinatarios}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
                    <p className="text-sm text-green-700 mb-1">Entregados</p>
                    <p className="text-3xl font-bold text-green-900">
                      {selectedAlert.entregados}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200 text-center">
                    <p className="text-sm text-red-700 mb-1">Fallidos</p>
                    <p className="text-3xl font-bold text-red-900">
                      {selectedAlert.fallidos}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-sm font-semibold text-neutral-700 uppercase mb-4">
                  Ubicación del Sensor
                </h3>
                <div className="flex items-center space-x-2 text-neutral-900">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="font-mono text-sm">{selectedAlert.coordenadas}</span>
                </div>
                <div className="mt-4 bg-neutral-100 rounded-lg h-48 flex items-center justify-center border border-neutral-200">
                  <p className="text-neutral-600">Mapa de ubicación del sensor</p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
