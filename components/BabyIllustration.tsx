import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface Props {
  week: number;
  size?: number;
}

function getStageConfig(week: number) {
  if (week <= 6) {
    return {
      name: 'seed',
      coreSize: 14,
      coreColor: '#E8C4A0',
      rings: [
        { size: 26, color: '#F0D5B8', opacity: 0.7 },
        { size: 38, color: '#F5E5CC', opacity: 0.4 },
      ],
      petals: [],
      leaves: [],
    };
  }
  if (week <= 10) {
    return {
      name: 'sprout',
      coreSize: 18,
      coreColor: '#D4A870',
      rings: [
        { size: 32, color: '#EAC898', opacity: 0.6 },
        { size: 48, color: '#F5DDB8', opacity: 0.35 },
      ],
      petals: [
        { angle: -30, length: 18, width: 8, color: '#A8C4A8', opacity: 0.8 },
        { angle: 20, length: 14, width: 7, color: '#B8D0B8', opacity: 0.7 },
      ],
      leaves: [],
    };
  }
  if (week <= 16) {
    return {
      name: 'bud',
      coreSize: 22,
      coreColor: '#C4907A',
      rings: [
        { size: 40, color: '#E8B8A0', opacity: 0.55 },
        { size: 58, color: '#F5D5C0', opacity: 0.3 },
        { size: 72, color: '#FAE8DC', opacity: 0.15 },
      ],
      petals: [
        { angle: -50, length: 22, width: 10, color: '#A8C4A8', opacity: 0.85 },
        { angle: 10, length: 26, width: 9, color: '#B5CDB5', opacity: 0.75 },
        { angle: -15, length: 20, width: 8, color: '#C0D5C0', opacity: 0.7 },
      ],
      leaves: [],
    };
  }
  if (week <= 24) {
    return {
      name: 'bloom',
      coreSize: 28,
      coreColor: '#C08070',
      rings: [
        { size: 48, color: '#E0A890', opacity: 0.6 },
        { size: 66, color: '#EEC8B0', opacity: 0.4 },
        { size: 84, color: '#F5DDD0', opacity: 0.2 },
      ],
      petals: [
        { angle: -60, length: 28, width: 12, color: '#C4A8D0', opacity: 0.8 },
        { angle: -20, length: 30, width: 11, color: '#D0B8D8', opacity: 0.75 },
        { angle: 25, length: 26, width: 12, color: '#BAAAC8', opacity: 0.7 },
        { angle: 65, length: 24, width: 10, color: '#C8B5D4', opacity: 0.65 },
      ],
      leaves: [
        { angle: -80, length: 20, width: 9, color: '#A0C0A8' },
        { angle: 80, length: 18, width: 8, color: '#A8C4B0' },
      ],
    };
  }
  if (week <= 32) {
    return {
      name: 'fullbloom',
      coreSize: 34,
      coreColor: '#B87868',
      rings: [
        { size: 58, color: '#D89E88', opacity: 0.65 },
        { size: 78, color: '#EAC0A8', opacity: 0.45 },
        { size: 96, color: '#F5D8C8', opacity: 0.25 },
        { size: 112, color: '#FDE8DC', opacity: 0.12 },
      ],
      petals: [
        { angle: -70, length: 32, width: 13, color: '#C4A8D0', opacity: 0.85 },
        { angle: -35, length: 34, width: 12, color: '#D0B5D8', opacity: 0.8 },
        { angle: 0, length: 36, width: 14, color: '#BCAACB', opacity: 0.75 },
        { angle: 38, length: 32, width: 13, color: '#CAB8D5', opacity: 0.72 },
        { angle: 72, length: 30, width: 12, color: '#D5C0DC', opacity: 0.68 },
      ],
      leaves: [
        { angle: -88, length: 26, width: 11, color: '#98B8A0' },
        { angle: 85, length: 24, width: 10, color: '#A0BCA8' },
        { angle: -45, length: 16, width: 7, color: '#A8C4B0' },
      ],
    };
  }
  return {
    name: 'radiant',
    coreSize: 40,
    coreColor: '#B07060',
    rings: [
      { size: 66, color: '#D09080', opacity: 0.65 },
      { size: 88, color: '#E8B8A0', opacity: 0.45 },
      { size: 108, color: '#F4D0B8', opacity: 0.28 },
      { size: 126, color: '#FBE5D0', opacity: 0.15 },
      { size: 142, color: '#FEF0E5', opacity: 0.08 },
    ],
    petals: [
      { angle: -75, length: 36, width: 14, color: '#C4A8D0', opacity: 0.88 },
      { angle: -45, length: 38, width: 13, color: '#CDB5D8', opacity: 0.83 },
      { angle: -12, length: 40, width: 15, color: '#B8A5CC', opacity: 0.8 },
      { angle: 22, length: 38, width: 13, color: '#CABAD8', opacity: 0.76 },
      { angle: 55, length: 36, width: 14, color: '#D5C0DC', opacity: 0.72 },
      { angle: 82, length: 32, width: 12, color: '#DCC8E4', opacity: 0.68 },
    ],
    leaves: [
      { angle: -90, length: 30, width: 12, color: '#92B49A' },
      { angle: 88, length: 28, width: 11, color: '#9ABCA2' },
      { angle: -55, length: 20, width: 9, color: '#A2C0AA' },
      { angle: 58, length: 18, width: 8, color: '#A8C4B0' },
    ],
  };
}

