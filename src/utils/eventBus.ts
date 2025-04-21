export const apiKeyUpdateEvent = 'api-keys-updated';

export const triggerApiKeyUpdate = () => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent(apiKeyUpdateEvent);
    window.dispatchEvent(event);
  }
};