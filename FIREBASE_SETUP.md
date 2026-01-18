# Firebase Setup for Aula Criativa AI

To monitor and persist data with Cloud Firestore, you need to configure your Firebase project.

## 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the setup steps.
3. Enable **Cloud Firestore** in the "Build" menu.
   - Start in **Test mode** (for development) or **Production mode** (with proper rules).

## 2. Get Configuration Keys
1. In your Firebase Project Overview, click the **Web** icon (</>) to create a web app.
2. Register the app (e.g., "Aula Criativa").
3. You will see a `firebaseConfig` object.

## 3. Update `.env`
Copy the values from the `firebaseConfig` object into your `.env` file in the root of the project:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 4. Restart Application
After updating the `.env` file, restart your development server:
```bash
npm run dev
```

## 5. Verify
Create a new Discipline or Unit in the application. Check your Firestore Database console to see the data appearing in `disciplinas` or `unidades` collections.
