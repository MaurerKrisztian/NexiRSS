export async function requestPermission() {
    if (Notification.permission === 'denied') {
        alert('You have denied notifications. Please enable them in your browser settings.');
        return;
    }

    if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            return;
        }
    }
}