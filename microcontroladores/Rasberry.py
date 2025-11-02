import socket
import time
import json
from lora import LoRa  # librería pyLoRa

UDP_HOST = "127.0.0.1"
UDP_PORT = 5005

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

lora = LoRa()  # configurar SPI y pines según tu módulo
lora.set_mode_rx()  # modo recepción

print("Gateway LoRa iniciado, reenviando a UDP localhost:5005...")

while True:
    if lora.received_packet():
        payload = lora.read_payload().decode()
        try:
            data = json.loads(payload)
            print(f"[RX-LORA] {data}")
            sock.sendto(payload.encode(), (UDP_HOST, UDP_PORT))
        except Exception as e:
            print("Error parseando JSON LoRa:", e)
    time.sleep(0.1)
