import { registerWebModule, NativeModule } from 'expo';

// SmartCameraModule is not available on the web platform.
class SmartCameraModule extends NativeModule<{}> {}

export default registerWebModule(SmartCameraModule, 'SmartCameraModule');
