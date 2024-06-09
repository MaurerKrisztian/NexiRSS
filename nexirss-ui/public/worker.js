self.addEventListener('push', function (event) {
    const data = event.data.json();
    event.waitUntil(
        self.registration.showNotification(data.title || "NexiRSS", {
            badge: 'https://nexirss.netlify.app/logo192.png',
            icon: 'https://nexirss.netlify.app/logo192.png',
            data: {
                url: 'https://nexirss.netlify.app'
            },
            ...data,
        })
    );
});

self.addEventListener('notificationclick', function (event) {
    console.log("On notification click: ", event.notification);
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
