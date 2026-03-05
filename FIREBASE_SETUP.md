# Firebase Migration Setup Guide

This application has been migrated from Base44 to Firebase. Follow the steps below to complete the setup.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project"
3. Enter your project name (e.g., "FTC Hub")
4. Follow the setup wizard and create the project

## 2. Set Up Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Google** as a sign-in method
4. Add your app domain(s) to the authorized redirect URIs
5. Configure the OAuth consent screen if needed

## 3. Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select your preferred location
5. Click **Create**

### Set Up Firestore Security Rules

In Firestore, go to **Rules** and add these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read their own data, admins can read all
    match /users/{userId} {
      allow read: if request.auth.uid == userId || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    // Entries collection - public read, authenticated write
    match /entries/{entryId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.created_by || 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Bookmarks collection - users can only manage their own
    match /bookmarks/{bookmarkId} {
      allow read, write: if request.auth.uid == resource.data.user_email || request.auth.email == resource.data.user_email;
      allow create: if request.auth.email == request.resource.data.user_email;
    }
  }
}
```

## 4. Set Up Storage

1. In Firebase Console, go to **Storage**
2. Click **Get Started**
3. Choose production mode
4. Select your location
5. Click **Done**

### Set Up Storage Security Rules

In Storage, go to **Rules** and add these rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

## 5. Get Your Firebase Config

1. Go to **Project Settings** (gear icon)
2. Under "Your apps", click on the web app (create one if needed)
3. Copy the Firebase config object
4. Add these values to your `.env.local` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 6. (Optional) Set Up Email Invitations

For email invitations to admins, you have a few options:

### Option A: Use Firebase Cloud Functions

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run `firebase init functions` in your project
3. Create a Cloud Function to send invitations using a service like SendGrid or Gmail API

### Option B: Use Third-Party Service

Integrate with services like:
- SendGrid
- Mailgun
- AWS SES
- Your own email service

### Option C: Manual User Addition

For now, manually add users as admins through the Admin Panel after they sign up.

## 7. User Data Structure in Firestore

When a user signs up, they are automatically created in the `users` collection with this structure:

```json
{
  "uid": "firebase_uid",
  "email": "user@example.com",
  "full_name": "User Name",
  "role": "user",  // "user" or "admin"
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

## 8. Test the Application

1. Run `npm run dev`
2. Navigate to the home page
3. Click "Sign In" (or login button)
4. Sign in with your Google account
5. Create an entry to test the functionality
6. In Firebase Console, verify data is being stored in Firestore

## 9. Deploy to Production

1. Set up Firebase Hosting: `firebase init hosting`
2. Build your app: `npm run build`
3. Deploy: `firebase deploy`

## Key Differences from Base44

| Feature | Base44 | Firebase |
|---------|--------|----------|
| Auth | Token-based | Firebase Authentication |
| Database | Custom API | Cloud Firestore |
| Storage | Custom API | Cloud Storage |
| Admin Panel | Invite system | Manual role assignment (or Cloud Functions) |
| User Creation | Server-side | Client-side + Firestore sync |

## Troubleshooting

- **Users not showing in Admin Panel**: Make sure Firestore has users created with the correct schema
- **Files not uploading**: Check Storage permissions and CORS settings
- **Authentication failing**: Verify Firebase config and Google OAuth settings
- **Bookmarks not working**: Ensure user's email matches exactly in Firestore documents

## Support

For Firebase documentation, visit: https://firebase.google.com/docs