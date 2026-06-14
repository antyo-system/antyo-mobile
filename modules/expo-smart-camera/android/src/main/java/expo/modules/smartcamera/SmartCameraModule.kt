package expo.modules.smartcamera

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SmartCameraModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SmartCamera")

    View(SmartCameraView::class) {
      Events("onStatusChanged", "onFacesDetected")
    }
  }
}
