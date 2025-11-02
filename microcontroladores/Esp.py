#include <SPI.h>
#include <LoRa.h>
#include <NewPing.h>

#define TRIGGER_PIN 5
#define ECHO_PIN 18
#define MAX_DISTANCE 400 // cm

#define LORA_SS 18
#define LORA_RST 14
#define LORA_DIO0 26
#define BAND 915E6 // ajustar según región

NewPing sonar(TRIGGER_PIN, ECHO_PIN, MAX_DISTANCE);

String node_id = "N01";

void setup() {
  Serial.begin(115200);
  while (!Serial);

  // Iniciar LoRa
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(BAND)) {
    Serial.println("Error iniciando LoRa");
    while (1);
  }
  Serial.println("Nodo LoRa listo");
}

void loop() {
  float distance_cm = sonar.ping_cm(); // medida en cm
  if (distance_cm == 0) distance_cm = 0; // si no detecta, dejar 0

  float nivel_m = distance_cm / 100.0; // convertir a metros
  float lluvia_mm = random(0, 50) / 10.0; // simulación de lluvia 0-5mm

  // generar JSON
  String payload = "{";
  payload += "\"node_id\":\"" + node_id + "\",";
  payload += "\"ts\":\"" + String((unsigned long)time(nullptr)) + "\",";
  payload += "\"nivel_m\":" + String(nivel_m,2) + ",";
  payload += "\"lluvia_mm\":" + String(lluvia_mm,1);
  payload += "}";

  Serial.println("Enviando: " + payload);
  LoRa.beginPacket();
  LoRa.print(payload);
  LoRa.endPacket();

  delay(1000); // cada 1s
}
