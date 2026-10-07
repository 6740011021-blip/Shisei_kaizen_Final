// =====================================================
// Smart Posture System
// ESP32 + FSR + Ultrasonic + Motor + Buzzer
//
// Database เก็บเฉพาะ BAD_POSTURE
// WiFi Setup ผ่าน Captive Portal
// =====================================================

#include <WiFi.h>
#include <WiFiManager.h>
#include <HTTPClient.h>

// =====================================================
// 1. API
// =====================================================

// *** IP เครื่องที่รัน PHP Server ***
// ESP32 ต้องมองเห็น IP นี้ได้
const char* serverUrl =
  "http://192.168.1.124/shisei_api/api.php";


// =====================================================
// 2. PIN
// =====================================================

const int FSR_PIN = 34;
const int TRIG_PIN = 25;
const int ECHO_PIN = 26;
const int MOTOR_PIN = 27;
const int BUZZER_PIN = 14;


// =====================================================
// 3. SETTINGS
// =====================================================

// FSR > 400 = มีคนนั่ง
const int FSR_THRESHOLD = 600;

// <= 5 cm = หลังตรง
const float STRAIGHT_DISTANCE = 5.0;

// > 5 ถึง 55 cm = หลังงอ
const float MAX_DISTANCE = 55.0;

// หลังงอครบ 2 วินาที
const unsigned long BAD_POSTURE_TIME = 2000;

// อ่าน Sensor ทุก 100 ms
const unsigned long SENSOR_INTERVAL = 100;

// Buzzer ปี๊บถี่
const unsigned long BEEP_ON_TIME = 100;
const unsigned long BEEP_OFF_TIME = 80;


// =====================================================
// VARIABLES
// =====================================================

bool personSitting = false;
bool countingPosture = false;
bool warningActive = false;
bool buzzerState = false;

// ส่ง Database แล้วหรือยัง
bool badPostureSent = false;

unsigned long badPostureStart = 0;
unsigned long lastSensorTime = 0;
unsigned long lastBeepTime = 0;


// =====================================================
// WIFI SETUP
// =====================================================

void setupWiFi() {

  WiFi.mode(WIFI_STA);

  WiFiManager wm;

  // รอหน้า Setup สูงสุด 3 นาที
  wm.setConfigPortalTimeout(180);

  Serial.println();
  Serial.println("================================");
  Serial.println("       WIFI AUTO SETUP");
  Serial.println("================================");

  Serial.println(">> Trying saved WiFi...");
  Serial.println(">> If connection fails:");
  Serial.println(">> Connect to: Shisei-Kaizen-Setup");
  Serial.println();

  /*
     การทำงานของ autoConnect()

     1. ถ้ามี WiFi ที่เคยบันทึกไว้
        -> ESP32 ต่อเอง

     2. ถ้าต่อไม่ได้
        -> ESP32 สร้าง WiFi
           Shisei-Kaizen-Setup

     3. ผู้ใช้ใช้มือถือเชื่อมต่อ
        -> เลือก WiFi
        -> ใส่ Password

     4. ESP32 บันทึกค่าไว้
  */

  bool connected =
    wm.autoConnect("Shisei-Kaizen-Setup");

  if (
    connected &&
    WiFi.status() == WL_CONNECTED
  ) {

    Serial.println();
    Serial.println(">> WiFi Connected!");

    Serial.print(">> SSID = ");
    Serial.println(WiFi.SSID());

    Serial.print(">> ESP32 IP = ");
    Serial.println(WiFi.localIP());

    Serial.print(">> Signal = ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");

  }

  else {

    Serial.println();
    Serial.println(">> WiFi setup timeout");
    Serial.println(">> Continue in Offline Mode");

  }

}


// =====================================================
// SEND BAD_POSTURE TO PHP
// =====================================================

void sendBadPosture(
  float distance,
  int fsr,
  int durationSec
) {

  Serial.println();
  Serial.println(
    "========== SEND PHP =========="
  );

  // -----------------------------------------
  // เช็ก WiFi
  // -----------------------------------------

  if (
    WiFi.status() != WL_CONNECTED
  ) {

    Serial.println(
      ">> ERROR: WIFI NOT CONNECTED"
    );

    Serial.println(
      "=============================="
    );

    return;
  }


  WiFiClient client;
  HTTPClient http;


  Serial.print(">> URL: ");
  Serial.println(serverUrl);


  // -----------------------------------------
  // เชื่อม PHP API
  // -----------------------------------------

  http.begin(
    client,
    serverUrl
  );

  http.setTimeout(5000);

  http.addHeader(
    "Content-Type",
    "application/json"
  );


  // -----------------------------------------
  // JSON
  // -----------------------------------------

  String jsonPayload = "{";

  jsonPayload +=
    "\"device_id\":1,";

  jsonPayload +=
    "\"event_type\":\"BAD_POSTURE\",";

  jsonPayload +=
    "\"distance_cm\":" +
    String(distance, 2) +
    ",";

  jsonPayload +=
    "\"fsr_value\":" +
    String(fsr) +
    ",";

  jsonPayload +=
    "\"duration_seconds\":" +
    String(durationSec) +
    ",";

  jsonPayload +=
    "\"note\":\"ESP32 Local Posture Guard\"";

  jsonPayload += "}";


  Serial.print(">> JSON = ");
  Serial.println(jsonPayload);


  // -----------------------------------------
  // POST
  // -----------------------------------------

  int httpCode =
    http.POST(jsonPayload);


  Serial.print(
    ">> HTTP CODE = "
  );

  Serial.println(httpCode);


  if (
    httpCode > 0
  ) {

    String response =
      http.getString();

    Serial.print(
      ">> PHP RESPONSE = "
    );

    Serial.println(response);

  }

  else {

    Serial.print(
      ">> CONNECTION ERROR = "
    );

    Serial.println(
      http.errorToString(httpCode)
    );

  }


  http.end();


  Serial.println(
    "=============================="
  );

  Serial.println();

}


