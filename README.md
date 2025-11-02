## Estructura

- **cola/**: Aplicación simple de cola que recibe mensajes de medición
- **back/**: Backend ETL que procesa datos, calcula métricas hidrológicas y envía alertas




2. Edita `back/.env` y completa:
   - `SUPABASE_URL`: URL de tu proyecto Supabase
   - `SUPABASE_KEY`: Clave API de Supabase
   - `WEBHOOK_ALERTA_URL`: URL del webhook (por defecto ya está configurada)

## Comandos para ejecutar

### Iniciar la aplicación:
```bash
docker-compose up -d
```

### Detener la aplicación:
```bash
docker-compose down
```

## Cómo llenar la cola con un mensaje

Para enviar un mensaje a la cola, usa el siguiente comando:

```bash
curl -X POST http://localhost:5000/mensaje \
  -H "Content-Type: application/json" \
  -d '{
    "ts": "2025-11-01T12:10:00Z",
    "nivel_m": 0.42,
    "lluvia_mm": 1.6
  }'
```

Ejemplo con valores diferentes:

```bash
curl -X POST http://localhost:5000/mensaje \
  -H "Content-Type: application/json" \
  -d '{
    "ts": "2025-11-01T13:15:00Z",
    "nivel_m": 0.65,
    "lluvia_mm": 2.3
  }'
```

## Funciones calculadas

El backend calcula las siguientes métricas:

1. **BaseLevel**: Nivel base del río
2. **ΔH**: Diferencia de altura respecto al nivel inicial
3. **RoR**: Tasa de incremento del nivel (Rate of Rise) en m/hora
4. **Intensidad de lluvia**: Intensidad de lluvia en mm/hora
5. **Proyección a 30 min**: Proyección del nivel del río en 30 minutos
6. **Pendiente hidráulica**: Pendiente hidráulica del tramo
7. **Persistencia**: Número de mediciones consecutivas que superan el umbral

## Alertas

El sistema envía alertas SMS vía webhook Twilio cuando:
- Nivel del río > 0.5m
- Proyección a 30min > 0.6m
- RoR > 0.1 m/hora
- Persistencia ≥ 3

## Base de datos

Los datos procesados se guardan en Supabase en la tabla `mediciones_hidrologicas`. Asegúrate de crear esta tabla con los campos necesarios.

