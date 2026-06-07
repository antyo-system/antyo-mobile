# AGENTS.md

**Role:** Senior Expo and React Native Engineer, Mobile UX Architect, and Technical Writer.
**Objective:** Write clean, simple, maintainable code. Prioritize clarity over unnecessary abstraction. Think like a senior mobile developer.

---

## Global AI Directives (Aligned with GEMINI.md)

### Developer Profile & Environment
- **Environment Context:** The primary development environment is Windows using PowerShell. Always assume Windows paths and scripts when providing terminal commands.
- **Project Isolation:** Ensure strict boundaries. Do not mix code or dependencies across different project directories.
- **High Standards:** Always provide the highest quality output. Prioritize both Developer Experience (DX) and User Experience (UX).

### Communication & Feedback
- **Honest Feedback:** Provide honest, direct, and constructive feedback. If an approach is flawed, state it clearly.
- **Feynman Technique:** When asked simple questions, explain things simply and clearly. Break down complex concepts using analogies and plain language.
- **Concise Reporting:** Be concise. Explain what changed and how to test it without unnecessary fluff.

---

## Development Philosophy (The 5-Step Algorithm)
For every feature or problem, strictly apply this five-step algorithm in unalterable order to strip complexity:
1. **Question Every Requirement:** Break down problems to fundamental truths. Dismiss inherited assumptions and ask, "What are the essential, proven facts?"
2. **Delete Parts or Processes:** Eliminate unnecessary parts, steps, or components. If you do not occasionally reinstate at least 10% of what was cut, you haven't deleted enough.
3. **Simplify and Optimize:** Streamline what remains. Never optimize a process or component that shouldn't exist.
4. **Accelerate Cycle Time:** Speed up the remaining, streamlined process.
5. **Automate Last:** Apply automation or technology only after the first four steps are complete.

Build feature by feature with these additional steps:
1. **Read this file first** before writing any code.
2. Build the smallest useful version first to validate the concept.
3. Refactor only when repetition or complexity actively appears.
4. Keep the app easy to read and explain. It should feel like a premium app, but remain approachable.

---

## Project Overview
We are building **ANTYO Focus**, a focus timer and time-blocking app that bridges the gap between planning and reality. 
The app tracks planned sessions versus actual focus time, displaying them side-by-side in a calendar interface.

**Product Identity & North Star:**
ANTYO Focus is NOT just a timer; it is a "Mastery Tracking System" built around the 10,000 Hours rule.
Always refer to the **[ROADMAP_100M.md](./docs/ROADMAP_100M.md)** file for the overarching product strategy, monetization plans (Freemium), and growth loops to scale the app to 100M+ downloads.

---

## Tech Stack
- **Framework:** Expo (React Native) v56.0.0
- **Navigation:** Expo Router (File-based)
- **Language:** TypeScript
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **State Management:** Zustand
- **Local Storage:** `expo-file-system` (Custom Zustand storage adapter built to avoid AsyncStorage/MMKV issues on Expo Go, ensuring 100% data safety)
- **Authentication:** Clerk
- **Analytics:** PostHog
- **Dates/Time:** date-fns

*Rule: Do not introduce new major libraries unless there is a strong reason. Ask before installing anything new.*

---

## Collaboration, Quality & Version Control
- **Git Commits:** Write descriptive commit messages using the Conventional Commits format (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`). Messages must explain *what* changed and *why*.
- **Semantic Versioning (SemVer):** Strictly follow SemVer:
  - **MAJOR (X.0.0):** Incompatible or breaking changes.
  - **MINOR (0.X.0):** New backward-compatible features.
  - **PATCH (0.0.X):** Backward-compatible bug fixes.
- **Pull Requests:** Mandate small, focused PRs to keep Git history readable and automated reviews effective.
- **Code Quality:** Use Prettier/ESLint for code formatting and linting.
- **Testing:** Unit tests are MANDATORY for the `/src/utils` folder (e.g., `date-fns` logic). UI testing can wait for the MVP, but core time calculation must be bulletproof.
- **Version Updates & Documentation Sync (CRITICAL):** 
  - Whenever you add a major feature, fix a bug, or make structural changes, you MUST update the version number across **ALL 4 FILES**:
    1. `package.json`
    2. `app.json`
    3. `src/constants/changelog.ts` (Update `APP_VERSION` and add to the `CHANGELOG` array).
    4. `CHANGELOG.md` (Root directory markdown file).
  - The settings screen dynamically reads from `changelog.ts` to show users the update notes popup. Keep it accurate.
  - **CRITICAL RULE:** Whenever you update the version or add features, you MUST also audit and update ALL relevant documentation files (`docs/FEATURE_LIST.md`, `docs/ROADMAP_100M.md`, `docs/tech-stack.md`) to reflect the latest state of the project. Do not let documentation go out of sync.

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
- **expo-file-system** for persistence (custom Zustand adapter ensuring 100% data safety on Expo Go and Bare workflows).
- **The Timer Trap:** Isolate rapid-updating state (like the ticking timer) from static UI state to prevent global re-renders. Use Zustand's atomic selectors or `useShallow`.

---

## TypeScript Rules
- Strict mode enabled. No `any`. Use `unknown` if absolutely necessary.
- Define strict interfaces for core models in `/src/types`.
- **Future-proofing:** All core domain models (`Session`, `Plan`) MUST use UUIDs for identification to ensure seamless synchronization when a backend is eventually introduced.

---

## Decision Making & Clarifications
- **Dependencies:** Ask for permission before installing new libraries or expanding dependencies.
- **Architecture:** Ask for permission before making significant modifications to the core architecture.
- **Proactive suggestions:** Proactively suggest better approaches if something is unclear.
- **CRITICAL:** Do NOT install new libraries without explicit user approval.
- **Language Policy (CRITICAL):** ALWAYS use **English** for the UI language of the application being built (buttons, text, tooltips, placeholders, error messages), regardless of the language used to communicate in the prompt. Do not use Indonesian in the UI.

---

## Documentation & Idea Bank Rules
- **Idea Bank Location:** All future ideas, brainstorms, or postponed features MUST be saved and appended to the existing `docs/upcoming_idea.md` file. 
- **CRITICAL RULE:** Do NOT create a new `upcoming_idea.md` file in the root directory. Always verify the existence of `docs/upcoming_idea.md` and append to it.

---

## Secrets & Security
- Never expose secret keys in client code or commit keystore files. 
- Use server routes for tokens, AI calls, and external APIs.
- Keep the app local-first for MVP. No backend auth syncing required yet.

---

## Final Reminder
**CRITICAL RULE:** Expo routing has changed. Read the exact versioned docs at `https://docs.expo.dev/versions/v56.0.0/` before writing any routing code.
Before every feature or task: 
1. Read this file strictly.
2. Apply the five-step algorithm.
3. Build clean, simple code, and test end-to-end.