// =====================================================
// READ FSR
// =====================================================

int readFSR() {

  long total = 0;

  // อ่าน 5 ครั้งแล้วเฉลี่ย
  // เพื่อลด Noise

  for (
    int i = 0;
    i < 5;
    i++
  ) {

    total +=
      analogRead(FSR_PIN);

    delay(2);

  }

  return total / 5;

}


// =====================================================
// READ ULTRASONIC
// =====================================================

float readDistance() {

  digitalWrite(
    TRIG_PIN,
    LOW
  );

  delayMicroseconds(2);


  digitalWrite(
    TRIG_PIN,
    HIGH
  );

  delayMicroseconds(10);


  digitalWrite(
    TRIG_PIN,
    LOW
  );


  unsigned long duration =
    pulseIn(
      ECHO_PIN,
      HIGH,
      30000
    );


  if (
    duration == 0
  ) {

    return -1;

  }


  float distance =
    duration *
    0.0343 /
    2.0;


  return distance;

}


// =====================================================
// START BEEP
// =====================================================

void startBeep() {

  tone(
    BUZZER_PIN,
    1800
  );

  delay(180);

  noTone(
    BUZZER_PIN
  );

  Serial.println(
    ">> SYSTEM START BEEP"
  );

}


// =====================================================
// START WARNING
// =====================================================

