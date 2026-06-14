package expo.modules.smartcamera

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Matrix
import android.util.Log
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.camera.core.AspectRatio
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.facedetector.FaceDetector
import com.google.mediapipe.tasks.vision.facedetector.FaceDetectorResult
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class SmartCameraView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
    private val previewView = PreviewView(context)
    private var cameraProvider: ProcessCameraProvider? = null
    private var faceDetector: FaceDetector? = null
    private val cameraExecutor: ExecutorService = Executors.newSingleThreadExecutor()

    val onStatusChanged by EventDispatcher<Map<String, Any>>()
    val onFacesDetected by EventDispatcher<Map<String, Any>>()

    init {
        previewView.layoutParams = LayoutParams(
            LayoutParams.MATCH_PARENT,
            LayoutParams.MATCH_PARENT
        )
        addView(previewView)
        setupMediaPipe()
        startCamera()
    }

    private fun setupMediaPipe() {
        try {
            val baseOptions = BaseOptions.builder()
                .setModelAssetPath("blaze_face_short_range.task")
                .build()

            val options = FaceDetector.FaceDetectorOptions.builder()
                .setBaseOptions(baseOptions)
                .setRunningMode(RunningMode.LIVE_STREAM)
                .setMinDetectionConfidence(0.5f)
                .setResultListener(this::returnLivestreamResult)
                .setErrorListener { error ->
                    Log.e("SmartCamera", "FaceDetector Error: \${error.message}")
                }
                .build()

            faceDetector = FaceDetector.createFromOptions(context, options)
        } catch (e: Exception) {
            Log.e("SmartCamera", "Failed to initialize MediaPipe FaceDetector", e)
        }
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        cameraProviderFuture.addListener({
            cameraProvider = cameraProviderFuture.get()
            bindCameraUseCases()
        }, ContextCompat.getMainExecutor(context))
    }

    private fun bindCameraUseCases() {
        val cameraProvider = cameraProvider ?: return
        val lifecycleOwner = appContext.currentActivity as? LifecycleOwner ?: return

        val preview = Preview.Builder()
            .setTargetAspectRatio(AspectRatio.RATIO_4_3)
            .build()
            .also {
                it.setSurfaceProvider(previewView.surfaceProvider)
            }

        val imageAnalyzer = ImageAnalysis.Builder()
            .setTargetAspectRatio(AspectRatio.RATIO_4_3)
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
            .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_RGBA_8888)
            .build()
            .also {
                it.setAnalyzer(cameraExecutor) { imageProxy ->
                    detectFaces(imageProxy)
                }
            }

        val cameraSelector = CameraSelector.Builder()
            .requireLensFacing(CameraSelector.LENS_FACING_FRONT)
            .build()

        try {
            cameraProvider.unbindAll()
            cameraProvider.bindToLifecycle(
                lifecycleOwner,
                cameraSelector,
                preview,
                imageAnalyzer
            )
        } catch (exc: Exception) {
            Log.e("SmartCamera", "Use case binding failed", exc)
        }
    }

    private fun detectFaces(imageProxy: ImageProxy) {
        if (faceDetector == null) {
            imageProxy.close()
            return
        }

        val bitmapBuffer = Bitmap.createBitmap(
            imageProxy.width,
            imageProxy.height,
            Bitmap.Config.ARGB_8888
        )
        imageProxy.planes[0].buffer.rewind()
        bitmapBuffer.copyPixelsFromBuffer(imageProxy.planes[0].buffer)

        // Rotate bitmap
        val matrix = Matrix()
        matrix.postRotate(imageProxy.imageInfo.rotationDegrees.toFloat())
        // Mirror for front camera
        matrix.postScale(-1f, 1f, imageProxy.width.toFloat() / 2, imageProxy.height.toFloat() / 2)

        val rotatedBitmap = Bitmap.createBitmap(
            bitmapBuffer, 0, 0, bitmapBuffer.width, bitmapBuffer.height, matrix, true
        )

        val mpImage = BitmapImageBuilder(rotatedBitmap).build()
        val timestampMs = System.currentTimeMillis()

        try {
            faceDetector?.detectAsync(mpImage, timestampMs)
        } catch (e: Exception) {
            Log.e("SmartCamera", "Error detecting faces", e)
        } finally {
            imageProxy.close()
        }
    }

    private fun returnLivestreamResult(
        result: FaceDetectorResult,
        input: MPImage
    ) {
        val width = input.width
        val height = input.height
        val screenArea = width * height

        if (result.detections().isNotEmpty()) {
            val face = result.detections()[0]
            val bbox = face.boundingBox()
            val faceArea = bbox.width() * bbox.height()

            val isFocused = faceArea > 0.05f * screenArea.toFloat()

            onStatusChanged(mapOf("isDistracted" to !isFocused))
            
            // Scaled bounds for UI rendering (0-1 range to scale on JS side)
            onFacesDetected(mapOf(
                "x" to (bbox.left / width.toFloat()),
                "y" to (bbox.top / height.toFloat()),
                "width" to (bbox.width() / width.toFloat()),
                "height" to (bbox.height() / height.toFloat())
            ))
        } else {
            onStatusChanged(mapOf("isDistracted" to true))
            onFacesDetected(mapOf())
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        cameraExecutor.shutdown()
        faceDetector?.close()
    }
}
