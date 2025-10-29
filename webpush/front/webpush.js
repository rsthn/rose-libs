
const WebPush =
{
    requestPermission: function ({
        serviceWorkerUrl = 'webpush.service-worker.js',
        resubscribeIfExisting = false,
        applicationServerKey = null
    })
    {
        return new Promise((resolve, reject) =>
        {
            // Check if support for service-workers and webpush exists.
            if (!('serviceWorker' in navigator))
                return reject('Service worker is not supported on this browser.');
            if (!('PushManager' in window))
                return reject('Webpush is not supported on this browser.');

            // Ensure the application server key was provided.
            if (!applicationServerKey)
                return reject('applicationServerKey is required');

            // Check if we've already been granted webpush permissions.
            if (Notification.permission === 'granted') {
                navigator.serviceWorker
                .register(serviceWorkerUrl)
                .then((registration) => {
                    return registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey
                    })
                    .then((pushSubscription) => {
                        resolve(JSON.parse(JSON.stringify(pushSubscription)));
                    })
                    .catch((err) => {
                        reject(err);
                    });
                })
                .catch((err) => {
                    reject(err);
                });
                return;
            }
    
            // Attempt to register the service worker and then the webpush subscription.
            navigator.serviceWorker.register(serviceWorkerUrl)
            .then((registration) =>
            {
                const subscribe = () => {
                    Notification.requestPermission((result) => {
                        if (result === 'granted') {
                            return registration.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey
                            })
                            .then((pushSubscription) => {
                                resolve(JSON.parse(JSON.stringify(pushSubscription)));
                            })
                            .catch(reject);
                        }
                        reject('Push notification permission was not granted.\n' + result);
                    });
                };

                registration.pushManager.getSubscription()
                .then((pushSubscription) => {
                    if (pushSubscription) {
                        if (!resubscribeIfExisting)
                            return resolve(JSON.parse(JSON.stringify(pushSubscription)));
                        return pushSubscription.unsubscribe().finally(subscribe);
                    }
                    subscribe();
                });
            })
            .catch(reject);
        });
    },
};
