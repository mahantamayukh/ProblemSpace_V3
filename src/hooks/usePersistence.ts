import { useEffect } from 'react';

/**
 * Custom hook to handle persistence of core application state.
 * Debounces writes to localStorage to prevent UI lag.
 */
export function usePersistence(state: {
  constraints: any[];
  userApiKey: string;
  anthropicApiKey: string;
  sessionSummary: string;
  summaryFrequency: number;
  aiModel: string;
  customBaseUrl: string;
  customModelName: string;
  universalApiKey: string;
  messages: any[];
  history: any[];
  savedInterviews: any[];
  projectBoards: any[];
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('problemspace-constraints-v1', JSON.stringify(state.constraints));
        localStorage.setItem('problemspace-user-api-key', state.userApiKey);
        localStorage.setItem('problemspace-anthropic-api-key', state.anthropicApiKey);
        localStorage.setItem('problemspace-session-summary-v1', state.sessionSummary);
        localStorage.setItem('problemspace-summary-freq', state.summaryFrequency.toString());
        localStorage.setItem('problemspace-ai-model', state.aiModel);
        localStorage.setItem('problemspace-custom-base-url', state.customBaseUrl);
        localStorage.setItem('problemspace-custom-model-name', state.customModelName);
        localStorage.setItem('problemspace-universal-api-key', state.universalApiKey);
        localStorage.setItem('problemspace-chat-messages', JSON.stringify(state.messages));
        localStorage.setItem('problemspace-chat-history', JSON.stringify(state.history.slice(-20)));
        localStorage.setItem('problemspace-interviews-v1', JSON.stringify(state.savedInterviews));
        localStorage.setItem('problemspace-project-boards-v4', JSON.stringify(state.projectBoards));
      } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          console.error("LocalStorage full! Progress may not be saved.");
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    state.constraints,
    state.userApiKey,
    state.anthropicApiKey,
    state.sessionSummary,
    state.summaryFrequency,
    state.aiModel,
    state.customBaseUrl,
    state.customModelName,
    state.universalApiKey,
    state.messages,
    state.history,
    state.savedInterviews,
    state.projectBoards
  ]);
}
