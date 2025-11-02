FROM python:3.11-slim

# Crear directorio de trabajo
WORKDIR /app

# Copiar e instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY app.py .

# Evita buffering en la salida de Python (fundamental para ver logs en Docker)
ENV PYTHONUNBUFFERED=1

# Ejecuta el ETL en modo sin buffer (-u)
CMD ["python", "-u", "app.py"]
