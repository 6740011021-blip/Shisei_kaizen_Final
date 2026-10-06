import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Circle, Line, Text as SvgText } from "react-native-svg";


// =====================================================
// API
// =====================================================

const API_BASE_URL =
  "http://172.20.10.2/shisei_api/api.php";


// ดึงสูงสุด 500 รายการ
const API_HISTORY_URL =
  `${API_BASE_URL}?limit=500`;


// BAD_POSTURE ใหม่จะแสดงสถานะสีแดงนานกี่ ms
const BAD_POSTURE_ACTIVE_MS = 5000;


// คะแนนที่หักต่อ BAD_POSTURE 1 ครั้ง
// เปลี่ยนตรงนี้ได้ภายหลัง
const HEALTH_PENALTY_PER_ALERT = 5;


const screenWidth =
  Dimensions.get("window").width;


// =====================================================
// MAIN SCREEN
// =====================================================

export default function SittingPostureScreen() {

  const [dashboardData, setDashboardData] =
    useState<any>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);


  // ===================================================
  // ดึงข้อมูลจาก API
  // ===================================================

  const fetchDashboardData = async () => {

    try {

      const response =
        await fetch(API_HISTORY_URL);


      const json =
        await response.json();


      if (json.success) {

        setDashboardData(json);
      }

    } catch (error) {

      console.error(
        "Error fetching real-time dashboard:",
        error
      );

    } finally {

      setIsLoading(false);

      setRefreshing(false);
    }
  };


  // ===================================================
  // Real-time refresh ทุก 2 วินาที
  // ===================================================

  useEffect(() => {

    fetchDashboardData();


    const interval =
      setInterval(
        fetchDashboardData,
        2000
      );


    return () =>
      clearInterval(interval);

  }, []);


  // ===================================================
  // Pull to refresh
  // ===================================================

  const onRefresh =
    useCallback(() => {

      setRefreshing(true);

      fetchDashboardData();

    }, []);


  // ===================================================
  // 1. CURRENT STATUS
  //
  // ตอนนี้ Database เก็บเฉพาะ BAD_POSTURE
  //
  // เพราะฉะนั้น:
  //
  // มี BAD ใหม่ไม่เกิน 5 วินาที
  // = BAD_POSTURE
  //
  // เกิน 5 วินาที
  // = POSTURE_OK
  // ===================================================


  const allHistory =
    dashboardData?.history || [];


  // หา BAD_POSTURE ล่าสุด
  const badHistory =
    allHistory.filter(
      (item: any) =>
        item.event_type ===
        "BAD_POSTURE"
    );


  const latestBadRecord =
    badHistory.length > 0
      ? badHistory[0]
      : dashboardData?.latest?.event_type ===
        "BAD_POSTURE"
      ? dashboardData.latest
      : null;


  let currentEventType =
    "POSTURE_OK";


  // ===================================================
  // เช็กว่า BAD ล่าสุดยังใหม่อยู่ไหม
  // ===================================================

  if (latestBadRecord?.event_time) {

    const eventTime =
      new Date(
        latestBadRecord.event_time.replace(
          " ",
          "T"
        )
      ).getTime();


    const now =
      Date.now();


    const timeSinceLastBad =
      now - eventTime;


    if (
      timeSinceLastBad >= 0 &&
      timeSinceLastBad <=
        BAD_POSTURE_ACTIVE_MS
    ) {

      currentEventType =
        "BAD_POSTURE";
    }
  }


  // ระยะจะแสดงเฉพาะตอน BAD กำลัง Active
  const currentDistance =
    currentEventType === "BAD_POSTURE"
      ? latestBadRecord?.distance_cm ?? null
      : null;


  // เวลาแจ้งเตือนล่าสุด
  const lastUpdatedTime =
    latestBadRecord?.event_time
      ? new Date(
          latestBadRecord.event_time.replace(
            " ",
            "T"
          )
        ).toLocaleTimeString(
          "th-TH",
          {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }
        )
      : "-";


  // ===================================================
  // 2. STATISTICS TODAY
  // ===================================================

  let healthScore = 100;

  let todayBadCount = 0;

  let hourlyGraphData =
    new Array(24).fill(0);


  if (
    dashboardData?.history &&
    dashboardData.history.length > 0
  ) {

    const today =
      new Date();


    // เช็กว่าเป็นวันนี้หรือไม่
    const isToday =
      (dateString: string) => {

        if (!dateString) {
          return false;
        }


        const d =
          new Date(
            dateString.replace(
              " ",
              "T"
            )
          );


        return (
          d.getDate() ===
            today.getDate() &&
          d.getMonth() ===
            today.getMonth() &&
          d.getFullYear() ===
            today.getFullYear()
        );
      };


    // =================================================
    // เอาเฉพาะ BAD_POSTURE ของวันนี้
    // =================================================

    const todayBadHistory =
      dashboardData.history.filter(
        (item: any) =>
          item.event_type ===
            "BAD_POSTURE" &&
          isToday(item.event_time)
      );


    todayBadCount =
      todayBadHistory.length;


    // =================================================
    // นับจำนวน BAD รายชั่วโมง
    // =================================================

    todayBadHistory.forEach(
      (item: any) => {

        if (!item.event_time) {
          return;
        }


        const date =
          new Date(
            item.event_time.replace(
              " ",
              "T"
            )
          );


        const hour =
          date.getHours();


        if (
          hour >= 0 &&
          hour < 24
        ) {

          hourlyGraphData[hour] += 1;
        }
      }
    );


    // =================================================
    // HEALTH SCORE
    //
    // เริ่ม 100
    // BAD 1 ครั้ง = -5
    //
    // ปรับค่าได้ที่
    // HEALTH_PENALTY_PER_ALERT
    // =================================================

    healthScore =
      Math.max(
        100 -
          todayBadCount *
            HEALTH_PENALTY_PER_ALERT,
        0
      );
  }


  // คะแนนที่เสียไปวันนี้
  const lostScore =
    100 - healthScore;


  // ===================================================
  // LINE CHART
  // ===================================================

  const renderLineChart = () => {

    const chartHeight = 130;

    const paddingLeft = 32;

    const paddingRight = 12;

    const paddingTop = 15;

    const paddingBottom = 28;


    const svgWidth =
      screenWidth - 64;


    const chartWidth =
      svgWidth -
      paddingLeft -
      paddingRight;


    const maxValue =
      Math.max(
        ...hourlyGraphData,
        4
      );


    const points =
      hourlyGraphData.map(
        (val, index) => {

          const x =
            paddingLeft +
            (index /
              (hourlyGraphData.length -
                1)) *
              chartWidth;


          const y =
            paddingTop +
            chartHeight -
            (val / maxValue) *
              chartHeight;


          return {
            x,
            y,
            val,
          };
        }
      );


    const pathD =
      points.reduce(
        (acc, pt, index) => {

          return index === 0
            ? `M ${pt.x} ${pt.y}`
            : `${acc} L ${pt.x} ${pt.y}`;

        },
        ""
      );


    const yTicks =
      [0, 0.25, 0.5, 0.75, 1];


    const displayHourIndices =
      [
        0,
        3,
        6,
        9,
        12,
        15,
        18,
        21,
      ];


    return (

      <Svg
        height={
          chartHeight +
          paddingTop +
          paddingBottom
        }
        width={svgWidth}
      >

        {yTicks.map(
          (ratio, i) => {

            const yPos =
              paddingTop +
              chartHeight *
                ratio;


            const valLabel =
              Math.round(
                maxValue *
                  (1 - ratio)
              );


            return (

              <React.Fragment
                key={`y-grid-${i}`}
              >

                <Line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={
                    paddingLeft +
                    chartWidth
                  }
                  y2={yPos}
                  stroke="#E2E8F0"
                  strokeDasharray="4"
                  strokeWidth="1"
                />


                <SvgText
                  x={
                    paddingLeft -
                    6
                  }
                  y={
                    yPos +
                    3
                  }
                  fontSize="10"
                  fill="#64748B"
                  textAnchor="end"
                  fontWeight="500"
                >

                  {valLabel}

                </SvgText>

              </React.Fragment>
            );
          }
        )}


        <Path
          d={pathD}
          fill="none"
          stroke="#2563EB"
          strokeWidth="2.5"
        />


        {points.map(
          (pt, i) => (

            <React.Fragment
              key={`pt-${i}`}
            >

              <Circle
                cx={pt.x}
                cy={pt.y}
                r="3"
                fill="#2563EB"
              />

              <Circle
                cx={pt.x}
                cy={pt.y}
                r="1"
                fill="#FFFFFF"
              />

            </React.Fragment>
          )
        )}


        {displayHourIndices.map(
          (hourIndex) => {

            const xPos =
              paddingLeft +
              (hourIndex /
                (hourlyGraphData.length -
                  1)) *
                chartWidth;


            const label =
              `${hourIndex
                .toString()
                .padStart(
                  2,
                  "0"
                )}:00`;


            return (

              <SvgText
                key={`x-label-${hourIndex}`}
                x={xPos}
                y={
                  paddingTop +
                  chartHeight +
                  18
                }
                fontSize="9"
                fill="#64748B"
                textAnchor="middle"
                fontWeight="500"
              >

                {label}

              </SvgText>
            );
          }
        )}

      </Svg>
    );
  };


  // ===================================================
  // 3. POSTURE IMAGE
  // ===================================================

  const getPostureImage = () => {

    if (
      currentEventType ===
      "BAD_POSTURE"
    ) {

      return require(
        "../pic/sir_no2.png"
      );
    }


    return require(
      "../pic/siryes.png"
    );
  };


  // ===================================================
  // CURRENT STATUS BADGE
  // ===================================================

  const getCurrentStatusBadge =
    () => {

      switch (
        currentEventType
      ) {

        case "BAD_POSTURE":

          return {

            title:
              "นั่งผิดท่า!",

            subtitle:
              "กรุณาปรับท่านั่งให้ตรง หลังชิดพนักพิง",

            color:
              "#FF3B30",

            bgColor:
              "#3A1014",

            badgeDot:
              "#FF3B30",
          };


        case "POSTURE_OK":

        default:

          return {

            title:
              "ท่านั่งถูกต้อง",

            subtitle:
              "ไม่พบการแจ้งเตือนท่านั่งผิดในขณะนี้",

            color:
              "#34C759",

            bgColor:
              "#0E2A18",

            badgeDot:
              "#34C759",
          };
      }
    };


  const currentStatusInfo =
    getCurrentStatusBadge();


  // ===================================================
  // LOADING
  // ===================================================

  if (isLoading) {

    return (

      <SafeAreaView
        style={[
          styles.container,
          styles.centerContent,
        ]}
      >

        <ActivityIndicator
          size="large"
          color="#4CD964"
        />

        <Text
          style={{
            color: "#FFF",
            marginTop: 12,
          }}
        >

          กำลังโหลดข้อมูล...

        </Text>

      </SafeAreaView>
    );
  }


  // ===================================================
  // UI
  // ===================================================

  return (

    <SafeAreaView
      style={styles.container}
    >

      <StatusBar
        barStyle="light-content"
      />


      <ScrollView

        contentContainerStyle={
          styles.scrollContent
        }

        refreshControl={

          <RefreshControl

            refreshing={
              refreshing
            }

            onRefresh={
              onRefresh
            }

            tintColor="#4CD964"
          />
        }
      >

        {/* HEADER */}

        <View
          style={
            styles.headerContainer
          }
        >

          <Text
            style={
              styles.headerTitle
            }
          >

            ท่านั่งของคุณ

          </Text>


          <TouchableOpacity
            style={
              styles.settingsButtonHeader
            }
          >

            <Text
              style={
                styles.settingsIcon
              }
            >

              ⚙️

            </Text>

          </TouchableOpacity>

        </View>


        {/* ============================================= */}
        {/* REAL-TIME STATUS */}
        {/* ============================================= */}

        <View

          style={[
            styles.realtimeStatusCard,
            {
              backgroundColor:
                currentStatusInfo.bgColor,

              borderColor:
                currentStatusInfo.color,
            },
          ]}
        >

          <View
            style={
              styles.statusHeaderRow
            }
          >

            <View
              style={
                styles.liveIndicator
              }
            >

              <View

                style={[
                  styles.pulseDot,
                  {
                    backgroundColor:
                      currentStatusInfo.badgeDot,
                  },
                ]}
              />


              <Text
                style={
                  styles.liveText
                }
              >

                สถานะปัจจุบัน (Real-time)

              </Text>

            </View>


            <Text
              style={
                styles.timeText
              }
            >

              แจ้งเตือนล่าสุด: {lastUpdatedTime}

            </Text>

          </View>


          <Text

            style={[
              styles.statusTitleText,
              {
                color:
                  currentStatusInfo.color,
              },
            ]}
          >

            {currentStatusInfo.title}

          </Text>


          <Text
            style={
              styles.statusSubText
            }
          >

            {currentStatusInfo.subtitle}

          </Text>


          {/* แสดงระยะเฉพาะตอน BAD */}

          {currentDistance !== null && (

            <View
              style={
                styles.sensorRow
              }
            >

              <Text
                style={
                  styles.sensorText
                }
              >

                ระยะห่างจากเซนเซอร์:{" "}

                <Text

                  style={{
                    fontWeight:
                      "bold",

                    color:
                      "#FFF",
                  }}
                >

                  {currentDistance} cm

                </Text>

              </Text>

            </View>
          )}

        </View>


        {/* ============================================= */}
        {/* POSTURE IMAGE */}
        {/* ============================================= */}

        <View
          style={
            styles.imageContainer
          }
        >

          <Image

            source={
              getPostureImage()
            }

            style={
              styles.postureImage
            }

            resizeMode="contain"
          />

        </View>


        {/* LEGEND */}

        <View
          style={
            styles.legendContainer
          }
        >

          <View
            style={
              styles.legendItem
            }
          >

            <View

              style={[
                styles.legendDot,
                {
                  backgroundColor:
                    "#FF3B30",
                },
              ]}
            />

            <Text
              style={
                styles.legendText
              }
            >

              นั่งผิดท่า

            </Text>

          </View>


          <View
            style={
              styles.legendItem
            }
          >

            <View

              style={[
                styles.legendDot,
                {
                  backgroundColor:
                    "#34C759",
                },
              ]}
            />

            <Text
              style={
                styles.legendText
              }
            >

              ท่านั่งที่ดี

            </Text>

          </View>

        </View>


        {/* ============================================= */}
        {/* GRAPH */}
        {/* ============================================= */}

        <View
          style={
            styles.card
          }
        >

          <Text
            style={
              styles.cardTitle
            }
          >

            ความถี่การแจ้งเตือนวันนี้

          </Text>


          <Text
            style={
              styles.graphSubtitle
            }
          >

            แนวนอน: รายชั่วโมง (00:00 - 23:00 น.) | แนวตั้ง: จำนวนครั้ง

          </Text>


          <View
            style={
              styles.chartWrapper
            }
          >

            {renderLineChart()}

          </View>

        </View>


        {/* ============================================= */}
        {/* HEALTH SCORE + ALERT COUNT */}
        {/* ============================================= */}

        <View
          style={
            styles.row
          }
        >

          {/* HEALTH SCORE */}

          <View

            style={[
              styles.card,
              styles.halfCard,
            ]}
          >

            <Text
              style={
                styles.cardTitle
              }
            >

              คะแนนสุขภาพ

            </Text>


            <View
              style={
                styles.scoreContainer
              }
            >

              <View
                style={
                  styles.circleChartWrapper
                }
              >

                <ProgressChart

                  data={{
                    data: [
                      Math.min(
                        Math.max(
                          healthScore /
                            100,
                          0
                        ),
                        1
                      ),
                    ],
                  }}

                  width={60}

                  height={60}

                  strokeWidth={7}

                  radius={22}

                  chartConfig={{

                    backgroundColor:
                      "#F4F7FC",

                    backgroundGradientFrom:
                      "#F4F7FC",

                    backgroundGradientTo:
                      "#F4F7FC",

                    color:
                      (
                        opacity = 1
                      ) =>
                        healthScore >
                        50

                          ? `rgba(52, 199, 89, ${opacity})`

                          : `rgba(255, 59, 48, ${opacity})`,
                  }}

                  hideLegend={
                    true
                  }
                />

              </View>


              <View
                style={
                  styles.scoreTextGroup
                }
              >

                <Text

                  style={[
                    styles.scoreValue,
                    {
                      color:
                        healthScore >
                        50

                          ? "#34C759"

                          : "#FF3B30",
                    },
                  ]}
                >

                  {healthScore}/100

                </Text>


                <Text
                  style={
                    styles.scoreUnit
                  }
                >

                  {healthScore > 50
                    ? "ดีมาก"
                    : "ต้องปรับปรุง"}

                </Text>

              </View>

            </View>

          </View>


          {/* ALERT COUNT */}

          <View

            style={[
              styles.card,
              styles.halfCard,
              {
                justifyContent:
                  "center",
              },
            ]}
          >

            <Text
              style={
                styles.cardTitle
              }
            >

              แจ้งเตือนวันนี้

            </Text>


            <Text
              style={
                styles.bigValueText
              }
            >

              {todayBadCount} ครั้ง

            </Text>

          </View>

        </View>


        {/* ============================================= */}
        {/* DAILY SUMMARY */}
        {/* ============================================= */}

        <View

          style={[
            styles.card,
            styles.darkBlueCard,
          ]}
        >

          <Text

            style={[
              styles.cardTitle,
              styles.whiteText,
            ]}
          >

            สรุปพฤติกรรมประจำวัน

          </Text>


          <View
            style={
              styles.statContainer
            }
          >

            {/* ALERTS */}

            <View
              style={
                styles.statRow
              }
            >

              <View
                style={
                  styles.statLabelGroup
                }
              >

                <View

                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        "#FF3B30",
                    },
                  ]}
                />

                <Text
                  style={
                    styles.statLabelText
                  }
                >

                  นั่งผิดท่า

                </Text>

              </View>


              <Text
                style={
                  styles.statPercentText
                }
              >

                {todayBadCount} ครั้ง

              </Text>

            </View>


            {/* SCORE LOST */}

            <View
              style={
                styles.statRow
              }
            >

              <View
                style={
                  styles.statLabelGroup
                }
              >

                <View

                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        "#34C759",
                    },
                  ]}
                />

                <Text
                  style={
                    styles.statLabelText
                  }
                >

                  คะแนนสุขภาพคงเหลือ

                </Text>

              </View>


              <Text
                style={
                  styles.statPercentText
                }
              >

                {healthScore}/100

              </Text>

            </View>


            {/* LOST SCORE */}

            {lostScore > 0 && (

              <View
                style={
                  styles.statRow
                }
              >

                <View
                  style={
                    styles.statLabelGroup
                  }
                >

                  <View

                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          "#F59E0B",
                      },
                    ]}
                  />

                  <Text
                    style={
                      styles.statLabelText
                    }
                  >

                    คะแนนที่ถูกหักวันนี้

                  </Text>

                </View>


                <Text
                  style={
                    styles.statPercentText
                  }
                >

                  -{lostScore}

                </Text>

              </View>
            )}

          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#0A1220",
    },


    centerContent: {
      justifyContent:
        "center",

      alignItems:
        "center",
    },


    scrollContent: {

      padding: 16,

      paddingTop: 10,

      paddingBottom:
        Platform.OS ===
        "ios"
          ? 110
          : 90,
    },


    headerContainer: {

      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      position:
        "relative",

      marginBottom:
        16,
    },


    headerTitle: {

      fontSize: 24,

      fontWeight:
        "bold",

      color:
        "#FFFFFF",
    },


    settingsButtonHeader: {

      position:
        "absolute",

      right: 0,

      backgroundColor:
        "#1E293B",

      width: 38,

      height: 38,

      borderRadius:
        19,

      justifyContent:
        "center",

      alignItems:
        "center",
    },


    settingsIcon: {

      color:
        "white",

      fontSize:
        18,
    },


    realtimeStatusCard: {

      borderRadius:
        16,

      padding:
        16,

      marginBottom:
        16,

      borderWidth:
        1.5,
    },


    statusHeaderRow: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginBottom:
        8,
    },


    liveIndicator: {

      flexDirection:
        "row",

      alignItems:
        "center",
    },


    pulseDot: {

      width: 10,

      height: 10,

      borderRadius:
        5,

      marginRight:
        6,
    },


    liveText: {

      color:
        "#AAA",

      fontSize:
        12,

      fontWeight:
        "600",
    },


    timeText: {

      color:
        "#888",

      fontSize:
        11,
    },


    statusTitleText: {

      fontSize:
        22,

      fontWeight:
        "bold",

      marginBottom:
        4,
    },


    statusSubText: {

      color:
        "#DDD",

      fontSize:
        13,

      marginBottom:
        8,
    },


    sensorRow: {

      marginTop:
        6,

      paddingTop:
        6,

      borderTopWidth:
        1,

      borderTopColor:
        "rgba(255,255,255,0.1)",
    },


    sensorText: {

      color:
        "#AAA",

      fontSize:
        12,
    },


    imageContainer: {

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        12,
    },


    postureImage: {

      width:
        "100%",

      height:
        170,
    },


    legendContainer: {

      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      gap:
        40,

      marginBottom:
        16,
    },


    legendItem: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        8,
    },


    legendDot: {

      width:
        12,

      height:
        12,

      borderRadius:
        6,
    },


    legendText: {

      color:
        "#FFFFFF",

      fontSize:
        12,
    },


    card: {

      backgroundColor:
        "#F4F7FC",

      borderRadius:
        16,

      padding:
        16,

      marginBottom:
        16,
    },


    graphSubtitle: {

      fontSize:
        11,

      color:
        "#64748B",

      fontWeight:
        "500",

      marginBottom:
        8,
    },


    chartWrapper: {

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    row: {

      flexDirection:
        "row",

      gap:
        12,
    },


    halfCard: {

      flex:
        1,

      minHeight:
        120,
    },


    cardTitle: {

      fontSize:
        14,

      fontWeight:
        "bold",

      color:
        "#000000",

      marginBottom:
        4,
    },


    scoreContainer: {

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginTop:
        4,
    },


    circleChartWrapper: {

      width:
        60,

      height:
        60,

      justifyContent:
        "center",

      alignItems:
        "center",
    },


    scoreTextGroup: {

      alignItems:
        "center",

      flex:
        1,
    },


    scoreValue: {

      fontSize:
        18,

      fontWeight:
        "bold",
    },


    scoreUnit: {

      fontSize:
        11,

      color:
        "#555",
    },


    bigValueText: {

      fontSize:
        20,

      fontWeight:
        "bold",

      color:
        "#000000",

      textAlign:
        "center",

      marginTop:
        8,
    },


    darkBlueCard: {

      backgroundColor:
        "#1A294A",
    },


    whiteText: {

      color:
        "#FFFFFF",

      fontSize:
        14,
    },


    statContainer: {

      gap:
        10,

      marginTop:
        8,
    },


    statRow: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },


    statLabelGroup: {

      flexDirection:
        "row",

      alignItems:
        "center",
    },


    dot: {

      width:
        10,

      height:
        10,

      borderRadius:
        5,

      marginRight:
        8,
    },


    statLabelText: {

      color:
        "#D0D0D0",

      fontSize:
        13,
    },


    statPercentText: {

      color:
        "#FFFFFF",

      fontSize:
        15,

      fontWeight:
        "bold",
    },
  });

  