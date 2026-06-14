import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';
import { ViewProps } from 'react-native';

export type SmartCameraViewProps = {
  onStatusChanged?: (event: { nativeEvent: { isDistracted: boolean } }) => void;
  onFacesDetected?: (event: { nativeEvent: { x: number, y: number, width: number, height: number } }) => void;
} & ViewProps;

const NativeView: React.ComponentType<SmartCameraViewProps> =
  requireNativeViewManager('SmartCamera');

export default function SmartCameraView(props: SmartCameraViewProps) {
  return <NativeView {...props} />;
}
