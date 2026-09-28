/*
  ========================================================================
  SmartMed — Smart Medicine Reminder Box
  Microcontroller Firmware (Arduino / ESP32)
  ========================================================================
  Monitors 3 pill compartment slots via IR sensors.
  Sounds reminder buzzers at scheduled times.
  Detects pill removal and transmits status to the SmartMed Dashboard.
*/

// Pin Assignments
const int IR_SLOT_1_PIN = 2;
const int IR_SLOT_2_PIN = 3;
const int IR_SLOT_3_PIN = 4;

const int LED_SLOT_1_PIN = 8;
const int LED_SLOT_2_PIN = 9;
const int LED_SLOT_3_PIN = 10;

const int BUZZER_PIN = 6;

// Slot states (HIGH = pill present, LOW = pill removed / taken)
int lastSlot1State = HIGH;
int lastSlot2State = HIGH;
int lastSlot3State = HIGH;

void setup() {
  Serial.begin(9600);
  while (!Serial) { ; } // Wait for serial port

  pinMode(IR_SLOT_1_PIN, INPUT_PULLUP);
  pinMode(IR_SLOT_2_PIN, INPUT_PULLUP);
  pinMode(IR_SLOT_3_PIN, INPUT_PULLUP);

  pinMode(LED_SLOT_1_PIN, OUTPUT);
  pinMode(LED_SLOT_2_PIN, OUTPUT);
  pinMode(LED_SLOT_3_PIN, OUTPUT);

  pinMode(BUZZER_PIN, OUTPUT);

  // Startup chime
  tone(BUZZER_PIN, 1000, 150);
  delay(200);
  tone(BUZZER_PIN, 1500, 200);

  Serial.println("{\"device\":\"SmartMed-Box-01\",\"status\":\"ready\"}");
}

void loop() {
  int currentSlot1 = digitalRead(IR_SLOT_1_PIN);
  int currentSlot2 = digitalRead(IR_SLOT_2_PIN);
  int currentSlot3 = digitalRead(IR_SLOT_3_PIN);

  // Slot 1 Transition: Pill Removed (HIGH -> LOW)
  if (lastSlot1State == HIGH && currentSlot1 == LOW) {
    onMedicineTaken(1);
    digitalWrite(LED_SLOT_1_PIN, LOW);
  }
  // Slot 2 Transition: Pill Removed
  if (lastSlot2State == HIGH && currentSlot2 == LOW) {
    onMedicineTaken(2);
    digitalWrite(LED_SLOT_2_PIN, LOW);
  }
  // Slot 3 Transition: Pill Removed
  if (lastSlot3State == HIGH && currentSlot3 == LOW) {
    onMedicineTaken(3);
    digitalWrite(LED_SLOT_3_PIN, LOW);
  }

  lastSlot1State = currentSlot1;
  lastSlot2State = currentSlot2;
  lastSlot3State = currentSlot3;

  delay(100);
}

void onMedicineTaken(int slotNumber) {
  // Confirmation sound
  tone(BUZZER_PIN, 1200, 100);
  delay(120);
  tone(BUZZER_PIN, 1800, 150);

  // Send formatted JSON packet over Serial
  Serial.print("{\"medicineId\":");
  Serial.print(slotNumber);
  Serial.print(",\"slot\":");
  Serial.print(slotNumber);
  Serial.print(",\"status\":\"taken\",\"source\":\"hardware_ir\"}\n");
}
