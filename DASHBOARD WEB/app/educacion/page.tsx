import { Activity, AlertTriangle, BookOpen, Droplets, Gauge, Thermometer } from 'lucide-react';

export default function EducacionPage() {
  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Centro de Educación
          </h1>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            Aprende sobre el sistema de alertas, las variables que monitoreamos y cómo actuar en cada situación
          </p>
        </div>

        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Gauge className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-neutral-900">
              Variables Monitoreadas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-neutral-200">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Droplets className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                Nivel del Agua
              </h3>
              <p className="text-neutral-600 mb-4">
                Medimos la altura del agua en la quebrada mediante sensores ultrasónicos de alta precisión.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-700">Normal:</span>
                  <span className="font-medium text-green-600">&lt; 1.0 m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-700">Precaución:</span>
                  <span className="font-medium text-yellow-600">1.0 - 1.5 m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-700">Peligro:</span>
                  <span className="font-medium text-red-600">&gt; 1.5 m</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-neutral-200">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                Precipitación
              </h3>
              <p className="text-neutral-600 mb-4">
                Pluviómetros automáticos registran la cantidad de lluvia en milímetros por hora.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-700">Ligera:</span>
                  <span className="font-medium text-green-600">&lt; 10 mm/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-700">Moderada:</span>
                  <span className="font-medium text-yellow-600">10 - 30 mm/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-700">Intensa:</span>
                  <span className="font-medium text-red-600">&gt; 30 mm/h</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-neutral-200">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Thermometer className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                Temperatura del Agua
              </h3>
              <p className="text-neutral-600 mb-4">
                Monitoreamos la temperatura para detectar cambios abruptos que puedan indicar eventos extremos.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-700">Rango normal:</span>
                  <span className="font-medium text-neutral-900">12 - 18°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-700">Precisión:</span>
                  <span className="font-medium text-neutral-900">±0.5°C</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center mb-8">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
            <h2 className="text-3xl font-bold text-neutral-900">
              Semáforo de Alertas
            </h2>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">¿Cómo decide el sistema qué alerta enviar?</h3>
            <p className="text-neutral-700 mb-4 text-base">
              El sistema mira varias cosas a la vez para decidir si hay peligro. Lo más importante es <strong>qué tan alta está el agua</strong>, pero también revisa:
            </p>
            <ul className="space-y-3 text-neutral-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 text-2xl">•</span>
                <span><strong>¿Qué tan alta está el agua?</strong> Esto es lo que más pesa en la decisión</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 text-2xl">•</span>
                <span><strong>¿Está subiendo rápido?</strong> Si el agua sube muy rápido, es más peligroso</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 text-2xl">•</span>
                <span><strong>¿Lleva mucho tiempo alta?</strong> Si el agua lleva horas alta, aumenta el riesgo</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 text-2xl">•</span>
                <span><strong>¿Va a seguir subiendo?</strong> Si el sistema calcula que va a empeorar pronto</span>
              </li>
            </ul>
            <p className="text-neutral-700 mt-4 text-base">
              Con toda esta información, el sistema calcula un número de 0 a 1 que indica qué tan peligrosa está la situación.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-neutral-200">
              <div className="bg-green-500 text-white px-6 py-4">
                <h3 className="text-2xl font-bold">🟢 Alerta Verde - Todo tranquilo</h3>
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-neutral-900 mb-3 text-lg">¿Cuándo se activa?</h4>
                <p className="text-neutral-700 mb-4">
                  Cuando el agua está en nivel normal y no hay señales de peligro.
                </p>
                <h4 className="font-semibold text-neutral-900 mb-3 text-lg">Qué hacer:</h4>
                <p className="text-neutral-700 text-base">
                  Está todo bien. Puede hacer su vida normal. Siga pendiente de las alertas por si cambia la situación.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-neutral-200">
              <div className="bg-yellow-500 text-white px-6 py-4">
                <h3 className="text-2xl font-bold">🟡 Alerta Amarilla - Póngase las pilas</h3>
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-neutral-900 mb-3 text-lg">¿Cuándo se activa?</h4>
                <p className="text-neutral-700 mb-4">
                  Cuando el agua está subiendo o ya está alta. Todavía no es una emergencia, pero hay que estar alerta.
                </p>
                <h4 className="font-semibold text-neutral-900 mb-3 text-lg">Qué hacer:</h4>
                <ul className="space-y-2 text-neutral-700 text-base">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">▸</span>
                    <span>Esté pendiente del celular para recibir avisos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">▸</span>
                    <span>Tenga lista una bolsa con documentos y medicinas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">▸</span>
                    <span>Recuerde por dónde salir si hay que evacuar</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">▸</span>
                    <span>No se acerque a la quebrada</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">▸</span>
                    <span>Cargue bien su celular</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">▸</span>
                    <span>Avísele a su familia de la situación</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-neutral-200">
              <div className="bg-red-600 text-white px-6 py-4">
                <h3 className="text-2xl font-bold">🔴 Alerta Roja - ¡PELIGRO!</h3>
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-neutral-900 mb-3 text-lg">¿Cuándo se activa?</h4>
                <p className="text-neutral-700 mb-4">
                  Cuando el agua está muy alta y hay peligro real de creciente o avalancha. <strong>Es una emergencia.</strong>
                </p>
                <h4 className="font-semibold text-neutral-900 mb-3 text-lg">Qué hacer:</h4>
                <div className="bg-red-50 p-4 rounded-lg border-2 border-red-600">
                  <ul className="space-y-3 text-neutral-900 text-base">
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2 text-xl">⚠</span>
                      <span className="font-semibold">Salga INMEDIATAMENTE si vive cerca de la quebrada</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">▸</span>
                      <span>Vaya al punto de encuentro que ya conoce</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">▸</span>
                      <span>NO trate de cruzar el agua, aunque se vea bajita</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">▸</span>
                      <span>Aléjese de puentes y de la orilla de la quebrada</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">▸</span>
                      <span>Haga caso a las autoridades</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">▸</span>
                      <span>Lleve solo lo más importante (papeles, medicinas)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">▸</span>
                      <span>NO regrese hasta que las autoridades digan que es seguro</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center mb-8">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-neutral-900">
              Recomendaciones Generales
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 border border-neutral-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                  Antes de una emergencia
                </h3>
                <ul className="space-y-3 text-neutral-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Suscríbase al sistema de alertas para recibir notificaciones</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Identifique los puntos de encuentro y rutas de evacuación</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Prepare un kit de emergencia con agua, alimentos no perecederos y medicamentos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Mantenga documentos importantes en un lugar seguro y accesible</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                  Durante una emergencia
                </h3>
                <ul className="space-y-3 text-neutral-700">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>Mantenga la calma y siga las instrucciones oficiales</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>Evacue inmediatamente si recibe alerta roja</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>Nunca cruce corrientes de agua, incluso si parecen poco profundas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>Manténgase comunicado con familiares y autoridades</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center mb-8">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-neutral-900">
              Recomendaciones Generales
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 border border-neutral-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                  Antes de una emergencia
                </h3>
                <ul className="space-y-3 text-neutral-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Suscríbase al sistema de alertas para recibir notificaciones</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Identifique los puntos de encuentro y rutas de evacuación</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Prepare un kit de emergencia con agua, alimentos no perecederos y medicamentos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Mantenga documentos importantes en un lugar seguro y accesible</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                  Durante una emergencia
                </h3>
                <ul className="space-y-3 text-neutral-700">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>Mantenga la calma y siga las instrucciones oficiales</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>Evacue inmediatamente si recibe alerta roja</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>Nunca cruce corrientes de agua, incluso si parecen poco profundas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>Manténgase comunicado con familiares y autoridades</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center mb-8">
            <Droplets className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-3xl font-bold text-neutral-900">
              Medidas Preventivas Comunitarias
            </h2>
          </div>

          <p className="text-lg text-neutral-600 mb-8 max-w-4xl">
            Estas acciones ayudan a prevenir inundaciones y crecientes desde el origen. Son trabajos que se hacen entre todos para proteger la quebrada y las comunidades.
          </p>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-neutral-200">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4">
                <h3 className="text-2xl font-bold">Restauración de la Ronda Hídrica</h3>
                <p className="text-green-50 mt-1">Protección natural de las orillas de la quebrada</p>
              </div>
              <div className="p-6">
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                  <p className="font-semibold text-neutral-900 mb-1">Objetivo</p>
                  <p className="text-neutral-700">Evitar la erosión y los desbordamientos de la quebrada.</p>
                </div>

                <h4 className="font-semibold text-neutral-900 mb-4 text-lg">Pasos a seguir:</h4>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <span className="flex-shrink-0 bg-green-100 text-green-700 font-bold rounded-full w-7 h-7 flex items-center justify-center mr-3 mt-0.5">1</span>
                    <div>
                      <p className="font-medium text-neutral-900">Identificar la franja de protección</p>
                      <p className="text-neutral-600 text-sm mt-1">Marcar al menos 10 a 30 metros a cada lado de la quebrada donde no se deben pastorear animales ni construir.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 bg-green-100 text-green-700 font-bold rounded-full w-7 h-7 flex items-center justify-center mr-3 mt-0.5">2</span>
                    <div>
                      <p className="font-medium text-neutral-900">Limpiar la zona</p>
                      <p className="text-neutral-600 text-sm mt-1">Retirar basura, escombros y maleza invasora.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 bg-green-100 text-green-700 font-bold rounded-full w-7 h-7 flex items-center justify-center mr-3 mt-0.5">3</span>
                    <div>
                      <p className="font-medium text-neutral-900">Sembrar especies nativas</p>
                      <p className="text-neutral-600 text-sm mt-1">Usar plantas y árboles locales como aliso, sauce, chusque o guadua.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 bg-green-100 text-green-700 font-bold rounded-full w-7 h-7 flex items-center justify-center mr-3 mt-0.5">4</span>
                    <div>
                      <p className="font-medium text-neutral-900">Proteger las plantas</p>
                      <p className="text-neutral-600 text-sm mt-1">Colocar estacas o cercas temporales para evitar que el ganado las dañe.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 bg-green-100 text-green-700 font-bold rounded-full w-7 h-7 flex items-center justify-center mr-3 mt-0.5">5</span>
                    <div>
                      <p className="font-medium text-neutral-900">Mantener y cuidar</p>
                      <p className="text-neutral-600 text-sm mt-1">Regar en época seca y reemplazar las que no prendan.</p>
                    </div>
                  </div>
                </div>

                <h4 className="font-semibold text-neutral-900 mb-3 text-lg">Beneficios:</h4>
                <ul className="space-y-2 text-neutral-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">▸</span>
                    <span>Las raíces sostienen el suelo y evitan derrumbes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">▸</span>
                    <span>El agua se filtra mejor, reduciendo el riesgo de inundación</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">▸</span>
                    <span>Mejora el paisaje y la calidad del agua</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">▸</span>
                    <span>Permite instalar sensores del sistema Yaku protegidos por la vegetación</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-neutral-200">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
                <h3 className="text-2xl font-bold">Zanjas de Infiltración y Diques Naturales</h3>
                <p className="text-blue-50 mt-1">Retener el agua antes de que llegue al cauce principal</p>
              </div>
              <div className="p-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                  <p className="font-semibold text-neutral-900 mb-1">Objetivo</p>
                  <p className="text-neutral-700">Disminuir el caudal que baja de forma repentina y prevenir inundaciones.</p>
                </div>

                <h4 className="font-semibold text-neutral-900 mb-4 text-lg">Pasos a seguir:</h4>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <span className="flex-shrink-0 bg-blue-100 text-blue-700 font-bold rounded-full w-7 h-7 flex items-center justify-center mr-3 mt-0.5">1</span>
                    <div>
                      <p className="font-medium text-neutral-900">Ubicar los puntos clave</p>
                      <p className="text-neutral-600 text-sm mt-1">Zonas altas o inclinadas donde el agua baja con fuerza.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 bg-blue-100 text-blue-700 font-bold rounded-full w-7 h-7 flex items-center justify-center mr-3 mt-0.5">2</span>
                    <div>
                      <p className="font-medium text-neutral-900">Abrir zanjas curvas o en contorno</p>
                      <p className="text-neutral-600 text-sm mt-1">Con palas o azadones, de unos 30–40 cm de profundidad.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 bg-blue-100 text-blue-700 font-bold rounded-full w-7 h-7 flex items-center justify-center mr-3 mt-0.5">3</span>
                    <div>
                      <p className="font-medium text-neutral-900">Reforzar con materiales locales</p>
                      <p className="text-neutral-600 text-sm mt-1">Piedras, guadua o troncos para evitar que se desmoronen.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 bg-blue-100 text-blue-700 font-bold rounded-full w-7 h-7 flex items-center justify-center mr-3 mt-0.5">4</span>
                    <div>
                      <p className="font-medium text-neutral-900">Sembrar vegetación en los bordes</p>
                      <p className="text-neutral-600 text-sm mt-1">Ayuda a filtrar el agua y evitar la erosión.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 bg-blue-100 text-blue-700 font-bold rounded-full w-7 h-7 flex items-center justify-center mr-3 mt-0.5">5</span>
                    <div>
                      <p className="font-medium text-neutral-900">Revisar después de lluvias fuertes</p>
                      <p className="text-neutral-600 text-sm mt-1">Limpiar sedimentos o reparar partes dañadas.</p>
                    </div>
                  </div>
                </div>

                <h4 className="font-semibold text-neutral-900 mb-3 text-lg">Beneficios:</h4>
                <ul className="space-y-2 text-neutral-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">▸</span>
                    <span>El agua de lluvia se infiltra en el suelo</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">▸</span>
                    <span>Se reduce la velocidad del escurrimiento hacia la quebrada</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">▸</span>
                    <span>Aumenta la humedad del terreno y mejora los cultivos</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">¿Quién puede hacer estas medidas?</h3>
            <p className="text-neutral-700">
              Estos trabajos se organizan con la comunidad, las Juntas de Acción Comunal, y con apoyo de las autoridades ambientales. 
              Son acciones que nos benefician a todos y que podemos hacer entre vecinos para proteger nuestro territorio.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
