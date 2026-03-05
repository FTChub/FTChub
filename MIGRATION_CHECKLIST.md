# FTC Hub - Firebase Migration Checklist

## Pre-Migration
- [ ] Back up all Base44 data
- [ ] Document current user base
- [ ] Plan data migration strategy

## Firebase Setup
- [ ] Create Firebase project
- [ ] Configure Google authentication
- [ ] Create Firestore database with production rules
- [ ] Set up Cloud Storage with production rules
- [ ] Get Firebase config and add to `.env.local`

## Data Migration
- [ ] Migrate users to `users` collection
  - Map Base44 user IDs to Firebase UIDs
  - Map roles (admin/user)
- [ ] Migrate entries to `entries` collection
  - Ensure all fields match the new schema
  - Update `created_by` to use email
  - Verify timestamps are in ISO format
- [ ] Migrate bookmarks to `bookmarks` collection
  - Update user references to use emails

## Code Migration (✅ Already Done)
- [x] Updated `AuthContext.jsx` for Firebase auth
- [x] Updated `AdminPanel.jsx` to use Firebase user management
- [x] Updated `CreateEntry.jsx` for Firebase entry creation
- [x] Updated `Home.jsx` for Firebase data fetching
- [x] Updated `EntryDetail.jsx` for Firebase entry management
- [x] Updated `MyEntries.jsx` for user's entries
- [x] Updated `Bookmarks.jsx` for bookmarks management
- [x] Created `firebaseClient.js` with service functions

## Testing
- [ ] Test Google sign-in
- [ ] Test entry creation
- [ ] Test entry deletion (admin)
- [ ] Test bookmarking
- [ ] Test filtering and search
- [ ] Test upvoting
- [ ] Test admin panel
- [ ] Test user role management

## Deployment
- [ ] Test locally with Firebase Emulator (optional but recommended)
- [ ] Deploy to Firebase Hosting
- [ ] Monitor error logs
- [ ] Set up Firebase monitoring/analytics

## Post-Migration
- [ ] Document any data inconsistencies
- [ ] Set up automated backups
- [ ] Configure Firebase monitoring
- [ ] Train admins on new system
- [ ] Remove Base44 dependencies (update package.json)

## Notes
- Firebase Realtime Database can be used instead of Firestore if preferred
- Consider setting up Cloud Functions for automated tasks (email invitations, data cleanup)
- For large-scale user management, consider Firebase Admin SDK for batch operations