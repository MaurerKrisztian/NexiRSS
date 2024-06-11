import React, { useEffect } from 'react';
import { Button, Box } from '@mui/material';
import apiClient from "../api-client/api";
import {pushNotificationPublicKey} from "../envs";
import {requestPermission} from "../utils/permission.util";
import * as rdd from 'react-device-detect';

const PushNotification: React.FC = () => {
    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.register('/worker.js')
                .then(swReg => {
                    console.log('Service Worker Registered', swReg);

                    swReg.pushManager.getSubscription()
                        .then(subscription => {
                            if (subscription === null) {
                                console.log('Not subscribed to push service!');
                                subscribeUser(swReg);
                            } else {
                                console.log('Subscription object: ', subscription);
                            }
                        });
                })
                .catch(error => {
                    console.error('Service Worker Error', error);
                });
        }
    }, []);

    const subscribeUser = (swReg: ServiceWorkerRegistration) => {
        const vapidPublicKey = pushNotificationPublicKey
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        const deviceInfo = { type: rdd.deviceType, osName: rdd.osName, osVersion: rdd.osVersion }
        swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
        })
            .then(subscription => {
                console.log('User is subscribed:', { subscription, deviceInfo});

                apiClient.post('/notifications/subscribe', { subscription, deviceInfo})
                    .then(response => {
                        console.log('Subscription sent to server:', response.data);
                    })
                    .catch(error => {
                        console.error('Error sending subscription to server:', error);
                    });
            })
            .catch(error => {
                console.error('Failed to subscribe the user: ', error);
            });
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const handleSendNotification = async () => {
        await requestPermission();
        try {
            await apiClient.post('/notifications', { message: 'Hello, this is a test notification!' });
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5 }}>
            <Button variant="contained" onClick={handleSendNotification}>
               Test Push Notification
            </Button>
        </Box>
    );
};

export default PushNotification;