void startWarning() {

  if (
    warningActive
  ) {

    return;

  }


  warningActive = true;

  buzzerState = true;

  lastBeepTime =
    millis();


  // Motor สั่น
  digitalWrite(
    MOTOR_PIN,
    HIGH
  );


  // เริ่ม Buzzer
  tone(
    BUZZER_PIN,
    2000
  );


  Serial.println();

  Serial.println(
    "!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  );

  Serial.println(
    "!!! BAD POSTURE WARNING !!!"
  );

  Serial.println(
    "!!! FAST BEEP + MOTOR !!!"
  );

  Serial.println(
    "!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  );

}


// =====================================================
// FAST BEEP
// =====================================================

void updateWarning() {

  if (
    !warningActive
  ) {

    return;

  }


  unsigned long now =
    millis();


  digitalWrite(
    MOTOR_PIN,
    HIGH
  );


  // -----------------------------------------
  // Buzzer กำลังดัง
  // -----------------------------------------

  if (
    buzzerState
  ) {

    if (
      now -
      lastBeepTime >=
      BEEP_ON_TIME
    ) {

      buzzerState = false;

      lastBeepTime = now;

      noTone(
        BUZZER_PIN
      );

    }

  }


  // -----------------------------------------
  // Buzzer กำลังเงียบ
  // -----------------------------------------

  else {

    if (
      now -
      lastBeepTime >=
      BEEP_OFF_TIME
    ) {

      buzzerState = true;

      lastBeepTime = now;

      tone(
        BUZZER_PIN,
        2000
      );

    }

  }

}


// =====================================================
// STOP WARNING
// =====================================================

void stopWarning() {

  warningActive = false;

  buzzerState = false;

  noTone(
    BUZZER_PIN
  );

  digitalWrite(
    MOTOR_PIN,
    LOW
  );

}


// =====================================================
// RESET BAD POSTURE
// =====================================================

void resetBadPosture() {

  countingPosture = false;

  badPostureStart = 0;


  // พอกลับมาหลังตรง
  // สามารถบันทึก BAD ครั้งต่อไปได้

  badPostureSent = false;

}


// =====================================================
// SETUP
// =====================================================

void setup() {

  Serial.begin(115200);

  delay(500);


  analogReadResolution(12);


  pinMode(
    FSR_PIN,
    INPUT
  );

  pinMode(
    TRIG_PIN,
    OUTPUT
  );

  pinMode(
    ECHO_PIN,
    INPUT
  );

  pinMode(
    MOTOR_PIN,
    OUTPUT
  );

  pinMode(
    BUZZER_PIN,
    OUTPUT
  );


  digitalWrite(
    TRIG_PIN,
    LOW
  );

  digitalWrite(
    MOTOR_PIN,
    LOW
  );

  noTone(
    BUZZER_PIN
  );


  // -----------------------------------------
  // WiFi
  // -----------------------------------------

  setupWiFi();


  // -----------------------------------------
  // Ready
  // -----------------------------------------

  Serial.println();

  Serial.println(
    "================================"
  );

  Serial.println(
    "     SHISEI KAIZEN READY"
  );

  Serial.println(
    "================================"
  );

  Serial.println(
    "FSR > 400 = SITTING"
  );

  Serial.println(
    "<= 5cm = POSTURE OK"
  );

  Serial.println(
    ">5 - 55cm = BAD POSTURE"
  );

  Serial.println(
    "BAD 2 sec = SEND PHP + ALERT"
  );

  Serial.println(
    "================================"
  );

}


// =====================================================
// LOOP
// =====================================================

void loop() {

  // Buzzer ปี๊บถี่แบบไม่ Block
  updateWarning();


  // -----------------------------------------
  // Sensor Interval
  // -----------------------------------------

  if (
    millis() -
    lastSensorTime <
    SENSOR_INTERVAL
  ) {

    return;

  }


  lastSensorTime =
    millis();


  // ===================================================
  // อ่าน Sensor
  // ===================================================

  int fsrValue =
    readFSR();


  float distance =
    readDistance();


  // ===================================================
  // แสดงค่า
  // ===================================================

  Serial.print(
    "FSR = "
  );

  Serial.print(
    fsrValue
  );

  Serial.print(
    " | Ultrasonic = "
  );


  if (
    distance < 0
  ) {

    Serial.print(
      "NO ECHO"
    );

  }

  else {

    Serial.print(
      distance,
      2
    );

    Serial.print(
      " cm"
    );

  }


  // ===================================================
  // ตรวจว่ามีคนนั่งหรือไม่
  // ===================================================

  bool sitting =
    fsrValue >
    FSR_THRESHOLD;


  // ===================================================
  // ไม่มีคนนั่ง
  // ===================================================

  if (
    !sitting
  ) {

    Serial.println(
      " | NO SITTING"
    );


    if (
      personSitting
    ) {

      Serial.println(
        ">> USER LEFT"
      );

    }


    personSitting = false;


    stopWarning();

    resetBadPosture();


    // ไม่ส่ง Database
    return;

  }


  // ===================================================
  // เพิ่งนั่ง
  // ===================================================

  if (
    !personSitting
  ) {

    personSitting = true;


    Serial.println(
      " | SITTING DETECTED"
    );


    startBeep();

    resetBadPosture();


    // ไม่ส่ง Database
    return;

  }


  // ===================================================
  // ULTRASONIC ไม่มี Echo
  // ===================================================

  if (
    distance < 0
  ) {

    Serial.println(
      " | SENSOR NO ECHO"
    );


    stopWarning();

    resetBadPosture();


    // ไม่ส่ง Database
    return;

  }


  // ===================================================
  // POSTURE OK
  // <= 5 cm
  // ===================================================

  if (
    distance <=
    STRAIGHT_DISTANCE
  ) {

    Serial.println(
      " | POSTURE OK"
    );


    stopWarning();

    resetBadPosture();


    // ไม่ส่ง Database
    return;

  }


  // ===================================================
  // BAD POSTURE
  // > 5 ถึง <= 55 cm
  // ===================================================

  if (
    distance >
    STRAIGHT_DISTANCE
    &&
    distance <=
    MAX_DISTANCE
  ) {


    // -----------------------------------------
    // เริ่มจับเวลา
    // -----------------------------------------

    if (
      !countingPosture
    ) {

      countingPosture = true;

      badPostureStart =
        millis();

    }


    unsigned long elapsed =
      millis() -
      badPostureStart;


    Serial.print(
      " | BAD POSTURE | Time = "
    );

    Serial.print(
      elapsed / 1000.0,
      1
    );

    Serial.println(
      " sec"
    );


    // =================================================
    // หลังงอครบ 2 วินาที
    // =================================================

    if (
      elapsed >=
      BAD_POSTURE_TIME
    ) {


      // -----------------------------------------
      // เปิดเสียง + Motor
      // -----------------------------------------

      if (
        !warningActive
      ) {

        startWarning();

      }


      // -----------------------------------------
      // ส่ง Database แค่ครั้งเดียว
      // ต่อการหลังงอหนึ่งรอบ
      // -----------------------------------------

      if (
        !badPostureSent
      ) {

        badPostureSent = true;


        Serial.println();

        Serial.println(
          ">> BAD_POSTURE CONFIRMED"
        );

        Serial.println(
          ">> SEND TO DATABASE"
        );


        sendBadPosture(
          distance,
          fsrValue,
          elapsed / 1000
        );

      }

    }


    return;

  }


  // ===================================================
  // ระยะ > 55 cm
  // ===================================================

  if (
    distance >
    MAX_DISTANCE
  ) {

    Serial.println(
      " | >55cm | FSR STILL SITTING"
    );


    stopWarning();

    resetBadPosture();


    // ไม่ส่ง Database
    return;

  }

}