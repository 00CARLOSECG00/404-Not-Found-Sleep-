## Estructura del Proyecto

- **cola/**: Aplicación simple de cola que recibe mensajes de medición
- **back/**: Backend ETL que procesa datos, calcula métricas hidrológicas y envía alertas
- **DASHBOARD WEB/**: Dashboard web que consume datos de Supabase para visualización y gestión

## Comandos para ejecutar

### Iniciar la aplicación:
```bash
sudo docker compose build
```

```bash
sudo docker-compose up -d
```

### Detener y eliminar todo:

```bash
sudo docker compose down
```

## Acceso a los servicios

- **Cola**: http://localhost:5000
- **Dashboard Web**: http://localhost:3000

## Cómo llenar la cola con un mensaje en consola:

```bash
curl -X POST http://localhost:5000/mensaje \
  -H "Content-Type: application/json" \
  -d '{
    "ts": "2025-11-01T12:10:00Z",
    "nivel_m": 0.42,
    "lluvia_mm": 1.6
  }'
```

## Funciones calculadas:

1. **BaseLevel**: Nivel base del río
2. **ΔH**: Diferencia de altura respecto al nivel inicial
3. **RoR**: Tasa de incremento del nivel (Rate of Rise) en m/hora
4. **Intensidad de lluvia**: Intensidad de lluvia en mm/hora
5. **Proyección a 30 min**: Proyección del nivel del río en 30 minutos
6. **Pendiente hidráulica**: Pendiente hidráulica del tramo
7. **Persistencia**: Número de mediciones consecutivas que superan el umbral

## Dashboard Web

El dashboard web incluye:
- **Dashboard**: Visualización de gráficos con datos hidrológicos en tiempo real
- **Alertas**: Lista de alertas generadas desde las mediciones
- **Suscripción**: Gestión de usuarios (agregar, cargar CSV, listar)
  - Formato CSV: `nombre_completo,telefono,rol,direccion_notas,es_arrendatario`
  - Campos obligatorios: `nombre_completo`, `telefono`

