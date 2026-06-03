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

## 4. Local Storage: react-native-mmkv
* **Why chosen:** The fastest key-value storage for React Native. It's synchronous, meaning no `async/await` overhead when reading/writing timer state or session data, which is crucial for a timer app's performance.
* **Alternative considered:** AsyncStorage.
* **Tradeoffs:** MMKV requires a native build (handled easily by Expo prebuild/development builds), whereas AsyncStorage is purely JS but significantly slower.

## 5. Styling: NativeWind (Tailwind CSS for React Native)
* **Why chosen:** NativeWind brings Tailwind CSS to React Native, allowing rapid, responsive, and consistent UI design. AI models are highly proficient with Tailwind utility classes, accelerating development.
* **Alternative considered:** React Native StyleSheet or Tamagui.
* **Tradeoffs:** Requires initial setup (Babel and Tailwind config), but eliminates boilerplate styling code, resulting in faster prototyping.

## 6. Date & Time Manipulation: date-fns
* **Why chosen:** Modular, modern, and comprehensive date utility library. Essential for the Calendar (PLAN vs REAL) and Timer features.
* **Alternative considered:** Moment.js or Day.js.
* **Tradeoffs:** Moment is deprecated. Day.js is great but relies on plugins which can be annoying to configure. `date-fns` allows importing only what you need (e.g., `import { format, differenceInMinutes } from 'date-fns'`), keeping the bundle small.

## Summary of External Dependencies (7 total)
1. `expo`
2. `expo-router`
3. `zustand`
4. `react-native-mmkv`
5. `react-native-safe-area-context`
6. `nativewind`
7. `date-fns`
