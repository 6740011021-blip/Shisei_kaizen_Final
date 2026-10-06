import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Tabs } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Home, Calendar } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NAV_HEIGHT = 65;
const CIRCLE_SIZE = 54;

function CustomTabBar({ state, descriptors, navigation }: any) {
  const activeIndex = state.index;
  const tabWidth = SCREEN_WIDTH / 2;

  const animatedValue = useRef(new Animated.Value(activeIndex)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: activeIndex,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }).start();
  }, [activeIndex]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabWidth],
  });

  const buildCutoutPath = () => {
    const w = tabWidth;
    const h = NAV_HEIGHT;
    const cX = w / 2;
    const r = 36;

    return `
      M -${SCREEN_WIDTH},16 
      L ${cX - r - 10},16
      Q ${cX - r},16 ${cX - r + 8},20
      C ${cX - r + 16},28 ${cX - 22},48 ${cX},48
      C ${cX + 22},48 ${cX + r - 16},28 ${cX + r - 8},20
      Q ${cX + r},16 ${cX + r + 10},16
      L ${SCREEN_WIDTH * 2},16
      L ${SCREEN_WIDTH * 2},${h + 40}
      L -${SCREEN_WIDTH},${h + 40}
      Z
    `;
  };

  return (
    <View style={styles.container}>
      {/* พื้นหลัง SVG */}
      <Animated.View
        style={[
          styles.svgWrapper,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <Svg width={SCREEN_WIDTH * 3} height={NAV_HEIGHT + 40}>
          <Path d={buildCutoutPath()} fill="#273B69" />
        </Svg>
      </Animated.View>

      {/* วงกลมไอคอนลอย */}
      <Animated.View
        style={[
          styles.activeCircle,
          {
            transform: [
              {
                translateX: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    tabWidth / 2 - CIRCLE_SIZE / 2,
                    tabWidth + tabWidth / 2 - CIRCLE_SIZE / 2,
                  ],
                }),
              },
            ],
          },
        ]}
      >
        {activeIndex === 0 ? (
          <Home size={28} color="#0A1128" />
        ) : (
          <Calendar size={28} color="#0A1128" />
        )}
      </Animated.View>

      {/* ปุ่มกดสลับหน้า */}
      <View style={styles.navContent}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const label = index === 0 ? 'home' : 'statistics';

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabButton}
              activeOpacity={0.8}
              onPress={onPress}
            >
              <View style={styles.iconContainer}>
                {!isFocused && (
                  index === 0 ? (
                    <Home size={24} color="#A8B8D8" />
                  ) : (
                    <Calendar size={24} color="#A8B8D8" />
                  )
                )}
              </View>
              <Text style={[styles.navText, isFocused && styles.activeNavText]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="statistics" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: NAV_HEIGHT + (Platform.OS === 'ios' ? 25 : 15),
    backgroundColor: 'transparent',
  },
  svgWrapper: {
    position: 'absolute',
    top: 0,
    left: -SCREEN_WIDTH,
    width: SCREEN_WIDTH * 3,
    height: NAV_HEIGHT + 40,
  },
  activeCircle: {
    position: 'absolute',
    top: -4,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#C8D9EE',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 10,
  },
  navContent: {
    flexDirection: 'row',
    height: NAV_HEIGHT,
    marginTop: 15,
    zIndex: 20,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    color: '#7A8CAE',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  activeNavText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});