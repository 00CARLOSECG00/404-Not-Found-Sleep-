"""
Aplicación de cola simple para recibir datos de medición
"""
from flask import Flask, request, jsonify
import json
from datetime import datetime
import os

app = Flask(__name__)

# Almacenamiento simple en memoria (en producción usar Redis o RabbitMQ)
cola_datos = []

@app.route('/health', methods=['GET'])
def health():
    """Endpoint de salud"""
    return jsonify({"status": "ok"}), 200

@app.route('/mensaje', methods=['POST'])
def recibir_mensaje():
    """Recibe un mensaje y lo agrega a la cola"""
    try:
        data = request.get_json()
        
        # Validar campos requeridos
        campos_requeridos = ['ts', 'nivel_m', 'lluvia_mm']
        for campo in campos_requeridos:
            if campo not in data:
                return jsonify({"error": f"Campo requerido faltante: {campo}"}), 400
        
        # Validar tipos
        try:
            datetime.fromisoformat(data['ts'].replace('Z', '+00:00'))
            float(data['nivel_m'])
            float(data['lluvia_mm'])
        except (ValueError, TypeError) as e:
            return jsonify({"error": f"Error de validación: {str(e)}"}), 400
        
        # Agregar timestamp de recepción
        mensaje = {
            **data,
            "recibido_en": datetime.utcnow().isoformat() + "Z"
        }
        
        cola_datos.append(mensaje)
        
        return jsonify({
            "mensaje": "Dato recibido correctamente",
            "id": len(cola_datos) - 1,
            "total_en_cola": len(cola_datos)
        }), 201
        
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500

@app.route('/mensajes', methods=['GET'])
def obtener_mensajes():
    """Obtiene todos los mensajes en la cola (para debug)"""
    return jsonify({
        "total": len(cola_datos),
        "mensajes": cola_datos
    }), 200

@app.route('/consumir', methods=['POST'])
def consumir_mensaje():
    """Consume el siguiente mensaje de la cola (FIFO)"""
    if not cola_datos:
        return jsonify({"mensaje": "No hay mensajes en la cola"}), 404
    
    mensaje = cola_datos.pop(0)
    return jsonify({
        "mensaje": mensaje,
        "restantes": len(cola_datos)
    }), 200

@app.route('/limpiar', methods=['POST'])
def limpiar_cola():
    """Limpia todos los mensajes de la cola (para testing)"""
    global cola_datos
    total = len(cola_datos)
    cola_datos = []
    return jsonify({
        "mensaje": f"Cola limpiada. Se eliminaron {total} mensajes"
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

