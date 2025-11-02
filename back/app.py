"""
Aplicación backend ETL para procesar datos de medición hidrológica
"""
import os
import time
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from supabase import create_client, Client
import json
from dotenv import load_dotenv

load_dotenv()

# Configuración de datos fijos del río
DATOS_RIO = {
    "altura_inicial_m": 2595.4,  # cota aguas arriba
    "altura_final_m": 2589.6,    # cota aguas abajo
    "largo_rio_m": 3200          # longitud del tramo modelado
}

# URLs de servicios
COLA_URL = os.getenv('COLA_URL', 'http://cola:5000')
WEBHOOK_ALERTA_URL = os.getenv('WEBHOOK_ALERTA_URL', 'https://testsh.app.n8n.cloud/webhook-test/webhook-alerta-esmeralda')

# Configuración Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')
TABLE_NAME = 'mediciones_hidrologicas'

class HidrologiaProcessor:
    """Procesador de datos hidrológicos"""
    
    def __init__(self, supabase: Optional[Client] = None):
        self.supabase = supabase
        self.mediciones_previas: List[Dict] = []
    
    def base_level(self, nivel_m: float) -> float:
        """
        Nivel base del río
        """
        return nivel_m
    
    def delta_h(self, nivel_m: float) -> float:
        """
        Diferencia de altura (ΔH) respecto al nivel base
        Calculado como la diferencia entre el nivel actual y el nivel inicial del tramo
        """
        return nivel_m - DATOS_RIO["altura_inicial_m"]
    
    def rate_of_rise(self, medicion_actual: Dict, medicion_anterior: Optional[Dict]) -> Optional[float]:
        """
        RoR: Tasa de incremento del nivel (Rate of Rise)
        Calcula cuánto sube el nivel por hora
        """
        if not medicion_anterior:
            return None
        
        try:
            ts_actual = datetime.fromisoformat(medicion_actual['ts'].replace('Z', '+00:00'))
            ts_anterior = datetime.fromisoformat(medicion_anterior['ts'].replace('Z', '+00:00'))
            
            delta_tiempo = (ts_actual - ts_anterior).total_seconds() / 3600  # horas
            
            if delta_tiempo <= 0:
                return None
            
            delta_nivel = medicion_actual['nivel_m'] - medicion_anterior['nivel_m']
            ror = delta_nivel / delta_tiempo  # metros por hora
            
            return ror
        except Exception as e:
            print(f"Error calculando RoR: {e}")
            return None
    
    def intensidad_lluvia(self, medicion_actual: Dict, medicion_anterior: Optional[Dict]) -> Optional[float]:
        """
        Intensidad de lluvia (mm/hora)
        """
        if not medicion_anterior:
            return None
        
        try:
            ts_actual = datetime.fromisoformat(medicion_actual['ts'].replace('Z', '+00:00'))
            ts_anterior = datetime.fromisoformat(medicion_anterior['ts'].replace('Z', '+00:00'))
            
            delta_tiempo = (ts_actual - ts_anterior).total_seconds() / 3600  # horas
            
            if delta_tiempo <= 0:
                return None
            
            delta_lluvia = medicion_actual['lluvia_mm']
            intensidad = delta_lluvia / delta_tiempo  # mm/hora
            
            return intensidad
        except Exception as e:
            print(f"Error calculando intensidad: {e}")
            return None
    
    def proyeccion_30min(self, nivel_m: float, ror: Optional[float]) -> Optional[float]:
        """
        Proyección del nivel a 30 minutos
        """
        if ror is None:
            return None
        
        # Proyección: nivel actual + (RoR * 0.5 horas)
        nivel_proyectado = nivel_m + (ror * 0.5)
        
        return nivel_proyectado
    
    def pendiente_hidraulica(self, nivel_m: float) -> float:
        """
        Pendiente hidráulica del tramo
        S = (H_inicial - H_final) / L
        donde H_inicial es la altura del agua actual y H_final es la cota aguas abajo
        """
        altura_agua_arriba = DATOS_RIO["altura_inicial_m"] + nivel_m
        altura_agua_abajo = DATOS_RIO["altura_final_m"]
        
        delta_altura = altura_agua_arriba - altura_agua_abajo
        pendiente = delta_altura / DATOS_RIO["largo_rio_m"]
        
        return pendiente
    
    def persistencia(self, medicion_actual: Dict, umbral_alerta: float = 0.5) -> int:
        """
        Persistencia: número de mediciones consecutivas que superan un umbral
        """
        if medicion_actual['nivel_m'] <= umbral_alerta:
            return 0
        
        persistencia = 1
        for medicion in reversed(self.mediciones_previas[-10:]):  # Últimas 10 mediciones
            if medicion.get('nivel_m', 0) > umbral_alerta:
                persistencia += 1
            else:
                break
        
        return persistencia
    
    def procesar_medicion(self, medicion: Dict) -> Dict:
        """
        Procesa una medición y calcula todos los parámetros
        """
        nivel_m = medicion['nivel_m']
        
        # Buscar medición anterior
        medicion_anterior = None
        if self.mediciones_previas:
            medicion_anterior = self.mediciones_previas[-1]
        
        # Calcular todos los parámetros
        base_level = self.base_level(nivel_m)
        delta_h = self.delta_h(nivel_m)
        ror = self.rate_of_rise(medicion, medicion_anterior)
        intensidad = self.intensidad_lluvia(medicion, medicion_anterior)
        proyeccion_30min = self.proyeccion_30min(nivel_m, ror)
        pendiente = self.pendiente_hidraulica(nivel_m)
        persistencia = self.persistencia(medicion)
        
        resultado = {
            "ts": medicion['ts'],
            "nivel_m": nivel_m,
            "lluvia_mm": medicion['lluvia_mm'],
            "base_level": base_level,
            "delta_h": delta_h,
            "ror": ror,
            "intensidad_lluvia": intensidad,
            "proyeccion_30min": proyeccion_30min,
            "pendiente_hidraulica": pendiente,
            "persistencia": persistencia,
            "datos_rio": DATOS_RIO,
            "procesado_en": datetime.utcnow().isoformat() + "Z"
        }
        
        # Guardar medición anterior para próximos cálculos
        self.mediciones_previas.append(medicion)
        if len(self.mediciones_previas) > 100:  # Limitar historial
            self.mediciones_previas = self.mediciones_previas[-100:]
        
        return resultado
    
    def evaluar_alerta(self, resultado: Dict) -> bool:
        """
        Evalúa si hay condiciones de alerta
        Alertas si:
        - Nivel muy alto (> 0.5m)
        - Proyección a 30min indica nivel alto
        - RoR muy alto (> 0.1 m/hora)
        - Persistencia alta (> 3)
        """
        nivel = resultado['nivel_m']
        proyeccion = resultado.get('proyeccion_30min')
        ror = resultado.get('ror')
        persistencia = resultado.get('persistencia', 0)
        
        alerta = False
        
        # Nivel crítico
        if nivel > 0.5:
            alerta = True
        
        # Proyección crítica
        if proyeccion and proyeccion > 0.6:
            alerta = True
        
        # RoR muy alto
        if ror and ror > 0.1:
            alerta = True
        
        # Persistencia alta
        if persistencia >= 3:
            alerta = True
        
        return alerta
    
    def enviar_alerta(self, resultado: Dict) -> bool:
        """
        Envía alerta via webhook n8n
        """
        try:
            # Determinar color según severidad
            nivel = resultado["nivel_m"]
            if nivel > 0.7:
                color = "ROJA"
            elif nivel > 0.5:
                color = "AMARILLA"
            else:
                color = "VERDE"

            payload = {"nivel_alerta": color}

            response = requests.post(
                WEBHOOK_ALERTA_URL,
                json=payload,
                timeout=10
            )

            if response.status_code in [200, 201, 202]:
                print(f"✅ Alerta enviada exitosamente: {payload}")
                return True
            else:
                print(f"⚠️ Error enviando alerta: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            print(f"❌ Error enviando alerta: {e}")
            return False

        """
        Envía alerta via webhook de Twilio
        """
        try:
            payload = {
                "alerta": "posible_inundacion",
                "timestamp": resultado['ts'],
                "nivel_m": resultado['nivel_m'],
                "proyeccion_30min": resultado.get('proyeccion_30min'),
                "ror": resultado.get('ror'),
                "persistencia": resultado.get('persistencia'),
                "mensaje": f"ALERTA: Nivel del río en {resultado['nivel_m']:.2f}m. Proyección a 30min: {resultado.get('proyeccion_30min', 'N/A')}"
            }
            
            response = requests.post(
                WEBHOOK_ALERTA_URL,
                json=payload,
                timeout=10
            )
            
            if response.status_code in [200, 201, 202]:
                print(f"Alerta enviada exitosamente: {payload}")
                return True
            else:
                print(f"Error enviando alerta: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"Error enviando alerta: {e}")
            return False
    
    def guardar_supabase(self, resultado: Dict) -> bool:
        """
        Guarda el resultado procesado en Supabase
        """
        if not self.supabase:
            print("Supabase no configurado")
            return False
        
        try:
            data = {
                "ts": resultado['ts'],
                "nivel_m": resultado['nivel_m'],
                "lluvia_mm": resultado['lluvia_mm'],
                "base_level": resultado['base_level'],
                "delta_h": resultado['delta_h'],
                "ror": resultado['ror'],
                "intensidad_lluvia": resultado['intensidad_lluvia'],
                "proyeccion_30min": resultado['proyeccion_30min'],
                "pendiente_hidraulica": resultado['pendiente_hidraulica'],
                "persistencia": resultado['persistencia'],
                "procesado_en": resultado['procesado_en']
            }
            
            response = self.supabase.table(TABLE_NAME).insert(data).execute()
            
            print(f"Dato guardado en Supabase: {resultado['ts']}")
            return True
            
        except Exception as e:
            print(f"Error guardando en Supabase: {e}")
            return False


def consumir_cola():
    """Consume mensajes de la cola"""
    try:
        response = requests.post(f"{COLA_URL}/consumir", timeout=5)
        
        if response.status_code == 404:
            return None  # No hay mensajes
        
        if response.status_code == 200:
            data = response.json()
            return data.get('mensaje')
        
        return None
        
    except Exception as e:
        print(f"Error consumiendo cola: {e}")
        return None


def main():
    """Función principal del ETL"""
    print("Iniciando ETL de datos hidrológicos...")
    
    # Inicializar Supabase si está configurado
    supabase = None
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            print("Supabase conectado")
        except Exception as e:
            print(f"Error conectando Supabase: {e}")
    
    # Inicializar procesador
    processor = HidrologiaProcessor(supabase)
    
    # Loop principal
    print("Iniciando consumo de cola...")
    while True:
        try:
            # Consumir mensaje de la cola
            medicion = consumir_cola()
            
            if medicion:
                print(f"Procesando medición: {medicion.get('ts')}")
                
                # Procesar medición
                resultado = processor.procesar_medicion(medicion)
                
                # Guardar en Supabase
                processor.guardar_supabase(resultado)
                
                # Evaluar alerta
                if processor.evaluar_alerta(resultado):
                    print("¡ALERTA DETECTADA!")
                    processor.enviar_alerta(resultado)
                
                print(f"Medición procesada: {resultado['ts']}")
            else:
                # No hay mensajes, esperar un poco
                time.sleep(5)
                
        except KeyboardInterrupt:
            print("\nDeteniendo ETL...")
            break
        except Exception as e:
            print(f"Error en loop principal: {e}")
            time.sleep(5)


if __name__ == '__main__':
    main()