function PetalShape({ angle, length, width, color, opacity = 1 }: {
  angle: number;
  length: number;
  width: number;
  color: string;
  opacity?: number;
}) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * length;
  const y = Math.sin(rad) * length;

  return (
    <View
      style={{
        position: 'absolute',
        width: width,
        height: length * 2,
        backgroundColor: color,
        borderRadius: width / 2,
        opacity,
        left: -width / 2 + x * 0.5,
        top: -length + y * 0.5,
        transform: [{ rotate: `${angle + 90}deg` }],
      }}
    />
  );
}

export function BabyIllustration({ week, size = 130 }: Props) {
  const config = getStageConfig(week);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 2800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 18000, useNativeDriver: true })
    ).start();
  }, []);

  const rotateInterp = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const containerSize = size;
  const center = containerSize / 2;

  return (
    <View style={[styles.wrapper, { width: containerSize, height: containerSize }]}>
      {/* Outer rings */}
      {config.rings.map((ring, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: ring.size,
            height: ring.size,
            borderRadius: ring.size / 2,
            backgroundColor: ring.color,
            opacity: ring.opacity,
            left: center - ring.size / 2,
            top: center - ring.size / 2,
          }}
        />
      ))}

      {/* Petals (slow rotation) */}
      <Animated.View
        style={{
          position: 'absolute',
          width: containerSize,
          height: containerSize,
          transform: [{ rotate: rotateInterp }],
        }}
      >
        {config.petals.map((petal, i) => (
          <PetalShape
            key={i}
            angle={petal.angle}
            length={petal.length}
            width={petal.width}
            color={petal.color}
            opacity={petal.opacity}
          />
        ))}
        {config.leaves.map((leaf, i) => (
          <PetalShape
            key={`l${i}`}
            angle={leaf.angle}
            length={leaf.length}
            width={leaf.width}
            color={leaf.color}
            opacity={0.9}
          />
        ))}
      </Animated.View>

      {/* Core — pulsing */}
      <Animated.View
        style={{
          position: 'absolute',
          width: config.coreSize,
          height: config.coreSize,
          borderRadius: config.coreSize / 2,
          backgroundColor: config.coreColor,
          left: center - config.coreSize / 2,
          top: center - config.coreSize / 2,
          transform: [{ scale: pulseAnim }],
          shadowColor: config.coreColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 4,
        }}
      />

      {/* Inner core highlight */}
      <View
        style={{
          position: 'absolute',
          width: config.coreSize * 0.45,
          height: config.coreSize * 0.45,
          borderRadius: config.coreSize,
          backgroundColor: 'rgba(255,255,255,0.35)',
          left: center - config.coreSize * 0.45 / 2 - config.coreSize * 0.08,
          top: center - config.coreSize * 0.45 / 2 - config.coreSize * 0.08,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
