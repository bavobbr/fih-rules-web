# Field Hockey Rule AI

AI-driven Field Hockey rules QA companion. Get instant, expert-level clarity on International Hockey Federation (FIH) rules for Outdoor, Indoor, and Hockey5s.

## About

This is the web UI for a Field Hockey rules engine that allows QA towards the official ruleset of outdoor, indoor, and hockey5s. The application provides a conversational interface where users can ask questions about field hockey rules and receive AI-powered responses with source citations.

## Tech Stack

- **Framework**: [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Routing**: [React Router](https://reactrouter.com/)
- **State Management**: React hooks with localStorage persistence
- **Markdown Rendering**: [react-markdown](https://github.com/remarkjs/react-markdown)

## Components

### Core Components

| Component | Description |
|-----------|-------------|
| `ChatMessage` | Displays individual chat messages with typing animation and markdown support |
| `ChatInput` | Text input with voice input support and send functionality |
| `ChatHeader` | App header with navigation, theme toggle, and status indicator |
| `ChatSidebar` | Conversation history sidebar with create/delete/select functionality |
| `WelcomeScreen` | Landing screen with suggested questions and quick-start options |
| `TypingIndicator` | Animated typing dots shown while waiting for AI response |
| `DebugTrace` | Collapsible debug information showing response metadata and sources |
| `SourceCard` | Displays source document citations with expandable content |
| `AboutDialog` | Information dialog with disclaimers and attribution |

### Hooks

| Hook | Description |
|------|-------------|
| `useChat` | Core chat logic for sending messages and managing state |
| `useChatWithConversations` | Extended chat hook with conversation persistence |
| `useConversations` | Manages conversation CRUD operations and localStorage sync |
| `useTypewriter` | Typewriter animation effect for AI responses |
| `useVoiceInput` | Browser speech recognition for voice input |

## API Integration

The app communicates with the FIH RAG (Retrieval-Augmented Generation) API:

- **Base URL**: `https://fih-rag-api-282549120912.europe-west1.run.app`
- **Authentication**: API key via `x-api-key` header

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Send a query with conversation history, receive AI response |
| `/health` | GET | Health check endpoint |

### Request/Response Format

```typescript
// Request
interface ChatRequest {
  query: string;
  history: Message[];
}

// Response
interface ChatResponse {
  response: string;
  standalone_query?: string;
  source_docs?: SourceDoc[];
  variant?: string;
}
```

## Installation

### Prerequisites

- Node.js 18+ 
- npm or bun

### Setup

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Environment Variables

Create a `.env` file for custom configuration (optional - defaults are provided):

```env
VITE_API_BASE_URL=https://fih-rag-api-282549120912.europe-west1.run.app
VITE_API_KEY=your_api_key
```

## Deployment

### Build for Production

```bash
npm run build
```

This generates a static build in the `dist/` folder.

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `VITE_API_BASE_URL`
   - `VITE_API_KEY`
3. Deploy

### Deploy to Other Platforms

The `dist/` folder contains static files that can be deployed to any static hosting service (Netlify, Cloudflare Pages, AWS S3, etc.).

## License

This project is proprietary software.
