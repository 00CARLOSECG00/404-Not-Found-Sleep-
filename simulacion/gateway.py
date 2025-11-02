# gateway.py
import socket, json, time, threading, collections, os, requests
from datetime import datetime

# ---------- CONFIG ----------
UDP_HOST = "0.0.0.0"
UDP_PORT = 5005
COLA_URL = os.getenv("COLA_URL", "http://cola:5000")
MODE_SMS = os.getenv("MODE_SMS", "SIMULATE")  # options: SIMULATE, TWILIO, GSM
TWILIO_CONFIG = {
    "account_sid": "TWILIO_SID",
    "auth_token": "TWILIO_TOKEN",
    "from_number": "+1XXXXXXXXXX"
}
GSM_SERIAL_PORT = "/dev/ttyS0"
LEADERS = ["+573001234567"]

# detection thresholds
TH_PRECAUCION = 0.45  # ahora en metros
TH_ALERTA = 0.55      # ahora en metros
SLOPE_THRESH = 0.007  # m/s (aprox 0.7 cm/s)
BUFFER_LEN = 12

# ---------- Buffers ----------
buffers = {}  # node_id -> deque of (ts, level)
lock = threading.Lock()

# ---------- SMS functions ----------
def send_sms_simulate(number, message):
    print("[SMS-SIM] Enviando a", number, "->", message)
    with open("sms_sent.log","a") as f:
        f.write(f"{time.ctime()} | {number} | {message}\n")
    return True

def send_sms_twilio(number, message):
    from twilio.rest import Client
    client = Client(TWILIO_CONFIG["account_sid"], TWILIO_CONFIG["auth_token"])
    msg = client.messages.create(body=message, from_=TWILIO_CONFIG["from_number"], to=number)
    print("[SMS-TWILIO] SID:", msg.sid)
    return True

def send_sms_gsm(number, message):
    import serial
    ser = serial.Serial(GSM_SERIAL_PORT, baudrate=115200, timeout=2)
    def at(cmd, wait=0.5):
        ser.write((cmd + "\r\n").encode()); time.sleep(wait); return ser.read_all().decode(errors="ignore")
    at("AT")
    at("AT+CMGF=1")
    at(f'AT+CMGS="{number}"')
    ser.write((message + "\x1A").encode())
    time.sleep(10)
    resp = ser.read_all().decode(errors="ignore")
    print("[SMS-GSM] resp:", resp)
    ser.close()
    return "OK" in resp or ">" in resp

def send_sms(number, message):
    if MODE_SMS == "SIMULATE":
        return send_sms_simulate(number, message)
    elif MODE_SMS == "TWILIO":
        return send_sms_twilio(number, message)
    elif MODE_SMS == "GSM":
        return send_sms_gsm(number, message)
    else:
        return send_sms_simulate(number, message)

# ---------- UI / state ----------
def update_ui_state(state):
    with open("state.json","w") as f:
        json.dump({"state": state, "time": time.ctime()}, f)
    with open("last_sms.json","w") as f:
        json.dump({"msg": f"Estado actual: {state}", "time": time.ctime()}, f)

# ---------- Detection logic ----------
def analyze_node(node_id):
    with lock:
        buf = buffers.get(node_id, collections.deque(maxlen=BUFFER_LEN))
        if len(buf) < 2:
            return "NORMAL"
        levels = [v for _,v in buf]
        times = [t for t,_ in buf]
    ma = sum(levels[-5:]) / min(5, len(levels))
    slope = (levels[-1] - levels[-2]) / max(1, times[-1] - times[-2])
    if ma >= TH_ALERTA or slope >= SLOPE_THRESH:
        return "ALERTA"
    elif ma >= TH_PRECAUCION:
        return "PRECAUCION"
    else:
        return "NORMAL"

def enviar_a_cola(ts_str, nivel_m, lluvia_mm):
    """Envía los datos a la cola en el formato esperado"""
    try:
        payload = {
            "ts": ts_str,
            "nivel_m": nivel_m,
            "lluvia_mm": lluvia_mm
        }
        response = requests.post(f"{COLA_URL}/mensaje", json=payload, timeout=2)
        if response.status_code in [200, 201]:
            print(f"[COLA] ✓ Datos enviados: {nivel_m}m, {lluvia_mm}mm")
            return True
        else:
            print(f"[COLA] ✗ Error {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"[COLA] ✗ Error enviando a cola: {e}")
        return False

def maybe_alert(node_id):
    status = analyze_node(node_id)
    print(f"[ANALYZER] Nodo {node_id} -> {status}")
    update_ui_state(status)
    if status == "ALERTA":
        message = f"ALERTA URGENTE - Nodo {node_id} detecta crecida. Diríjase ya a zonas altas."
        for num in LEADERS:
            send_sms(num, message)
        print("[ACTUATOR] Activando sirena y semáforo ROJO (simulado).")
        with open("alerts.log","a") as f:
            f.write(f"{time.ctime()} | {node_id} | ALERTA\n")

# ---------- UDP receiver ----------
def receiver():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((UDP_HOST, UDP_PORT))
    print(f"[GATEWAY] Escuchando UDP en {UDP_HOST}:{UDP_PORT}")
    while True:
        data, addr = sock.recvfrom(4096)
        try:
            j = json.loads(data.decode())
            node = j.get("node_id", "UNKNOWN")
            ts_str = j.get("ts", None)
            nivel_m = float(j.get("nivel_m", 0))
            lluvia_mm = float(j.get("lluvia_mm", 0))
            
            # Asegurar que ts_str esté en formato ISO
            if not ts_str:
                ts_str = datetime.utcnow().isoformat() + "Z"
            
            # convertir ts a timestamp Unix para análisis de slope
            try:
                ts = datetime.fromisoformat(ts_str.replace('Z', '+00:00')).timestamp()
            except:
                ts = time.time()
            
            with lock:
                buf = buffers.setdefault(node, collections.deque(maxlen=BUFFER_LEN))
                buf.append((ts, nivel_m))
            
            print(f"[RX] {node} @ {ts_str} -> {nivel_m} m, lluvia: {lluvia_mm} mm")
            
            # Enviar datos a la cola
            threading.Thread(target=enviar_a_cola, args=(ts_str, nivel_m, lluvia_mm)).start()
            
            # Analizar para alertas
            threading.Thread(target=maybe_alert, args=(node,)).start()
        except Exception as e:
            print("Error parseando paquete:", e)

if __name__ == "__main__":
    print("Gateway iniciado. MODE_SMS =", MODE_SMS)
    receiver()
