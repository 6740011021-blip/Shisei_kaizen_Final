<?php

// อนุญาตให้ Expo และ ESP32 เชื่อมต่อ
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");


// =====================================================
// OPTIONS
// =====================================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);

    exit();
}


// =====================================================
// DATABASE
// =====================================================

$host     = "localhost";
$db_name  = "kaizen";
$username = "root";
$password = "";


try {

    $conn = new PDO(
        "mysql:host=" . $host .
        ";dbname=" . $db_name .
        ";charset=utf8mb4",
        $username,
        $password
    );


    $conn->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );


    // ลบข้อมูลเก่ากว่า 14 วัน
    $deleteQuery =
        "DELETE FROM posture_events
         WHERE event_time < NOW() - INTERVAL 14 DAY";


    $conn->exec($deleteQuery);


} catch (PDOException $exception) {

    http_response_code(500);


    echo json_encode([
        "success" => false,
        "message" =>
            "Database Connection Error: " .
            $exception->getMessage()
    ]);


    exit();
}


$method =
    $_SERVER['REQUEST_METHOD'];


// =====================================================
// POST
// ESP32 -> DATABASE
// =====================================================

if ($method === 'POST') {


    $jsonInput =
        file_get_contents(
            "php://input"
        );


    $data =
        json_decode(
            $jsonInput,
            true
        );


    if (
        !empty($data) &&
        isset($data['event_type'])
    ) {


        $device_id =
            isset($data['device_id'])
            ? intval($data['device_id'])
            : 1;


        $event_type =
            trim(
                $data['event_type']
            );


        $fsr_value =
            isset($data['fsr_value'])
            ? intval($data['fsr_value'])
            : 0;


        $distance_cm =
            isset($data['distance_cm'])
            ? floatval($data['distance_cm'])
            : 0.0;


        $duration_seconds =
            isset($data['duration_seconds'])
            ? intval($data['duration_seconds'])
            : 0;


        $note =
            isset($data['note'])
            ? trim($data['note'])
            : "ESP32 Auto Alert";


        // =================================================
        // INSERT แบบเดิมของคุณ
        // =================================================

        $query = "
            INSERT INTO posture_events
            (
                device_id,
                event_type,
                event_time,
                fsr_value,
                distance_cm,
                duration_seconds,
                note
            )
            VALUES
            (
                :device_id,
                :event_type,
                NOW(),
                :fsr_value,
                :distance_cm,
                :duration_seconds,
                :note
            )
        ";


        $stmt =
            $conn->prepare(
                $query
            );


        $stmt->bindParam(
            ":device_id",
            $device_id,
            PDO::PARAM_INT
        );


        $stmt->bindParam(
            ":event_type",
            $event_type,
            PDO::PARAM_STR
        );


        $stmt->bindParam(
            ":fsr_value",
            $fsr_value,
            PDO::PARAM_INT
        );


        $stmt->bindParam(
            ":distance_cm",
            $distance_cm
        );


        $stmt->bindParam(
            ":duration_seconds",
            $duration_seconds,
            PDO::PARAM_INT
        );


        $stmt->bindParam(
            ":note",
            $note,
            PDO::PARAM_STR
        );


        // =================================================
        // SAVE
        // =================================================

        if (
            $stmt->execute()
        ) {


            $insertedId =
                $conn->lastInsertId();


            http_response_code(201);


            echo json_encode([
                "success" => true,
                "message" =>
                    "Data saved successfully!",
                "inserted_id" =>
                    $insertedId
            ]);


        } else {


            http_response_code(500);


            echo json_encode([
                "success" => false,
                "message" =>
                    "Failed to save data."
            ]);
        }


    } else {


        http_response_code(400);


        echo json_encode([
            "success" => false,
            "message" =>
                "Invalid JSON payload."
        ]);
    }
}


// =====================================================
// GET
// DATABASE -> EXPO
// =====================================================

else if ($method === 'GET') {


    try {


        // ข้อมูลล่าสุด
        $query = "
            SELECT *
            FROM posture_events
            ORDER BY id DESC
            LIMIT 1
        ";


        $stmt =
            $conn->prepare(
                $query
            );


        $stmt->execute();


        $latest =
            $stmt->fetch(
                PDO::FETCH_ASSOC
            );


        // =================================================
        // HISTORY
        // =================================================

        $limit =
            isset($_GET['limit'])
            ? intval($_GET['limit'])
            : 100;


        if (
            $limit <= 0
        ) {

            $limit = 100;
        }


        if (
            $limit > 500
        ) {

            $limit = 500;
        }


        $historyQuery = "
            SELECT *
            FROM posture_events
            ORDER BY id DESC
            LIMIT :limit_val
        ";


        $stmtHistory =
            $conn->prepare(
                $historyQuery
            );


        $stmtHistory->bindValue(
            ":limit_val",
            $limit,
            PDO::PARAM_INT
        );


        $stmtHistory->execute();


        $history =
            $stmtHistory->fetchAll(
                PDO::FETCH_ASSOC
            );


        http_response_code(200);


        echo json_encode([
            "success" => true,
            "latest" =>
                $latest
                ? $latest
                : null,
            "history" =>
                $history
        ]);


    } catch (
        PDOException $exception
    ) {


        http_response_code(500);


        echo json_encode([
            "success" => false,
            "message" =>
                "Fetch Error: " .
                $exception->getMessage()
        ]);
    }
}

?>
