# AGENTS.md

Quick orientation for the Field Hockey Rule AI web app. Use this as a first-read map of the codebase.

## What this repo is
- React 18 + TypeScript SPA built with Vite.
- Chat UI for a Field Hockey rules RAG backend (FIH rules).

## How the app boots
- `src/main.tsx` mounts `App`.
- `src/App.tsx` wires providers (React Query, theme, tooltips, toasters), router, and analytics.
- Routes: `/` -> `src/pages/Index.tsx`, `*` -> `src/pages/NotFound.tsx`.

## Core runtime flow
- `src/pages/Index.tsx` composes the main UI:
  `ChatHeader`, `ChatSidebar`, `ChatMessage` list, `ChatInput`, `WelcomeScreen`, `AboutDialog`.
- Chat state is managed by `useChatWithConversations` which combines message flow + conversation persistence.

## Chat + conversations
- `src/hooks/useChatWithConversations.ts`: send message, show loading stub, call API, replace with response, track response time.
- `src/hooks/useConversations.ts`: localStorage-backed conversations, titles from first message, active conversation selection.
- `src/types/chat.ts`: message, conversation, and API type definitions.

## API integration
- `src/lib/api.ts`:
  - `POST /chat` with `{ query, history }`
  - `GET /health` for status indicator
  - Config via `VITE_API_BASE_URL` and `VITE_API_KEY` (defaults provided).

## UI components
- `src/components/ChatHeader.tsx`: title, health dot, theme toggle, about button.
- `src/components/ChatSidebar.tsx`: conversation list, new/delete controls.
- `src/components/ChatMessage.tsx`: markdown rendering, typewriter animation, copy button.
- `src/components/DebugTrace.tsx` + `src/components/SourceCard.tsx`: citations and metadata.
- `src/components/ChatInput.tsx`: text input + voice input (Web Speech API).
- `src/components/WelcomeScreen.tsx`: suggested prompts.
- `src/components/AboutDialog.tsx`: attribution and disclaimers.
- `src/components/ui/*`: shadcn/ui primitives.

## Hooks
- `src/hooks/useTypewriter.ts`: typewriter animation for assistant messages.
- `src/hooks/useVoiceInput.ts`: Web Speech API wrapper for voice transcription.
- `src/hooks/use-chat.ts`: legacy single-history chat (not used by `Index.tsx`).

## Tech stack summary
- React 18, Vite, TypeScript, React Router
- Tailwind CSS + shadcn/ui
- react-markdown for message rendering
- localStorage for persistence

## Android / Capacitor

The `android/` directory is a Capacitor wrapper for the web app.

### Capacitor commands
| Command | What it does |
|---------|--------------|
| `npx cap copy` | **Only copies web assets** from `dist/` to `android/app/src/main/assets/public/` — does NOT touch native build files |
| `npx cap sync` | Copies web assets AND updates native dependencies/plugins |
| `npx cap update` | Updates native plugins and Capacitor core libraries |
| `npx cap add android` | Creates the entire `android/` directory from scratch (destructive) |

**Typical workflow:** `npm run build && npx cap copy android`

### Custom state in `android/` (not regenerated)
These files contain manual customizations that would be lost if regenerating from scratch:
- `app/build.gradle` — release signing config (loads from `keystore.properties`), versionCode/versionName
- `build.gradle` — Gradle plugin version (`8.13.2`)
- `variables.gradle` — SDK targets (`compileSdkVersion = 35`, `targetSdkVersion = 35`)
- `res/values/styles.xml` — splash screen theme
- `res/drawable-*/splash.png` — custom splash images

### Signing
Release builds require a `keystore.properties` file (git-ignored) in `android/` with:
```
storeFile=path/to/keystore.jks
storePassword=...
keyAlias=...
keyPassword=...
```

## What to read first
1. `src/pages/Index.tsx`
2. `src/hooks/useChatWithConversations.ts`
3. `src/lib/api.ts`
4. `src/components/ChatMessage.tsx`
