import React from 'react';
import { Modal, View, Text, Pressable, Dimensions, useColorScheme, Animated, Platform } from 'react-native';
import Svg, { Defs, Rect, Mask, Circle } from 'react-native-svg';

export interface SpotlightCoords {
  x: number;
  y: number;
  width: number;
  height: number;
  rootHeight?: number; // Added to fix tooltip positioning
}

export interface SpotlightStep {
  targetRef?: any; // any is used to avoid strict RefObject<View> vs RefObject<View | null> errors
  coords?: SpotlightCoords; // Fallback for manual coords
  text: string;
  holeType?: 'circle' | 'rect';
  holePadding?: number;
  buttonText?: string;
}

interface SpotlightOverlayProps {
  visible: boolean;
  steps: SpotlightStep[];
  onFinish: () => void;
  rootRef?: any; // any to avoid strict RefObject errors
  onStepChange?: (index: number) => void;
}

export function SpotlightOverlay({ 
  visible,
  steps,
  onFinish,
  rootRef,
  onStepChange,
}: SpotlightOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const [activeCoords, setActiveCoords] = React.useState<SpotlightCoords | null>(null);

  // Reset step when becoming visible
  React.useEffect(() => {
    if (visible) {
      setCurrentStepIndex(0);
      onStepChange?.(0);
    }
  }, [visible]);

  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [isRendered, setIsRendered] = React.useState(visible);

  React.useEffect(() => {
    if (visible) {
      setIsRendered(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsRendered(false);
      });
    }
  }, [visible, fadeAnim]);

  // Dynamic Measurement Logic
  React.useEffect(() => {
    if (!visible || steps.length === 0) return;
    
    const step = steps[currentStepIndex];
    if (step.coords) {
      setActiveCoords({ ...step.coords, rootHeight: step.coords.rootHeight || screenHeight });
      return;
    }

    if (step.targetRef?.current && rootRef?.current) {
      const measure = () => {
        if (Platform.OS === 'web') {
          const rootNode = rootRef.current as any;
          const node = step.targetRef?.current as any;
          if (rootNode.getBoundingClientRect && node.getBoundingClientRect) {
            const rootRect = rootNode.getBoundingClientRect();
            const rect = node.getBoundingClientRect();
            setActiveCoords({
              x: rect.left - rootRect.left,
              y: rect.top - rootRect.top,
              width: rect.width,
              height: rect.height,
              rootHeight: rootRect.height
            });
            return;
          }
        }
        
        // Native fallback
        rootRef.current?.measure((_rx: any, _ry: any, _rw: any, rootH: number, rootPageX: number, rootPageY: number) => {
          step.targetRef?.current?.measure((_x: any, _y: any, w: number, h: number, pageX: number, pageY: number) => {
            // Check for valid coords because measure can sometimes fail briefly during layout
            if (pageX !== undefined && rootPageX !== undefined) {
              setActiveCoords({
                x: pageX - rootPageX,
                y: pageY - rootPageY,
                width: w,
                height: h,
                rootHeight: rootH
              });
            }
          });
        });
      };

      // Measure immediately
      measure();
      
      // On web, we use resize listener. On Native, we use short delays.
      // We add a 400ms delay for both to guarantee scroll animations (like scrollToEnd) have finished.
      let timeoutId: NodeJS.Timeout;
      let timeoutId2: NodeJS.Timeout;
      
      if (Platform.OS === 'web') {
        window.addEventListener('resize', measure);
        timeoutId2 = setTimeout(measure, 400);
        return () => {
          window.removeEventListener('resize', measure);
          clearTimeout(timeoutId2);
        };
      } else {
        timeoutId = setTimeout(measure, 150);
        timeoutId2 = setTimeout(measure, 400);
        return () => {
          clearTimeout(timeoutId);
          clearTimeout(timeoutId2);
        };
      }
    }
  }, [currentStepIndex, visible, steps, rootRef]);

  if (!isRendered || steps.length === 0) return null;

  const currentStep = steps[currentStepIndex];
  const { text, holeType = 'rect', holePadding = 8 } = currentStep;

  // Fallback to center if coords not ready
  const safeCoords = activeCoords || { x: screenWidth / 2 - 50, y: screenHeight / 2 - 50, width: 100, height: 100, rootHeight: screenHeight };
  const rHeight = safeCoords.rootHeight || screenHeight;
  
  const paddedX = safeCoords.x - holePadding;
  const paddedY = safeCoords.y - holePadding;
  const paddedWidth = safeCoords.width + (holePadding * 2);
  const paddedHeight = safeCoords.height + (holePadding * 2);

  // Compute radius for circle
  const cx = safeCoords.x + safeCoords.width / 2;
  const cy = safeCoords.y + safeCoords.height / 2;
  const r = Math.max(safeCoords.width, safeCoords.height) / 2 + holePadding;

  // Position tooltip where there is MORE space (Above vs Below)
  const spaceAbove = paddedY;
  const spaceBelow = rHeight - (paddedY + paddedHeight);
  
  let tooltipTop: number | string | undefined = undefined;
  let tooltipBottom: number | string | undefined = undefined;
  let tooltipJustify: 'center' | 'flex-start' | 'flex-end' | undefined = undefined;

  // If the hole is giant (takes up most of the screen), place it near the bottom so it doesn't block the middle content
  if (spaceAbove < 200 && spaceBelow < 200) {
    tooltipTop = undefined;
    tooltipBottom = 140;
    tooltipJustify = undefined;
  } else if (spaceBelow >= spaceAbove) {
    tooltipTop = paddedY + paddedHeight + 24;
  } else {
    tooltipBottom = rHeight - paddedY + 24;
  }

  return (
    <Animated.View 
      style={{
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        zIndex: 9999,
        opacity: fadeAnim,
      }}
      pointerEvents={visible ? 'auto' : 'none'}
    >
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

        {activeCoords && (
          <View style={{ position: 'absolute', top: tooltipTop, bottom: tooltipBottom, justifyContent: tooltipJustify, width: '100%', paddingHorizontal: 24 }}>
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
                    const handleNext = () => {
                      if (currentStepIndex < steps.length - 1) {
                        const nextIndex = currentStepIndex + 1;
                        setCurrentStepIndex(nextIndex);
                        onStepChange?.(nextIndex);
                      } else {
                        onFinish();
                      }
                    };
                    handleNext();
                  }} 
                  className="px-6 py-3 bg-blue-600 rounded-2xl active:bg-blue-700"
                >
                  <Text className="text-white font-black uppercase tracking-widest text-xs">
                    {currentStep.buttonText || (currentStepIndex < steps.length - 1 ? 'NEXT' : 'GOT IT')}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
