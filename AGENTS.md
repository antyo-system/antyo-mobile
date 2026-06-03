# AGENTS.md

**Role:** Senior Expo and React Native Engineer, Mobile UX Architect, and Technical Writer.
**Objective:** Write clean, simple, maintainable code. Prioritize clarity over unnecessary abstraction. Think like a senior mobile developer.

---

## Project Overview
We are building **ANTYO Focus**, a focus timer and time-blocking app that bridges the gap between planning and reality. 
The app tracks planned sessions versus actual focus time, displaying them side-by-side in a calendar interface.

---

## Tech Stack
- **Framework:** Expo (React Native) v56.0.0
- **Navigation:** Expo Router (File-based)
- **Language:** TypeScript
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **State Management:** Zustand
- **Local Storage:** `react-native-mmkv` (Strictly preferred over AsyncStorage for timer performance)
- **Authentication:** Clerk
- **Analytics:** PostHog
- **Dates/Time:** date-fns

*Rule: Do not introduce new major libraries unless there is a strong reason. Ask before installing anything new.*

---

## Development Philosophy
Build feature by feature. For every feature, strictly follow these steps:
1. **Read this file first** before writing any code.
2. Understand the user requirements completely.
3. Keep the implementation simple. Avoid overengineering at all costs.
4. Prefer readable code over clever code. 
5. Build the smallest useful version first to validate the concept.
6. Refactor only when repetition or complexity actively appears.
7. Keep the app easy to read and explain. It should feel like a premium app, but remain approachable for students.

---

## Collaboration, Quality & Testing
- **Version Control:** Strictly use Conventional Commits (e.g., `feat:`, `fix:`, `refactor:`).
- **Pull Requests:** Mandate small, focused PRs to make automated reviews (e.g., CodeRabbit) effective and keep Git history readable.
- **Code Quality:** Use Prettier/ESLint for code formatting and linting. Keep the codebase standardized across the team.
- **Testing:** Unit tests are MANDATORY for the `/src/utils` folder (e.g., `date-fns` logic). UI testing can wait for the MVP, but core time calculation must be bulletproof.

---

## Architecture & Folder Structure
Use this structured `src` and `app` architecture:

```text
/app             # Expo Router routes and screens only
  /(auth)        # Authentication flows
  /(tabs)        # Main tab navigation (Timer, Calendar, Stats)
  _layout.tsx    # Root layout with ErrorBoundary
  +not-found.tsx # Fallback route
/src
  /components    # Reusable UI (Buttons, Cards). Don't create too early.
  /constants     # Global constants, theme config, centralized images
  /data          # Hardcoded content and mock data (kept typed)
  /hooks         # Custom React hooks
  /lib           # External service helpers (clerk.ts, cn.ts, api.ts)
  /store         # Zustand stores (useTimerStore, useSessionStore)
  /types         # Global TypeScript interfaces
  /utils         # Pure, testable functions (e.g., date/time math)
  /assets        # Images, fonts, vector icons
```

**Architectural Rules:**
- **app/** is for routes/screens only. Screens compose components and call hooks/stores. No heavy business logic here.
- **Expo Router:** Always include a `+not-found.tsx` for deep linking fallbacks and use `ErrorBoundary` exports in `_layout.tsx` files.
- **Logic Separation:** Keep complex date/time calculations out of UI components. Extract them into `/src/utils`.

---

## UI Implementation Rules (VERY IMPORTANT)
- **From Scratch:** Create an original, premium, and unique implementation. The UI should not distract the user. Ensure PLAN vs REAL is clearly distinguishable.
- **From Design Reference:** When building from an attached design image, replicate the provided design exactly:
  - Match spacing, typography hierarchy, border radius, and shadows accurately.
  - Do not approximate. Do not simplify unless explicitly asked.
- Make the UI responsive for different screen sizes.

---

## Styling Rules
- **Strict NativeWind:** Use NativeWind (Tailwind CSS) classes strictly. 
- **Reusable Utilities:** Prefer reusable class patterns through utilities in `global.css` strictly following the **BEM** naming method.
- **Avoid Large Inline Styles:** Do not clutter components with massive inline `style={{...}}` objects unless dynamically required.

### Style Exception List
Use `StyleSheet.create` or inline styles ONLY for the following where NativeWind className is not supported or practical:
- `SafeAreaView` (className not supported)
- `KeyboardAvoidingView` (behavior props)
- `Modal` (visible, transparent props)
- `Animated.View` (animated style values)
- Dynamic styles calculated at runtime
- Platform-specific styles
- `Pressable` or `TouchableOpacity` pressed states
- Shadows (different per platform)

---

## Image & Asset Rules
- **Centralized Imports:** Check if `/src/constants/images.ts` exists. Import all assets there from `/src/assets/`, then use them via the centralized object. Do not import directly inside components.
- **Optimization:** Prefer vector formats (SVG via `react-native-svg`) or optimized WebP files to keep bundle size minimal.
- **Fallbacks:** Always implement fallback UI or skeleton loaders for network images.
- **Generation:** If generating placeholder images, ensure they match the premium aesthetic.

---

## State Management & Performance
- **Zustand** for global client state.
- **Local State** (`useState`) for temporary UI state.
- **react-native-mmkv** for persistence (critical for immediate timer data saving).
- **The Timer Trap:** Isolate rapid-updating state (like the ticking timer) from static UI state to prevent global re-renders. Use Zustand's atomic selectors or `useShallow`.

---

## TypeScript Rules
- Strict mode enabled. No `any`. Use `unknown` if absolutely necessary.
- Define strict interfaces for core models in `/src/types`.
- **Future-proofing:** All core domain models (`Session`, `Plan`) MUST use UUIDs for identification to ensure seamless synchronization when a backend is eventually introduced.

---

## Decision Making & Clarifications
- Proactively suggest better approaches if something is unclear.
- If a new library would significantly simplify things: **recommend it, explain why, and ask for permission** before installing. 
- **CRITICAL:** Do NOT install new libraries without explicit user approval.

---

## Secrets & Security
- Never expose secret keys in client code or commit keystore files. 
- Use server routes for tokens, AI calls, and external APIs.
- Keep the app local-first for MVP. No backend auth syncing required yet.

---

## Final Reminder
**CRITICAL RULE:** Expo routing has changed. Read the exact versioned docs at `https://docs.expo.dev/versions/v56.0.0/` before writing any routing code.
Before every feature: Read this file, follow it strictly, build clean code, and test end-to-end.
