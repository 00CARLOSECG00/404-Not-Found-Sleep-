# sensor_simulator.py
import time, random, socket, json, os
from datetime import datetime, timezone

HOST = os.getenv('HOST', '127.0.0.1')
PORT = int(os.getenv('PORT', '5005'))

def make_payload(node_id, level_cm, lluvia_mm):
    return json.dumps({
        "node_id": node_id,
        "ts": datetime.now(timezone.utc).isoformat(),
        "nivel_m": round(level_cm/100, 2),  # convertir cm a m
        "lluvia_mm": round(lluvia_mm, 1)
    })

def run_simulation():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    timeline = []
    # normal 30 samples (30 ±3 cm)
    for i in range(30):
        timeline.append(30 + random.uniform(-3,3))
    # subida 30 samples (35 -> 105 cm)
    for i in range(30):
        timeline.append(35 + i*(70/30) + random.uniform(-2,2))
    # peak 10 samples (100 ±2 cm)
    for i in range(10):
        timeline.append(100 + random.uniform(-2,2))
    # caída 20 samples (100 -> 40 cm)
    for i in range(20):
        timeline.append(100 - i*(60/20) + random.uniform(-2,2))

    nodes = ["N01","N02","N03","N04"]  # agregado nodo N04
    for level in timeline:
        lluvia = random.uniform(0, 5)  # lluvia simulada en mm
        for n in nodes:
            payload = make_payload(n, level + random.uniform(-1,1), lluvia)
            sock.sendto(payload.encode(), (HOST, PORT))
            time.sleep(2)  # esperar 2 segundos entre cada envío de mensaje

if __name__ == "__main__":
    print(f"Iniciando simulador (envía UDP a {HOST}:{PORT})...")
    run_simulation()
