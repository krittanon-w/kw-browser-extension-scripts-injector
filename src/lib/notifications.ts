export function notify(title: string, message: string) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '/vite.svg',
    title: title,
    message: message,
    priority: 2
  });
}

export function notifyError(message: string) {
  notify('Error', message);
}
