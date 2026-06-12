# Expo + React Native Stack Recommendation

This stack is optimized for **AI tooling support**, **documentation quality**, and **time to first feature**, keeping external dependencies strictly under 10.

## 1. Framework: Expo
* **Why chosen:** Expo is the absolute standard for React Native development today. It provides excellent documentation, rapid setup, and seamless over-the-air updates. AI tools understand Expo perfectly due to its vast, standardized ecosystem.
* **Alternative considered:** React Native CLI.
* **Tradeoffs:** React Native CLI offers more control over native code from day one, but Expo's Continuous Native Generation (CNG) handles 99% of native modules without the boilerplate, drastically reducing time to first feature.

## 2. Routing & Navigation: Expo Router
* **Why chosen:** File-based routing built on top of React Navigation. It's officially supported by Expo, reduces navigation boilerplate, and handles deep linking automatically.
* **Alternative considered:** React Navigation (raw).
* **Tradeoffs:** Expo Router enforces a specific file structure, but it significantly speeds up screen creation and makes the app architecture more predictable for AI assistants.

## 3. State Management: Zustand
* **Why chosen:** Extremely lightweight, boilerplate-free state management. It works beautifully with React hooks and is much easier for AI to generate and maintain compared to Redux.
* **Alternative considered:** Redux Toolkit or React Context.
* **Tradeoffs:** Redux is too heavy for a simple timer/calendar app. React Context can lead to unnecessary re-renders if not optimized. Zustand strikes the perfect balance for an MVP.

## 4. Local Storage: expo-file-system (Custom Zustand Adapter)
* **Why chosen:** Ensures 100% data safety and compatibility across both Expo Go and bare native builds. We built a custom JSON storage adapter for Zustand using the file system to avoid the asynchronous quirks and unreliability of AsyncStorage.
* **Alternative considered:** react-native-mmkv / AsyncStorage.
* **Tradeoffs:** Writing to the file system is slightly slower than memory-mapped MMKV, but it eliminates the need for native dev clients during the early rapid prototyping phase (Expo Go support) while being far more reliable than AsyncStorage.

## 5. Styling: NativeWind (Tailwind CSS for React Native)
* **Why chosen:** NativeWind brings Tailwind CSS to React Native, allowing rapid, responsive, and consistent UI design. AI models are highly proficient with Tailwind utility classes, accelerating development.
* **Alternative considered:** React Native StyleSheet or Tamagui.
* **Tradeoffs:** Requires initial setup (Babel and Tailwind config), but eliminates boilerplate styling code, resulting in faster prototyping.

## 6. Date & Time Manipulation: date-fns
* **Why chosen:** Modular, modern, and comprehensive date utility library. Essential for the Calendar (PLAN vs REAL) and Timer features.
* **Alternative considered:** Moment.js or Day.js.
* **Tradeoffs:** Moment is deprecated. Day.js is great but relies on plugins which can be annoying to configure. `date-fns` allows importing only what you need (e.g., `import { format, differenceInMinutes } from 'date-fns'`), keeping the bundle small.

## Summary of External Dependencies (Categorized)

### Core Framework & Navigation
- `expo` (and native dependencies)
- `react` & `react-dom`
- `react-native` & `react-native-web`
- `expo-router` & `@react-navigation/native`
- `react-native-screens` & `react-native-safe-area-context`

### State & Storage
- `zustand`
- `expo-file-system` (used for our 100% data-safe custom local JSON store adapter)
- `react-native-mmkv`

### Styling & Visuals
- `nativewind` & `tailwindcss`
- `react-native-css-interop`
- `react-native-svg` (for vector charts and visuals)
- `@gorhom/bottom-sheet` & `react-native-gesture-handler`
- `react-native-reanimated`

### Utilities & Device Integration
- `date-fns` (for complex date/time calculations)
- `expo-notifications` (for plan reminders and triggers)
- `expo-haptics` (for interactive, tactile feedback)
- `expo-keep-awake` (prevent screen sleep during active focus sessions)
- `expo-sharing` & `expo-document-picker` (data export and backup)
- `expo-localization` & `expo-constants`
- `expo-device` & `expo-image`
- `expo-splash-screen`, `expo-status-bar`, `expo-symbols`, `expo-system-ui`, `expo-web-browser`

