FROM python:3.11-slim

WORKDIR /app

# Copiar requirements e instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY gateway.py .
COPY sensor_simulator.py .

# Exponer puerto UDP (aunque Docker no lo maneje directamente)
EXPOSE 5005/udp

# Ejecutar gateway
CMD ["python", "gateway.py"]

