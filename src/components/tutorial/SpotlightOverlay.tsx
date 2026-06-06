import React from 'react';
import { Modal, View, Text, Pressable, Dimensions, useColorScheme } from 'react-native';
import Svg, { Defs, Rect, Mask, Circle } from 'react-native-svg';

export interface SpotlightCoords {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpotlightStep {
  coords: SpotlightCoords | null;
  text: string;
  holeType?: 'circle' | 'rect';
  holePadding?: number;
}

interface SpotlightOverlayProps {
  visible: boolean;
  steps: SpotlightStep[];
  onFinish: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function SpotlightOverlay({ 
  visible,
  steps, 
  onFinish,
}: SpotlightOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const isDark = useColorScheme() === 'dark';

  // Reset step when becoming visible
  React.useEffect(() => {
    if (visible) setCurrentStepIndex(0);
  }, [visible]);

  if (!visible || steps.length === 0) return null;

  const currentStep = steps[currentStepIndex];
  const { coords, text, holeType = 'rect', holePadding = 8 } = currentStep;

  // Fallback to center if coords not ready
  const safeCoords = coords || { x: screenWidth / 2 - 50, y: screenHeight / 2 - 50, width: 100, height: 100 };
  
  const paddedX = safeCoords.x - holePadding;
  const paddedY = safeCoords.y - holePadding;
  const paddedWidth = safeCoords.width + (holePadding * 2);
  const paddedHeight = safeCoords.height + (holePadding * 2);

  // Compute radius for circle
  const cx = safeCoords.x + safeCoords.width / 2;
  const cy = safeCoords.y + safeCoords.height / 2;
  const r = Math.max(safeCoords.width, safeCoords.height) / 2 + holePadding;

  // Position tooltip above or below
  const isTopHalf = safeCoords.y < screenHeight / 2;
  const tooltipTop = isTopHalf ? (paddedY + paddedHeight + 24) : undefined;
  const tooltipBottom = !isTopHalf ? (screenHeight - paddedY + 24) : undefined;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1">
        <Svg height="100%" width="100%" style={{ position: 'absolute' }}>
          <Defs>
            <Mask id="mask">
              <Rect x="0" y="0" width="100%" height="100%" fill="white" />
              {holeType === 'circle' ? (
                <Circle cx={cx} cy={cy} r={r} fill="black" />
              ) : (
                <Rect x={paddedX} y={paddedY} width={paddedWidth} height={paddedHeight} rx={16} ry={16} fill="black" />
              )}
            </Mask>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.85)" mask="url(#mask)" />
        </Svg>

        {coords && (
          <View style={{ position: 'absolute', top: tooltipTop, bottom: tooltipBottom, width: '100%', paddingHorizontal: 24 }}>
            <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
              <Text className="text-gray-900 dark:text-white font-bold mb-6 text-base leading-relaxed tracking-wide">
                {text}
              </Text>
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-gray-400 dark:text-gray-500 font-bold text-xs tracking-widest">
                  {currentStepIndex + 1} OF {steps.length}
                </Text>
                <Pressable 
                  onPress={() => {
                    if (currentStepIndex < steps.length - 1) {
                      setCurrentStepIndex(prev => prev + 1);
                    } else {
                      onFinish();
                    }
                  }} 
                  className="px-6 py-3 bg-blue-600 rounded-2xl active:bg-blue-700"
                >
                  <Text className="text-white font-black uppercase tracking-widest text-xs">
                    {currentStepIndex < steps.length - 1 ? 'NEXT' : 'GOT IT'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
