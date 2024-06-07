self.addEventListener('push', function(event) {
    const data = event.data.json();
    const options = {
        body: data.message,
        icon: '/icon.png', // Your icon here
        badge: '/badge.png' // Your badge here
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
