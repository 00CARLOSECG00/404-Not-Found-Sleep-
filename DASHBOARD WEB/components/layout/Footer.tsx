import Image from 'next/image';
import { Cloud } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Cloud className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold text-white">
                Yaku
              </span>
            </div>
            <p className="text-sm text-neutral-400">
              Sistema Comunitario de Alerta Temprana para la quebrada La Esmeralda, Tocancipá.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Enlaces
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm hover:text-white transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/alertas" className="text-sm hover:text-white transition-colors">
                  Alertas
                </a>
              </li>
              <li>
                <a href="/educacion" className="text-sm hover:text-white transition-colors">
                  Educación
                </a>
              </li>
              <li>
                <a href="/contacto" className="text-sm hover:text-white transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Colaboradores
            </h3>
            <div className="flex items-center space-x-3">
              <div className="w-24 h-12 sm:w-28 sm:h-14 md:w-32 md:h-16 bg-white rounded border border-gray-200 flex items-center justify-center p-2">
                <Image
                  src="/sponsor/Tocancipa.png"
                  alt="Colaborador 1"
                  width={128}
                  height={64}
                  className="object-contain"
                />
              </div>
              <div className="w-24 h-12 sm:w-28 sm:h-14 md:w-32 md:h-16 bg-white rounded border border-gray-200 flex items-center justify-center p-2">
                <Image
                  src="/sponsor/CruzRoja.png"
                  alt="Colaborador 2"
                  width={128}
                  height={64}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-700">
          <p className="text-sm text-center text-neutral-400">
            © {new Date().getFullYear()} Sistema de Alerta Temprana. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
