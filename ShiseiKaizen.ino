// =====================================================
// Smart Posture System
// ESP32 + FSR + Ultrasonic + Motor + Buzzer
//
// เก็บ Database เฉพาะ BAD_POSTURE
// =====================================================

#include <WiFi.h>
#include <HTTPClient.h>


// =====================================================
// 1. WiFi + API
// =====================================================

const char* ssid =
  "Mxw💤";

const char* password =
  "Mew13579";

const char* serverUrl =
  "http://172.20.10.2/shisei_api/api.php";


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

// FSR > 100 = มีคนนั่ง
const int FSR_THRESHOLD = 100;


// <= 5cm = หลังตรง
const float STRAIGHT_DISTANCE = 5.0;


// >5 ถึง 55cm = หลังงอ
const float MAX_DISTANCE = 55.0;


// หลังงอ 2 วิ
const unsigned long BAD_POSTURE_TIME =
  2000;


// อ่าน Sensor ทุก 100ms
const unsigned long SENSOR_INTERVAL =
  100;


// ปี๊บถี่
const unsigned long BEEP_ON_TIME =
  100;

const unsigned long BEEP_OFF_TIME =
  80;


// =====================================================
// VARIABLES
// =====================================================

bool personSitting = false;

bool countingPosture = false;

bool warningActive = false;

bool buzzerState = false;


// ส่ง DB แล้วหรือยัง
bool badPostureSent = false;


unsigned long badPostureStart = 0;

unsigned long lastSensorTime = 0;

unsigned long lastBeepTime = 0;


// =====================================================
// WIFI
// =====================================================

void setupWiFi() {

  WiFi.mode(WIFI_STA);

  WiFi.begin(
    ssid,
    password
  );


  Serial.print(
    "Connecting to WiFi"
  );


  int retry = 0;


  while (
    WiFi.status() != WL_CONNECTED &&
    retry < 20
  ) {

    delay(500);

    Serial.print(".");

    retry++;
  }


  if (
    WiFi.status() ==
    WL_CONNECTED
  ) {

    Serial.println();

    Serial.println(
      ">> WiFi Connected!"
    );


    Serial.print(
      ">> ESP32 IP = "
    );

    Serial.println(
      WiFi.localIP()
    );

  } else {

    Serial.println();

    Serial.println(
      ">> WiFi Failed"
    );

    Serial.println(
      ">> Offline mode"
    );
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


  if (
    WiFi.status() !=
    WL_CONNECTED
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


  Serial.print(
    ">> URL: "
  );

  Serial.println(
    serverUrl
  );


  http.begin(
    client,
    serverUrl
  );


  http.setTimeout(
    5000
  );


  http.addHeader(
    "Content-Type",
    "application/json"
  );


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


  Serial.print(
    ">> JSON = "
  );

  Serial.println(
    jsonPayload
  );


  int httpCode =
    http.POST(
      jsonPayload
    );


  Serial.print(
    ">> HTTP CODE = "
  );

  Serial.println(
    httpCode
  );


  if (httpCode > 0) {

    String response =
      http.getString();


    Serial.print(
      ">> PHP RESPONSE = "
    );

    Serial.println(
      response
    );

  } else {

    Serial.print(
      ">> CONNECTION ERROR = "
    );

    Serial.println(
      http.errorToString(
        httpCode
      )
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


  // ค่า Sensor จริง 5 ครั้ง
  // แล้วเฉลี่ยเพื่อลด noise
  for (
    int i = 0;
    i < 5;
    i++
  ) {

    total +=
      analogRead(
        FSR_PIN
      );


    delay(2);
  }


  return
    total / 5;
}


// =====================================================
// READ ULTRASONIC
// =====================================================

float readDistance() {

  digitalWrite(
    TRIG_PIN,
    LOW
  );


  delayMicroseconds(
    2
  );


  digitalWrite(
    TRIG_PIN,
    HIGH
  );


  delayMicroseconds(
    10
  );


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


  // ค่าระยะจริงจาก Ultrasonic
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


  delay(
    180
  );


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


  // เริ่มปี๊บ
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


  // เสียงกำลังดัง
  if (
    buzzerState
  ) {

    if (
      now -
      lastBeepTime >=
      BEEP_ON_TIME
    ) {

      buzzerState =
        false;


      lastBeepTime =
        now;


      noTone(
        BUZZER_PIN
      );
    }

  }

  // เสียงกำลังเงียบ
  else {

    if (
      now -
      lastBeepTime >=
      BEEP_OFF_TIME
    ) {

      buzzerState =
        true;


      lastBeepTime =
        now;


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

  warningActive =
    false;


  buzzerState =
    false;


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

  countingPosture =
    false;


  badPostureStart =
    0;


  // สำคัญ
  // พอกลับมาหลังตรง
  // สามารถบันทึก BAD ครั้งต่อไปได้
  badPostureSent =
    false;
}


// =====================================================
// SETUP
// =====================================================

void setup() {

  Serial.begin(
    115200
  );


  analogReadResolution(
    12
  );


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


  setupWiFi();


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
    "FSR > 100 = SITTING"
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


  // Buzzer ปี๊บถี่แบบไม่ block
  updateWarning();


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
  // อ่านค่าจริง
  // ===================================================

  int fsrValue =
    readFSR();


  float distance =
    readDistance();


  // ===================================================
  // แสดงค่าตลอดเวลา
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

  } else {

    Serial.print(
      distance,
      2
    );


    Serial.print(
      " cm"
    );
  }


  // ===================================================
  // FSR > 100
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


    personSitting =
      false;


    stopWarning();

    resetBadPosture();


    // *** ไม่ส่ง Database ***
    return;
  }


  // ===================================================
  // เพิ่งนั่ง
  // ===================================================

  if (
    !personSitting
  ) {

    personSitting =
      true;


    Serial.println(
      " | SITTING DETECTED"
    );


    startBeep();


    resetBadPosture();


    // *** ไม่ส่ง Database ***
    return;
  }


  // ===================================================
  // Ultrasonic NO ECHO
  // ===================================================

  if (
    distance < 0
  ) {

    Serial.println(
      " | SENSOR NO ECHO"
    );


    stopWarning();

    resetBadPosture();


    // *** ไม่ส่ง Database ***
    return;
  }


  // ===================================================
  // POSTURE OK <=5cm
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


    // *** ไม่ส่ง Database ***
    return;
  }


  // ===================================================
  // BAD POSTURE
  // >5 ถึง <=55
  // ===================================================

  if (
    distance >
    STRAIGHT_DISTANCE
    &&
    distance <=
    MAX_DISTANCE
  ) {


    if (
      !countingPosture
    ) {

      countingPosture =
        true;


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
      elapsed /
      1000.0,
      1
    );


    Serial.println(
      " sec"
    );


    // =================================================
    // ครบ 2 วินาที
    // =================================================

    if (
      elapsed >=
      BAD_POSTURE_TIME
    ) {


      // เปิดเสียง + Motor
      if (
        !warningActive
      ) {

        startWarning();
      }


      // -----------------------------------------------
      // ส่ง Database แค่ครั้งเดียว
      // ต่อการหลังงอ 1 รอบ
      // -----------------------------------------------

      if (
        !badPostureSent
      ) {

        badPostureSent =
          true;


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
  // ระยะ >55cm
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


    // *** ไม่ส่ง Database ***
    return;
  }
}