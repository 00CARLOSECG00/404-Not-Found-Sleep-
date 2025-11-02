'use client';

import Link from 'next/link';
import { AlertTriangle, Cloud, Droplets, Eye, Gauge, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SeverityBadge from '@/components/ui/SeverityBadge';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<'baja' | 'media' | 'alta'>('baja');

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  return (
    <div className="bg-neutral-50">
      <section className="relative text-white">
        {/* Background image (behind everything) */}
         <div
          className="absolute inset-0 -z-20"
          style={{ 
            backgroundImage: "url('/hero/TocancipaHero.JPG')",
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Dark overlay between image and content to improve legibility */}
        <div className="absolute inset-0 z-0 bg-black/60" />

        {/* Content above overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <Cloud className="h-10 w-10" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Sistema de alerta temprana
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 leading-relaxed">
              Protegiendo a la comunidad de Tocancipá ante crecientes de la quebrada La Esmeralda
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/alertas" className="btn-primary inline-flex items-center justify-center">
                <Eye className="h-5 w-5 mr-2" />
                Ver alertas activas
              </Link>
              <Link href="/login" className="btn-tertiary inline-flex items-center justify-center">
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-neutral-50 to-transparent"></div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Cómo funciona el sistema
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Monitoreo continuo y alertas automáticas para mantener a la comunidad informada
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="bg-white rounded-xl shadow-md p-8 border border-neutral-200 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 mb-6">
                <Gauge className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                1. Monitoreo continuo
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Sensores instalados en la quebrada miden el nivel del agua y la precipitación.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 border border-neutral-200 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-100 text-yellow-600 mb-6">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                2. Detección automática
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Cuando se detectan condiciones de riesgo, el sistema activa automáticamente una alerta según el nivel de severidad.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 border border-neutral-200 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 text-red-600 mb-6">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                3. Notificación comunitaria
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Los miembros suscritos reciben notificaciones inmediatas por SMS y Whatsapp con instrucciones de seguridad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 'Estado actual del sistema' eliminada */}

      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            ¿Quieres aprender más?
          </h2>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Conoce cómo interpretar las alertas y qué acciones tomar en cada situación
          </p>
          <Link href="/educacion" className="btn-secondary inline-flex items-center justify-center">
            Ir a Educación
          </Link>
        </div>
      </section>
    </div>
  );
}
