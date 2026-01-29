import { connectFirestoreEmulator } from 'firebase/firestore';
import { db } from '../infra/config/firebase';

// Setup function to connect to emulator
const setupEmulator = () => {
    try {
        // Connect to Firestore Emulator
        // Note: connectFirestoreEmulator should only be called once per app instance
        // We use a try-catch or state check if needed, but the SDK throws if already connected.
        // Usually safe to ignore "already connected" error in watch mode or parallel runs sharing memory.

        // Host: localhost, Port: 8080 (must match firebase.json)
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('✅ Connected to Firestore Emulator at localhost:8080');
    } catch (error: any) {
        // If error code is 'failed-precondition' (already connected), ignore it
        if (error.code === 'failed-precondition' || error.message?.includes('already been started')) {
            console.log('ℹ️ Firestore Emulator already connected');
        } else {
            console.error('❌ Failed to connect to Firestore Emulator:', error);
            throw error;
        }
    }
};

setupEmulator();
