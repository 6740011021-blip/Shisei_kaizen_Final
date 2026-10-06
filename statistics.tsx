import React, {
  useState,
  useMemo,
  useEffect,
  useCallback
} from "react";

import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
  RefreshControl
} from "react-native";

import {
  SafeAreaView
} from "react-native-safe-area-context";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  X
} from "lucide-react-native";

import Svg, {
  Path,
  Circle,
  Line,
  Text as SvgText
} from "react-native-svg";


// =====================================================
// SCREEN
// =====================================================

const { width } =
  Dimensions.get("window");


// =====================================================
// API
// =====================================================

// IP ของคอมพิวเตอร์ที่รัน XAMPP
const API_BASE_URL =
  "http://172.20.10.2/shisei_api/api.php";


// ดึง History สูงสุด 500 รายการ
const API_HISTORY_URL =
  `${API_BASE_URL}?limit=500`;


// =====================================================
// DATE DATA
// =====================================================

const MONTH_NAMES_TH = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม"
];


const MONTH_NAMES_SHORT_TH = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค."
];


const DAY_NAMES_TH = [
  "อาทิตย์",
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์"
];


const CALENDAR_HEADER_DAYS = [
  "อา",
  "จ",
  "อ",
  "พ",
  "พฤ",
  "ศ",
  "ส"
];


// =====================================================
// MAIN
// =====================================================

