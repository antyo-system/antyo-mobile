$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME="C:\Users\Infinix\AppData\Local\Android\Sdk"
$env:Path += ";C:\Program Files\Android\Android Studio\jbr\bin;C:\Users\Infinix\AppData\Local\Android\Sdk\platform-tools;C:\Users\Infinix\AppData\Local\Android\Sdk\emulator"

Write-Host "Running Android Build..."
npx expo run:android
