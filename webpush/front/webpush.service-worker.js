/**
 * Handles the push notification by showing a notification toast.
 */
self.addEventListener('push', function(event) {
    let title = 'Notification Received';
    let data = {};

    if (event.data) {
        data = event.data.json();
        title = data.title;
        delete data.title;
    }

    event.waitUntil(self.registration.showNotification(title, data));
});

/**
 * Handles a tap on a notification.
 */
self.addEventListener('notificationclick', async (event) =>
{
    event.notification.close();
    if (!event.notification.data)
        return;

    let data = event.notification.data;

    if (data.fetch && data.fetch.url) {
        await fetch(data.fetch.url, {
            method: data.fetch.method ?? 'POST',
            headers: data.fetch.headers ?? {},
            body: JSON.stringify({ 'action': event.action, 'data': data.data })
        });
    }

    if (data.target_url)
    {
        if (!data.target_url.includes("?"))
            data.target_url += '?';
        else
            data.target_url += '&';

        let url = data.target_url + (new URLSearchParams({ 'action': event.action, ...data.data }).toString());
        event.waitUntil(clients.openWindow(url));
    }
});
