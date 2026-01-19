// Google Analytics event tracking

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

// Pre-defined events
export const analytics = {
  questionAsked: (variant?: string) =>
    trackEvent('question_asked', { variant }),

  conversationCreated: () =>
    trackEvent('conversation_created'),

  conversationDeleted: () =>
    trackEvent('conversation_deleted'),

  voiceInputUsed: () =>
    trackEvent('voice_input_used'),

  sourcesExpanded: () =>
    trackEvent('sources_expanded'),

  messageCopied: () =>
    trackEvent('message_copied'),
};