export default function StatisticsScreen() {

  const [
    selectedDateObj,
    setSelectedDateObj
  ] = useState(
    new Date()
  );


  const [
    isDatePickerVisible,
    setDatePickerVisible
  ] = useState(false);


  const [
    pickerYear,
    setPickerYear
  ] = useState(
    selectedDateObj.getFullYear()
  );


  const [
    pickerMonth,
    setPickerMonth
  ] = useState(
    selectedDateObj.getMonth()
  );


  // ===================================================
  // HISTORY
  // ===================================================

  const [
    historyData,
    setHistoryData
  ] = useState<any[]>([]);


  // 24 ชั่วโมง
  const [
    graphData,
    setGraphData
  ] = useState<number[]>(
    new Array(24).fill(0)
  );


  const [
    isLoading,
    setIsLoading
  ] = useState(false);


  const [
    refreshing,
    setRefreshing
  ] = useState(false);


  // ===================================================
  // FETCH HISTORY
  // ===================================================

  const fetchHistory =
    async (
      isSilent = false
    ) => {

      if (!isSilent) {

        setIsLoading(true);
      }


      try {

        const response =
          await fetch(
            API_HISTORY_URL
          );


        const json =
          await response.json();


        if (
          json.success &&
          json.history
        ) {

          const selectedYear =
            selectedDateObj.getFullYear();


          const selectedMonth =
            selectedDateObj.getMonth();


          const selectedDate =
            selectedDateObj.getDate();


          // =============================================
          // 1. เอาเฉพาะ BAD_POSTURE
          // และวันที่ที่ผู้ใช้เลือก
          // =============================================

          const filteredLogs =
            json.history.filter(
              (item: any) => {

                if (
                  item.event_type !==
                  "BAD_POSTURE"
                ) {

                  return false;
                }


                if (!item.event_time) {

                  return false;
                }


                const itemDate =
                  new Date(
                    item.event_time.replace(
                      " ",
                      "T"
                    )
                  );


                return (

                  itemDate.getFullYear() ===
                    selectedYear &&

                  itemDate.getMonth() ===
                    selectedMonth &&

                  itemDate.getDate() ===
                    selectedDate
                );
              }
            );


          // =============================================
          // 2. คำนวณกราฟรายชั่วโมง
          // =============================================

          const hourlyBlocks =
            new Array(24).fill(0);


          filteredLogs.forEach(
            (item: any) => {

              const itemDate =
                new Date(
                  item.event_time.replace(
                    " ",
                    "T"
                  )
                );


              const hour =
                itemDate.getHours();


              if (
                hour >= 0 &&
                hour < 24
              ) {

                hourlyBlocks[hour] += 1;
              }
            }
          );


          setGraphData(
            hourlyBlocks
          );


          // =============================================
          // 3. เรียงใหม่ -> เก่า
          //
          // ไม่มีการกรอง 1 นาทีอีกแล้ว
          //
          // BAD_POSTURE ทุกแถวใน Database
          // จะแสดงทุกครั้ง
          // =============================================

          const sortedLogs =
            [...filteredLogs].sort(
              (
                a: any,
                b: any
              ) => {

                return (
                  new Date(
                    b.event_time.replace(
                      " ",
                      "T"
                    )
                  ).getTime() -

                  new Date(
                    a.event_time.replace(
                      " ",
                      "T"
                    )
                  ).getTime()
                );
              }
            );


          // =============================================
          // 4. FORMAT
          // =============================================

          const formattedData =
            sortedLogs.map(
              (item: any) => {

                const date =
                  new Date(
                    item.event_time.replace(
                      " ",
                      "T"
                    )
                  );


                return {

                  id:
                    item.id.toString(),


                  title:
                    "แจ้งเตือนนั่งผิดท่า",


                  time:
                    `เวลา ${date.toLocaleTimeString(
                      "th-TH",
                      {
                        hour:
                          "2-digit",

                        minute:
                          "2-digit",

                        second:
                          "2-digit"
                      }
                    )} น.`,


                  distance:
                    item.distance_cm,


                  fsr:
                    item.fsr_value,


                  duration:
                    item.duration_seconds
                };
              }
            );


          setHistoryData(
            formattedData
          );

        } else {

          setHistoryData([]);

          setGraphData(
            new Array(24).fill(0)
          );
        }

      } catch (error) {

        console.error(
          "Error fetching history:",
          error
        );


        if (!isSilent) {

          setHistoryData([]);

          setGraphData(
            new Array(24).fill(0)
          );
        }

      } finally {

        if (!isSilent) {

          setIsLoading(false);
        }
      }
    };


  // ===================================================
  // REAL-TIME
  // ===================================================

  useEffect(() => {

    fetchHistory();


    // Update ทุก 5 วินาที
    const interval =
      setInterval(
        () => {

          fetchHistory(true);

        },
        5000
      );


    return () =>
      clearInterval(interval);

  }, [
    selectedDateObj
  ]);


  // ===================================================
  // PULL TO REFRESH
  // ===================================================

  const onRefresh =
    useCallback(
      async () => {

        setRefreshing(true);


        await fetchHistory(
          false
        );


        setRefreshing(false);

      },
      [
        selectedDateObj
      ]
    );


  // ===================================================
  // DATE PICKER
  // ===================================================

  const handleOpenPicker =
    () => {

      setPickerYear(
        selectedDateObj.getFullYear()
      );


      setPickerMonth(
        selectedDateObj.getMonth()
      );


      setDatePickerVisible(
        true
      );
    };


  // ===================================================
  // CHANGE MONTH
  // ===================================================

  const changeMonth =
    (offset: number) => {

      let newMonth =
        pickerMonth;


      let newYear =
        pickerYear;


      newMonth +=
        offset;


      if (
        newMonth > 11
      ) {

        newMonth = 0;

        newYear += 1;

      } else if (
        newMonth < 0
      ) {

        newMonth = 11;

        newYear -= 1;
      }


      setPickerMonth(
        newMonth
      );


      setPickerYear(
        newYear
      );
    };


  // ===================================================
  // CURRENT WEEK
  // ===================================================

  const currentWeekDays =
    useMemo(() => {

      const curr =
        new Date(
          selectedDateObj
        );


      const dayOfWeek =
        curr.getDay();


      const distanceToMonday =
        dayOfWeek === 0
          ? -6
          : 1 -
            dayOfWeek;


      const monday =
        new Date(curr);


      monday.setDate(
        curr.getDate() +
        distanceToMonday
      );


      const week = [];


      for (
        let i = 0;
        i < 7;
        i++
      ) {

        const d =
          new Date(
            monday
          );


        d.setDate(
          monday.getDate() +
          i
        );


        week.push({

          dayName:
            DAY_NAMES_TH[
              d.getDay()
            ],


          dateNum:
            d
              .getDate()
              .toString(),


          fullDate:
            d
        });
      }


      return week;

    }, [
      selectedDateObj
    ]);


  // ===================================================
  // CALENDAR GRID
  // ===================================================

  const calendarGrid =
    useMemo(() => {

      const firstDayIndex =
        new Date(
          pickerYear,
          pickerMonth,
          1
        ).getDay();


      const daysInMonth =
        new Date(
          pickerYear,
          pickerMonth + 1,
          0
        ).getDate();


      const cells:
        (number | null)[] =
          [];


      for (
        let i = 0;
        i < firstDayIndex;
        i++
      ) {

        cells.push(null);
      }


      for (
        let i = 1;
        i <= daysInMonth;
        i++
      ) {

        cells.push(i);
      }


      return cells;

    }, [
      pickerYear,
      pickerMonth
    ]);


  // ===================================================
  // HEADER DATE
  // ===================================================

  const formattedHeaderDate =
    `${
      selectedDateObj.getDate()
    } ${
      MONTH_NAMES_SHORT_TH[
        selectedDateObj.getMonth()
      ]
    }`;


  // ===================================================
  // LINE GRAPH
  // ===================================================

  const renderLineChart =
    () => {

      const chartHeight =
        130;


      const paddingLeft =
        32;


      const paddingRight =
        12;


      const paddingTop =
        15;


      const paddingBottom =
        28;


      const svgWidth =
        width - 64;


      const chartWidth =
        svgWidth -
        paddingLeft -
        paddingRight;


      // ขั้นต่ำ 4 เพื่อกราฟดูสวย
      const maxValue =
        Math.max(
          ...graphData,
          4
        );


      // 24 จุด
      const points =
        graphData.map(
          (
            val,
            index
          ) => {

            const x =
              paddingLeft +
              (
                index /
                (
                  graphData.length -
                  1
                )
              ) *
              chartWidth;


            const y =
              paddingTop +
              chartHeight -
              (
                val /
                maxValue
              ) *
              chartHeight;


            return {
              x,
              y,
              val
            };
          }
        );


      const pathD =
        points.reduce(
          (
            acc,
            pt,
            index
          ) => {

            return index === 0

              ? `M ${pt.x} ${pt.y}`

              : `${acc} L ${pt.x} ${pt.y}`;

          },
          ""
        );


      const yTicks =
        [
          0,
          0.25,
          0.5,
          0.75,
          1
        ];


      const displayHourIndices =
        [
          0,
          3,
          6,
          9,
          12,
          15,
          18,
          21
        ];


      return (

        <Svg

          height={
            chartHeight +
            paddingTop +
            paddingBottom
          }

          width={
            svgWidth
          }
        >

          {/* GRID */}

          {yTicks.map(
            (
              ratio,
              i
            ) => {

              const yPos =
                paddingTop +
                chartHeight *
                ratio;


              const valLabel =
                Math.round(
                  maxValue *
                  (
                    1 -
                    ratio
                  )
                );


              return (

                <React.Fragment
                  key={
                    `y-grid-${i}`
                  }
                >

                  <Line

                    x1={
                      paddingLeft
                    }

                    y1={
                      yPos
                    }

                    x2={
                      paddingLeft +
                      chartWidth
                    }

                    y2={
                      yPos
                    }

                    stroke={
                      "#E2E8F0"
                    }

                    strokeDasharray={
                      "4"
                    }

                    strokeWidth={
                      "1"
                    }
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

                    fontSize={
                      "10"
                    }

                    fill={
                      "#64748B"
                    }

                    textAnchor={
                      "end"
                    }

                    fontWeight={
                      "500"
                    }
                  >

                    {valLabel}

                  </SvgText>

                </React.Fragment>
              );
            }
          )}


          {/* LINE */}

          <Path

            d={
              pathD
            }

            fill={
              "none"
            }

            stroke={
              "#2563EB"
            }

            strokeWidth={
              "2.5"
            }
          />


          {/* POINTS */}

          {points.map(
            (
              pt,
              i
            ) => (

              <React.Fragment
                key={
                  `pt-${i}`
                }
              >

                <Circle

                  cx={
                    pt.x
                  }

                  cy={
                    pt.y
                  }

                  r={
                    "3"
                  }

                  fill={
                    "#2563EB"
                  }
                />


                <Circle

                  cx={
                    pt.x
                  }

                  cy={
                    pt.y
                  }

                  r={
                    "1"
                  }

                  fill={
                    "#FFFFFF"
                  }
                />

              </React.Fragment>
            )
          )}


          {/* X LABEL */}

          {displayHourIndices.map(
            (
              hourIndex
            ) => {

              const xPos =
                paddingLeft +
                (
                  hourIndex /
                  (
                    graphData.length -
                    1
                  )
                ) *
                chartWidth;


              const label =
                `${
                  hourIndex
                    .toString()
                    .padStart(
                      2,
                      "0"
                    )
                }:00`;


              return (

                <SvgText

                  key={
                    `x-label-${hourIndex}`
                  }

                  x={
                    xPos
                  }

                  y={
                    paddingTop +
                    chartHeight +
                    18
                  }

                  fontSize={
                    "9"
                  }

                  fill={
                    "#64748B"
                  }

                  textAnchor={
                    "middle"
                  }

                  fontWeight={
                    "500"
                  }
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
  // UI
  // ===================================================

  return (

    <SafeAreaView
      style={
        styles.container
      }
    >

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

            tintColor={
              "#38BDF8"
            }

            colors={[
              "#38BDF8"
            ]}
          />
        }
      >

        {/* ============================================= */}
        {/* HEADER */}
        {/* ============================================= */}

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

            สถิติ

          </Text>


          <TouchableOpacity

            style={
              styles.dateSelector
            }

            activeOpacity={
              0.7
            }

            onPress={
              handleOpenPicker
            }
          >

            <Text
              style={
                styles.dateSelectorText
              }
            >

              {formattedHeaderDate}

            </Text>


            <ChevronDown

              size={
                16
              }

              color={
                "#FFFFFF"
              }
            />

          </TouchableOpacity>

        </View>


        {/* ============================================= */}
        {/* WEEK DAYS */}
        {/* ============================================= */}

        <View
          style={
            styles.daysContainer
          }
        >

          {currentWeekDays.map(
            (
              item
            ) => {

              const isSelected =
                item.fullDate.toDateString() ===
                selectedDateObj.toDateString();


              return (

                <TouchableOpacity

                  key={
                    item.fullDate.toISOString()
                  }

                  style={[
                    styles.dayItem,
                    isSelected &&
                      styles.selectedDayItem
                  ]}

                  onPress={
                    () =>
                      setSelectedDateObj(
                        item.fullDate
                      )
                  }
                >

                  <Text

                    style={[
                      styles.dayText,
                      isSelected &&
                        styles.selectedDayText
                    ]}
                  >

                    {item.dayName}

                  </Text>


                  <Text

                    style={[
                      styles.dateText,
                      isSelected &&
                        styles.selectedDateText
                    ]}
                  >

                    {item.dateNum}

                  </Text>

                </TouchableOpacity>
              );
            }
          )}

        </View>


        {/* ============================================= */}
        {/* GRAPH */}
        {/* ============================================= */}

        <View
          style={
            styles.graphCard
          }
        >

          <Text
            style={
              styles.graphTitle
            }
          >

            ความถี่การแจ้งเตือน

          </Text>


          <Text
            style={
              styles.graphSubtitle
            }
          >

            จำนวนครั้งที่ตรวจพบนั่งผิดท่าในแต่ละชั่วโมง

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
        {/* HISTORY */}
        {/* ============================================= */}

        <Text
          style={
            styles.sectionTitle
          }
        >

          ประวัติการแจ้งเตือน

        </Text>


        {isLoading &&
        !refreshing ? (

          <ActivityIndicator

            size={
              "small"
            }

            color={
              "#FFFFFF"
            }

            style={{
              marginTop:
                20
            }}
          />

        ) : historyData.length ===
          0 ? (

          <Text
            style={
              styles.emptyText
            }
          >

            ไม่มีข้อมูลประวัติในระบบ

          </Text>

        ) : (

          historyData.map(
            (
              item
            ) => (

              <View

                key={
                  item.id
                }

                style={
                  styles.historyCard
                }
              >

                <View
                  style={
                    styles.bookmarkIconWrapper
                  }
                >

                  <Bookmark

                    size={
                      24
                    }

                    color={
                      "#000000"
                    }

                    fill={
                      "#000000"
                    }
                  />

                </View>


                <View
                  style={
                    styles.historyTextContainer
                  }
                >

                  <Text
                    style={
                      styles.historyTitle
                    }
                  >

                    {item.title}

                  </Text>


                  <Text
                    style={
                      styles.historyTime
                    }
                  >

                    {item.time}

                  </Text>


                  {/* แสดงข้อมูลจาก Sensor ที่บันทึกไว้ */}

                  <Text
                    style={
                      styles.historyDetail
                    }
                  >

                    ระยะ {item.distance} cm

                  </Text>

                </View>

              </View>
            )
          )
        )}

      </ScrollView>


      {/* ============================================= */}
      {/* DATE PICKER MODAL */}
      {/* ============================================= */}

      <Modal

        visible={
          isDatePickerVisible
        }

        transparent={
          true
        }

        animationType={
          "fade"
        }

        onRequestClose={
          () =>
            setDatePickerVisible(
              false
            )
        }
      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <View
            style={
              styles.modalContent
            }
          >

            {/* HEADER */}

            <View
              style={
                styles.modalHeader
              }
            >

              <TouchableOpacity

                onPress={
                  () =>
                    changeMonth(
                      -1
                    )
                }

                style={
                  styles.navBtn
                }
              >

                <ChevronLeft

                  size={
                    20
                  }

                  color={
                    "#0F172A"
                  }
                />

              </TouchableOpacity>


              <Text
                style={
                  styles.modalMonthTitle
                }
              >

                {
                  MONTH_NAMES_TH[
                    pickerMonth
                  ]
                }{" "}

                {
                  pickerYear +
                  543
                }

              </Text>


              <TouchableOpacity

                onPress={
                  () =>
                    changeMonth(
                      1
                    )
                }

                style={
                  styles.navBtn
                }
              >

                <ChevronRight

                  size={
                    20
                  }

                  color={
                    "#0F172A"
                  }
                />

              </TouchableOpacity>


              <TouchableOpacity

                onPress={
                  () =>
                    setDatePickerVisible(
                      false
                    )
                }

                style={
                  styles.closeBtn
                }
              >

                <X

                  size={
                    20
                  }

                  color={
                    "#64748B"
                  }
                />

              </TouchableOpacity>

            </View>


            {/* CALENDAR HEADER */}

            <View
              style={
                styles.calendarHeaderRow
              }
            >

              {CALENDAR_HEADER_DAYS.map(
                (
                  d,
                  index
                ) => (

                  <Text

                    key={
                      index
                    }

                    style={
                      styles.calendarHeaderDayText
                    }
                  >

                    {d}

                  </Text>
                )
              )}

            </View>


            {/* CALENDAR */}

            <View
              style={
                styles.calendarGrid
              }
            >

              {calendarGrid.map(
                (
                  dayNum,
                  index
                ) => {

                  if (
                    dayNum ===
                    null
                  ) {

                    return (

                      <View

                        key={
                          `empty-${index}`
                        }

                        style={
                          styles.calendarCell
                        }
                      />
                    );
                  }


                  const cellDate =
                    new Date(
                      pickerYear,
                      pickerMonth,
                      dayNum
                    );


                  const isSelected =
                    cellDate.toDateString() ===
                    selectedDateObj.toDateString();


                  return (

                    <TouchableOpacity

                      key={
                        `day-${dayNum}`
                      }

                      style={[
                        styles.calendarCell,
                        isSelected &&
                          styles.selectedCalendarCell
                      ]}

                      onPress={
                        () => {

                          setSelectedDateObj(
                            cellDate
                          );


                          setDatePickerVisible(
                            false
                          );
                        }
                      }
                    >

                      <Text

                        style={[
                          styles.calendarCellText,
                          isSelected &&
                            styles.selectedCalendarCellText
                        ]}
                      >

                        {dayNum}

                      </Text>

                    </TouchableOpacity>
                  );
                }
              )}

            </View>

          </View>

        </View>

      </Modal>

    </SafeAreaView>
  );
}


// =====================================================
// STYLE
// =====================================================

const styles =
  StyleSheet.create({

    container: {

      flex: 1,

      backgroundColor:
        "#051124",
    },


    scrollContent: {

      paddingHorizontal:
        16,

      paddingTop:
        20,

      paddingBottom:
        100,
    },


    headerContainer: {

      alignItems:
        "center",

      marginBottom:
        16,
    },


    headerTitle: {

      fontSize:
        22,

      fontWeight:
        "bold",

      color:
        "#FFFFFF",

      marginBottom:
        4,
    },


    dateSelector: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        4,
    },


    dateSelectorText: {

      fontSize:
        14,

      color:
        "#FFFFFF",

      fontWeight:
        "500",
    },


    daysContainer: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      marginBottom:
        20,
    },


    dayItem: {

      alignItems:
        "center",

      paddingVertical:
        6,

      paddingHorizontal:
        8,

      borderRadius:
        8,
    },


    selectedDayItem: {

      backgroundColor:
        "#1E293B",
    },


    dayText: {

      fontSize:
        11,

      color:
        "#FFFFFF",

      marginBottom:
        4,

      fontWeight:
        "500",
    },


    selectedDayText: {

      color:
        "#38BDF8",
    },


    dateText: {

      fontSize:
        18,

      fontWeight:
        "bold",

      color:
        "#FFFFFF",
    },


    selectedDateText: {

      color:
        "#38BDF8",
    },


    graphCard: {

      backgroundColor:
        "#F3F6FA",

      borderRadius:
        16,

      padding:
        16,

      alignItems:
        "center",

      marginBottom:
        24,
    },


    graphTitle: {

      fontSize:
        20,

      fontWeight:
        "bold",

      color:
        "#000000",

      marginBottom:
        2,
    },


    graphSubtitle: {

      fontSize:
        12,

      color:
        "#64748B",

      fontWeight:
        "500",

      marginBottom:
        12,

      textAlign:
        "center",
    },


    chartWrapper: {

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    sectionTitle: {

      fontSize:
        20,

      fontWeight:
        "bold",

      color:
        "#FFFFFF",

      marginBottom:
        12,
    },


    emptyText: {

      color:
        "#94A3B8",

      textAlign:
        "center",

      marginTop:
        20,

      fontSize:
        15,

      fontWeight:
        "500",
    },


    historyCard: {

      backgroundColor:
        "#F3F6FA",

      borderRadius:
        14,

      paddingVertical:
        14,

      paddingHorizontal:
        16,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        12,
    },


    bookmarkIconWrapper: {

      marginRight:
        12,
    },


    historyTextContainer: {

      justifyContent:
        "center",

      flex:
        1,
    },


    historyTitle: {

      fontSize:
        18,

      fontWeight:
        "bold",

      color:
        "#000000",

      marginBottom:
        2,
    },


    historyTime: {

      fontSize:
        13,

      fontWeight:
        "bold",

      color:
        "#000000",
    },


    historyDetail: {

      fontSize:
        12,

      color:
        "#64748B",

      marginTop:
        3,
    },


    modalOverlay: {

      flex:
        1,

      backgroundColor:
        "rgba(0,0,0,0.6)",

      justifyContent:
        "center",

      alignItems:
        "center",
    },


    modalContent: {

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        16,

      width:
        "90%",

      padding:
        16,
    },


    modalHeader: {

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        16,
    },


    modalMonthTitle: {

      fontSize:
        16,

      fontWeight:
        "bold",

      color:
        "#0F172A",
    },


    navBtn: {

      padding:
        4,
    },


    closeBtn: {

      padding:
        4,

      marginLeft:
        8,
    },


    calendarHeaderRow: {

      flexDirection:
        "row",

      marginBottom:
        8,
    },


    calendarHeaderDayText: {

      width:
        "14.28%",

      textAlign:
        "center",

      fontWeight:
        "bold",

      color:
        "#64748B",

      fontSize:
        12,
    },


    calendarGrid: {

      flexDirection:
        "row",

      flexWrap:
        "wrap",
    },


    calendarCell: {

      width:
        "14.28%",

      aspectRatio:
        1,

      justifyContent:
        "center",

      alignItems:
        "center",

      borderRadius:
        20,
    },


    selectedCalendarCell: {

      backgroundColor:
        "#2563EB",
    },


    calendarCellText: {

      fontSize:
        14,

      fontWeight:
        "600",

      color:
        "#0F172A",
    },


    selectedCalendarCellText: {

      color:
        "#FFFFFF",
    },
  });

  