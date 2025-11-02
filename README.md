# Sistema de Alerta Temprana (SAT) - Yaku

Sistema de monitoreo hidrológico en tiempo real para la protección de la comunidad de Tocancipá ante crecientes de la quebrada La Esmeralda.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Configuración](#configuración)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Métricas Hidrológicas Calculadas](#métricas-hidrológicas-calculadas)
---

## Descripción General

**Yaku** (que significa "agua" en lengua indígena Quechua) es un sistema completo de alerta temprana que monitorea continuamente el nivel del agua y la precipitación en la quebrada La Esmeralda. El sistema procesa datos de sensores, calcula métricas hidrológicas avanzadas, detecta condiciones de riesgo y genera alertas automáticas para proteger a la comunidad.

### Flujo de Datos

<img width="1171" height="144" alt="image" src="https://github.com/user-attachments/assets/aa92ff71-9418-40e4-bbd5-b9f4e9497116" />

---

## Arquitectura del Sistema

El sistema está compuesto por 4 módulos principales que trabajan en conjunto:

1. **Simulación** (`simulacion/`): Simula sensores que envían datos vía UDP y un gateway que los recibe
2. **Cola** (`cola/`): Servicio de cola que almacena mensajes temporalmente
3. **Backend ETL** (`back/`): Procesa datos, calcula métricas, envía alertas y guarda en Supabase
4. **Dashboard Web** (`DASHBOARD WEB/`): Interfaz web para visualización, gestión y registro de números telefónicos 

---


#### Tecnologías

- **Framework**: Next.js 13.5.1
- **Lenguaje**: TypeScript, python
- **UI Components**: Radix UI
- **Base de Datos**: Supabase (cliente JS)

#### Configuración

El dashboard requiere las siguientes variables de entorno:

- `NEXT_PUBLIC_SUPABASE_URL`: URL de tu instancia de Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima de Supabase

---

## Configuración

### Base de Datos Supabase

Antes de ejecutar el sistema, necesitas configurar Supabase y crear las tablas necesarias:

#### 1. Tabla de Mediciones (`mediciones_hidrologicas`)

Ejecuta el script `back/schema.sql` en el SQL Editor de Supabase:

```sql
CREATE TABLE IF NOT EXISTS mediciones_hidrologicas (
    id BIGSERIAL PRIMARY KEY,
    ts TIMESTAMPTZ NOT NULL,
    nivel_m DECIMAL(10, 2) NOT NULL,
    lluvia_mm DECIMAL(10, 2) NOT NULL,
    base_level DECIMAL(10, 2),
    delta_h DECIMAL(10, 2),
    ror DECIMAL(10, 4),
    intensidad_lluvia DECIMAL(10, 2),
    proyeccion_30min DECIMAL(10, 2),
    pendiente_hidraulica DECIMAL(10, 6),
    persistencia INTEGER,
    procesado_en TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. Tabla de Comunidad (`tbl_Comunidad`)

Ejecuta el script `DASHBOARD WEB/schema.sql` en el SQL Editor de Supabase:

```sql
CREATE TABLE IF NOT EXISTS tbl_Comunidad (
    comunidad_id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) UNIQUE NOT NULL,
    rol enum_rol_comunidad DEFAULT 'Residente',
    direccion_notas TEXT,
    es_arrendatario BOOLEAN DEFAULT false,
    esta_activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Instalación y Ejecución

### Prerrequisitos

- Docker y Docker Compose instalados
- Cuenta de Supabase configurada
- Variables de entorno configuradas

### Pasos de Instalación

1. **Configurar variables de entorno**

   Crea un archivo `.env` en `back/` con:
   ```env
   SUPABASE_URL=tu_supabase_url
   SUPABASE_KEY=tu_supabase_service_key
   COLA_URL=http://cola:5000
   WEBHOOK_ALERTA_URL=tu_webhook_url
   ```

   Crea un archivo `.env` en `DASHBOARD WEB/` con:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

2. **Construir contenedores Docker**

   ```bash
   sudo docker compose build
   ```

3. **Iniciar servicios**

   ```bash
   sudo docker-compose up -d
   ```

   Esto iniciará todos los servicios:
   - `sensor`: Simulador de sensores
   - `gateway`: Gateway UDP que recibe datos
   - `cola`: Servicio de cola HTTP (puerto 5000)
   - `back`: Backend ETL que procesa datos
   - `dashboard`: Dashboard web (puerto 3000)

4. **Verificar que todo está funcionando**

   - Cola: http://localhost:5000/health
   - Dashboard: http://localhost:3000

### Detener Servicios

```bash
sudo docker compose down
```

---

## Métricas Hidrológicas Calculadas

### 1. BaseLevel
**Descripción**: Nivel base del río  
**Cálculo**: `base_level = nivel_m`  
**Unidad**: metros (m)

### 2. ΔH (Delta H)
**Descripción**: Diferencia de altura respecto al nivel inicial  
**Cálculo**: `delta_h = nivel_m - altura_inicial_m`  
**Unidad**: metros (m)  
**Valor de referencia**: `altura_inicial_m = 2595.4m`

### 3. RoR (Rate of Rise)
**Descripción**: Tasa de incremento del nivel del río  
**Cálculo**: `ror = (nivel_actual - nivel_anterior) / delta_tiempo`  
**Unidad**: metros por hora (m/hora)  
**Interpretación**: Valores positivos indican crecida, negativos indican descenso

### 4. Intensidad de Lluvia
**Descripción**: Intensidad de precipitación  
**Cálculo**: `intensidad = lluvia_mm / delta_tiempo`  
**Unidad**: milímetros por hora (mm/hora)

### 5. Proyección a 30 min
**Descripción**: Proyección del nivel del río en 30 minutos  
**Cálculo**: `proyeccion_30min = nivel_actual + (ror * 0.5)`  
**Unidad**: metros (m)  
**Uso**: Predicción de nivel futuro para evaluación de riesgo

### 6. Pendiente Hidráulica
**Descripción**: Pendiente hidráulica del tramo del río  
**Cálculo**: `pendiente = (altura_agua_arriba - altura_agua_abajo) / largo_rio`  
**Unidad**: adimensional  
**Fórmula completa**:
- `altura_agua_arriba = altura_inicial_m + nivel_m`
- `altura_agua_abajo = altura_final_m`
- `pendiente = (altura_agua_arriba - altura_agua_abajo) / largo_rio_m`

### 7. Persistencia
**Descripción**: Número de mediciones consecutivas que superan el umbral de alerta  
**Cálculo**: Cuenta mediciones consecutivas donde `nivel_m > 0.5m`  
**Unidad**: adimensional (entero)  
**Uso**: Confirma que una condición de alerta se mantiene en el tiempo

---

## Estructura del Proyecto

```
404-Not-Found-Sleep-/
├── simulacion/          # Simulador de sensores y gateway
│   ├── sensor_simulator.py
│   ├── gateway.py
│   ├── requirements.txt
│   └── Dockerfile
├── cola/                # Servicio de cola
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
├── back/                # Backend ETL
│   ├── app.py
│   ├── schema.sql
│   ├── requirements.txt
│   └── Dockerfile
├── DASHBOARD WEB/       # Dashboard web Next.js
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── schema.sql
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Características del Sistema

- ✅ **Base de Datos Cloud**: Almacenamiento seguro en Supabase.

- ✅ **Monitoreo en Tiempo Real**: Datos actualizados cada 30 segundos en el dashboard.

- ✅ **Cálculo de Métricas Avanzadas**: 7 métricas hidrológicas diferentes.

- ✅ **Sistema de Alertas Automático**: Detección y notificación de condiciones de riesgo.

- ✅ **Visualización Interactiva**: Gráficos en tiempo real con Recharts.

- ✅ **Gestión de Usuarios**: Sistema de suscripción para notificaciones.

- ✅ **Asíncrono**: No requiere una conexión de red constante o estable. Los mensajes se almacenan en colas, lo que permite que se procesen de manera independiente y en diferentes momentos.

---

## Notas Importantes

- El sistema está **completamente funcional** y requiere ajuste de datos del terreno donde se implementará
- La cola actual usa almacenamiento en memoria. Para producción, considera usar Redis o RabbitMQ
- Los umbrales de alerta están configurados en el código y pueden ajustarse según necesidades

---

# 💧 YAKU

## 🔹 Nombre del proyecto  
**YAKU** – Sistema comunitario de alerta temprana y prevención ante inundaciones rurales.

---

## 🔹 Descripción breve  
**YAKU** es un sistema de **alerta temprana y monitoreo del nivel del agua**, diseñado para comunidades rurales con acceso limitado a internet, como la vereda **La Esmeralda (Tocancipá, Cundinamarca)**.  
El proyecto busca **reducir el riesgo de inundaciones** mediante sensores LoRa de bajo consumo y un modelo de comunicación híbrido (WhatsApp y SMS) que garantiza la notificación incluso sin conexión a internet.  
Su **propuesta de valor** integra una **cola asíncrona** que almacena los mensajes de alerta cuando no hay conectividad y los envía automáticamente cuando esta se restablece.

---

## 🔹 Nivel de desarrollo  
**Etapa:** Prototipo funcional (en simulación).  
Actualmente, el modelo **funciona de manera completa a nivel lógico y digital**, incluyendo:  
- Página web operativa para monitoreo.  
- Componente de procesos y recolector de datos de sensores.  
- Integración con **Twilio** para envío de alertas por **WhatsApp y SMS**.  
- Base de datos activa en **Supabase**.  
- Simulación de lectura de sensores **LoRa** y procesamiento de datos.  

La **estructura física (instalación real de sensores y hub LoRa)** aún no se ha implementado; se encuentra en etapa de diseño.

---

## 🔹 Video de presentación  
🔗 [Pendiente de enlace al video demo o pitch de YAKU](#)

---

## 🔹 Ventajas o fortalezas  
1. **Accesibilidad total:** opera incluso sin conexión a internet gracias a la cola asíncrona y al uso de **mensajes SMS**.  
2. **Tecnología sostenible:** sensores **LoRa** de bajo consumo energético y amplia cobertura sin necesidad de red móvil.  
3. **Enfoque comunitario:** diseñado para comunidades rurales, sin necesidad de conocimientos técnicos.  
4. **Escalabilidad y replicabilidad:** fácilmente adaptable a otras zonas rurales o tipos de riesgo (sequías, deslizamientos, etc.).

---

## 🔹 Desventajas o debilidades  
1. **Dependencia de los sensores físicos:** posibles daños por humedad, golpes o deterioro en ambientes extremos.  
2. **Falta de infraestructura física instalada:** el sistema aún no se ha probado en campo real.  
3. **Mantenimiento técnico eventual:** se requiere revisión periódica del hardware una vez implementado.

---

## 🔹 Detalles técnicos  

### Lenguajes y tecnologías  
- **Framework:** Next.js 13.5.1  
- **Lenguaje:** TypeScript 
- **Base de Datos:** Supabase  
- **Automatización de flujos:** n8n  
- **API de mensajería:** Twilio (WhatsApp/SMS)  
- **Comunicación de sensores:** LoRa (SX1276/SX1278)  
- **Controladores:** ESP32  
- **Simulación de datos y pruebas:** Postman  
- **Repositorio de control de versiones:** GitHub  

### Herramientas adicionales  
- **Gestión y versionado:** GitHub  
- **Pruebas de API y mensajería:** Postman  
- **Orquestación de procesos:** n8n  
- **Diseño e interfaz:** Figma  

### Alcance del prototipo  
El sistema actual permite:  
- Simulación completa de detección de niveles de agua.  
- Procesamiento de datos en tiempo real.  
- Generación automática de alertas.  
- Envío de notificaciones a usuarios vía WhatsApp o SMS según la conectividad.  
- Visualización de alertas y datos históricos en la web.

### Presupuesto estimado  
**≈ 20 millones de pesos COP**, incluyendo sensores LoRa, microcontroladores, baterías, caja IP65, sistema solar, y montaje inicial.

---

## 🔹 Repositorio del proyecto  
📁 [Pendiente de enlace al repositorio YAKU en GitHub](#)

---

## 💧 **Resumen conceptual**
YAKU integra **tecnología de comunicación resiliente**, **energía limpia** y **alertas accesibles** para fortalecer la **resiliencia comunitaria** frente a inundaciones, sin depender de infraestructura compleja ni conectividad constante.
