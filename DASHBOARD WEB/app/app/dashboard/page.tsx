'use client';

import { useState, useEffect } from 'react';
import { supabase, MedicionHidrologica } from '@/lib/supabase';

// Marcar como dinámico para evitar generación estática
export const dynamic = 'force-dynamic';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AlertBanner from '@/components/ui/AlertBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Droplets, TrendingUp, Gauge } from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediciones, setMediciones] = useState<MedicionHidrologica[]>([]);
  const [ultimaMedicion, setUltimaMedicion] = useState<MedicionHidrologica | null>(null);

  useEffect(() => {
    cargarMediciones();
    // Refrescar cada 30 segundos
    const interval = setInterval(cargarMediciones, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarMediciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('mediciones_hidrologicas')
        .select('*')
        .order('ts', { ascending: false })
        .limit(100);

      if (supabaseError) {
        // Si es un error de configuración, mostrar mensaje específico
        if (supabaseError.code === 'CONFIG_ERROR' || supabaseError.message?.includes('credentials not configured')) {
          throw new Error('Credenciales de Supabase no configuradas. Por favor, configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local');
        }
        throw supabaseError;
      }

      if (data && data.length > 0) {
        setMediciones(data);
        setUltimaMedicion(data[0]);
      }
    } catch (err) {
      console.error('Error cargando mediciones:', err);
      setError('Error al cargar los datos. Verifica la configuración de Supabase.');
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para gráficos (solo campos no null)
  const datosGrafico = mediciones
    .slice()
    .reverse()
    .map((m) => ({
      fecha: new Date(m.ts).toLocaleString('es-ES', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      nivel_m: m.nivel_m,
      lluvia_mm: m.lluvia_mm,
      base_level: m.base_level,
      delta_h: m.delta_h,
      pendiente_hidraulica: m.pendiente_hidraulica,
      persistencia: m.persistencia,
    }));

  const chartConfig = {
    nivel_m: {
      label: 'Nivel (m)',
      color: '#3b82f6',
    },
    lluvia_mm: {
      label: 'Lluvia (mm)',
      color: '#06b6d4',
    },
    base_level: {
      label: 'Base Level (m)',
      color: '#10b981',
    },
    delta_h: {
      label: 'ΔH (m)',
      color: '#f59e0b',
    },
    pendiente_hidraulica: {
      label: 'Pendiente',
      color: '#8b5cf6',
    },
    persistencia: {
      label: 'Persistencia',
      color: '#ef4444',
    },
  };

  if (loading && mediciones.length === 0) {
    return (
      <div className="bg-neutral-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" text="Cargando datos del dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Dashboard Hidrológico
          </h1>
          <p className="text-lg text-neutral-600">
            Monitoreo en tiempo real de las mediciones hidrológicas
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <AlertBanner type="error" title="Error" onClose={() => setError(null)}>
              {error}
            </AlertBanner>
          </div>
        )}

        {/* Tarjetas de resumen */}
        {ultimaMedicion && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nivel del Río</CardTitle>
                <Droplets className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ultimaMedicion.nivel_m.toFixed(2)} m</div>
                <p className="text-xs text-muted-foreground">
                  Base Level: {ultimaMedicion.base_level.toFixed(2)} m
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lluvia</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ultimaMedicion.lluvia_mm.toFixed(2)} mm</div>
                <p className="text-xs text-muted-foreground">
                  {ultimaMedicion.intensidad_lluvia 
                    ? `Intensidad: ${ultimaMedicion.intensidad_lluvia.toFixed(2)} mm/h`
                    : 'Sin cálculo de intensidad'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendiente Hidráulica</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {ultimaMedicion.pendiente_hidraulica.toFixed(4)}
                </div>
                <p className="text-xs text-muted-foreground">
                  ΔH: {ultimaMedicion.delta_h.toFixed(2)} m
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Persistencia</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ultimaMedicion.persistencia}</div>
                <p className="text-xs text-muted-foreground">
                  {ultimaMedicion.proyeccion_30min 
                    ? `Proyección 30min: ${ultimaMedicion.proyeccion_30min.toFixed(2)} m`
                    : 'Sin proyección disponible'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráficos */}
        {mediciones.length > 0 ? (
          <div className="space-y-8">
            {/* Gráfico de Nivel del Río */}
            <Card>
              <CardHeader>
                <CardTitle>Nivel del Río (m)</CardTitle>
                <CardDescription>Evolución del nivel del agua en el tiempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart data={datosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="nivel_m" 
                      stroke={chartConfig.nivel_m.color}
                      strokeWidth={2}
                      name={chartConfig.nivel_m.label}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Lluvia */}
            <Card>
              <CardHeader>
                <CardTitle>Lluvia (mm)</CardTitle>
                <CardDescription>Precipitación medida</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart data={datosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="lluvia_mm" 
                      stroke={chartConfig.lluvia_mm.color}
                      strokeWidth={2}
                      name={chartConfig.lluvia_mm.label}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Gráfico combinado de Base Level y Delta H */}
            <Card>
              <CardHeader>
                <CardTitle>Base Level y ΔH</CardTitle>
                <CardDescription>Nivel base y diferencia de altura</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart data={datosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="base_level" 
                      stroke={chartConfig.base_level.color}
                      strokeWidth={2}
                      name={chartConfig.base_level.label}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="delta_h" 
                      stroke={chartConfig.delta_h.color}
                      strokeWidth={2}
                      name={chartConfig.delta_h.label}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Pendiente Hidráulica */}
            <Card>
              <CardHeader>
                <CardTitle>Pendiente Hidráulica</CardTitle>
                <CardDescription>Pendiente del tramo del río</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart data={datosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="pendiente_hidraulica" 
                      stroke={chartConfig.pendiente_hidraulica.color}
                      strokeWidth={2}
                      name={chartConfig.pendiente_hidraulica.label}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Persistencia */}
            <Card>
              <CardHeader>
                <CardTitle>Persistencia</CardTitle>
                <CardDescription>Número de mediciones consecutivas sobre umbral</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart data={datosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="persistencia" 
                      stroke={chartConfig.persistencia.color}
                      strokeWidth={2}
                      name={chartConfig.persistencia.label}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-600">
                No hay datos disponibles. Asegúrate de que el backend esté procesando mediciones.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

