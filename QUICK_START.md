# Quick Start Guide - Firebase Migration

## Step 1: Set Up Firebase Project (5 minutes)

1. Go to https://console.firebase.google.com
2. Click **Create a new project**
3. Enter "FTC Hub" as project name
4. Accept the terms and click **Create project**
5. Wait for project creation to complete

## Step 2: Enable Google Authentication (3 minutes)

1. In Firebase Console, go to **Authentication** (left menu)
2. Click **Get Started** or **Create account** button
3. Select **Google** sign-in method
4. Click **Enable**
5. Add your email as the project support email
6. Click **Save**

## Step 3: Create Firestore Database (3 minutes)

1. Go to **Firestore Database** (left menu)
2. Click **Create database**
3. Choose **Production mode** (or Start in test mode for development)
4. Select location closest to you
5. Click **Create**
6. Once created, go to **Rules** tab and paste the rules from `FIREBASE_SETUP.md`
7. Click **Publish**

## Step 4: Set Up Cloud Storage (2 minutes)

1. Go to **Storage** (left menu)
2. Click **Get Started**
3. Choose **Production mode**
4. Select location
5. Click **Done**
6. Go to **Rules** tab and paste the rules from `FIREBASE_SETUP.md`
7. Click **Publish**

## Step 5: Get Firebase Configuration (2 minutes)

1. Click the ⚙️ **Project Settings** (top right)
2. Go to **Your apps** section
3. If no web app exists, click **Add app** and select **</>** (Web)
4. Follow the wizard, then copy your config from the code snippet looking like:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## Step 6: Configure Your Project (2 minutes)

1. Copy `.env.local.example` to `.env.local`
2. Replace the values with your Firebase config
3. Save the file

## Step 7: Start Development Server

```bash
npm install  # (if not already done)
npm run dev
```

Visit http://localhost:5173 and test:
- Click "Sign In" button
- Sign in with Google
- Create an entry
- Test admin panel (only if you have admin role)

## Step 8: Make Yourself an Admin (if needed)

Since there's no automatic email invitation system yet:

1. Sign in with your Google account
2. Go to Firebase Console > Firestore > users collection
3. Find your user document (matching your email)
4. Edit the `role` field from `"user"` to `"admin"`
5. Save
6. Refresh your app and you'll see the Admin Panel

## Troubleshooting

### "Firebase config not found"
- Check `.env.local` exists in root directory
- Verify all VITE_FIREBASE_* variables are present
- Restart dev server after adding env vars

### "Cannot sign in with Google"
- Check Google authentication is enabled in Firebase
- Verify your domain is authorized (if deploying to web)
- Check browser console for specific error

### "Can't create entries"
- Check Firestore security rules are published
- Ensure you're signed in
- Check browser console for errors

### "Files not uploading"
- Verify Cloud Storage bucket exists
- Check storage security rules are published
- Check file size (usually < 100MB for web)

## Next: Production Deployment

When ready to deploy:

```bash
npm run build
firebase init hosting  # (one time setup)
firebase deploy
```

See `FIREBASE_SETUP.md` for detailed deployment instructions.

## Need Help?

- Firebase Docs: https://firebase.google.com/docs
- React Docs: https://react.dev
- Check browser console (F12) for actual error messages
- See `FIREBASE_SETUP.md` for detailed setup guide