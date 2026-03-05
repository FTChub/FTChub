# Data Migration Guide - Base44 to Firebase

If you have existing data in Base44, follow this guide to migrate it to Firebase.

## Overview

You'll need to:
1. Export data from Base44
2. Transform it to match Firestore schema
3. Import it into Firestore

## Automated Migration Script

Create `scripts/migrate-data.js`:

```javascript
// This script requires Firebase Admin SDK
// firebase-admin must be installed: npm install firebase-admin

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Download from Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com"
});

const db = admin.firestore();

// Example: Migrate users from Base44 JSON export
async function migrateUsers(usersData) {
  const batch = db.batch();
  let count = 0;

  for (const user of usersData) {
    try {
      const userRef = db.collection('users').doc(user.uid);
      batch.set(userRef, {
        uid: user.uid,
        email: user.email,
        full_name: user.full_name || '',
        role: user.role || 'user',
        createdAt: new Date(user.created_at),
        updatedAt: new Date(),
      });
      count++;

      if (count % 500 === 0) {
        await batch.commit();
        console.log(`Committed ${count} users...`);
      }
    } catch (error) {
      console.error(`Error migrating user ${user.uid}:`, error);
    }
  }

  await batch.commit();
  console.log(`Successfully migrated ${count} users`);
}

// Example: Migrate entries from Base44 JSON export
async function migrateEntries(entriesData) {
  const batch = db.batch();
  let count = 0;

  for (const entry of entriesData) {
    try {
      const entryRef = db.collection('entries').doc(entry.id);
      batch.set(entryRef, {
        id: entry.id,
        title: entry.title,
        description: entry.description,
        content: entry.content,
        category: entry.category,
        team_number: entry.team_number,
        team_name: entry.team_name || '',
        season: entry.season || '',
        tags: entry.tags || [],
        image_urls: entry.image_urls || [],
        file_urls: entry.file_urls || [],
        created_by: entry.created_by, // Should be user email
        created_date: new Date(entry.created_date),
        upvotes: entry.upvotes || 0,
        upvoted_by: entry.upvoted_by || [],
        view_count: entry.view_count || 0,
        createdAt: new Date(entry.created_date),
        updatedAt: new Date(),
      });
      count++;

      if (count % 500 === 0) {
        await batch.commit();
        console.log(`Committed ${count} entries...`);
      }
    } catch (error) {
      console.error(`Error migrating entry ${entry.id}:`, error);
    }
  }

  await batch.commit();
  console.log(`Successfully migrated ${count} entries`);
}

// Example: Migrate bookmarks
async function migrateBookmarks(bookmarksData) {
  const batch = db.batch();
  let count = 0;

  for (const bookmark of bookmarksData) {
    try {
      const bookmarkRef = db.collection('bookmarks').doc();
      batch.set(bookmarkRef, {
        entry_id: bookmark.entry_id,
        user_email: bookmark.user_email,
        createdAt: new Date(bookmark.created_at),
      });
      count++;

      if (count % 500 === 0) {
        await batch.commit();
        console.log(`Committed ${count} bookmarks...`);
      }
    } catch (error) {
      console.error(`Error migrating bookmark:`, error);
    }
  }

  await batch.commit();
  console.log(`Successfully migrated ${count} bookmarks`);
}

// Main migration
async function main() {
  try {
    // Replace these with your actual exported data
    const usersData = require('./base44-export/users.json');
    const entriesData = require('./base44-export/entries.json');
    const bookmarksData = require('./base44-export/bookmarks.json');

    console.log('Starting migration...');
    await migrateUsers(usersData);
    await migrateEntries(entriesData);
    await migrateBookmarks(bookmarksData);
    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
```

## Manual Migration Steps

### 1. Export Data from Base44

Contact your Base44 administrator to export:
- Users list (CSV or JSON)
- All entries
- All bookmarks

### 2. Prepare Data

Transform the exported data to match Firestore schema.

**For Users:**
```json
{
  "uid": "firebase_uid_or_base44_id",
  "email": "user@example.com",
  "full_name": "User Name",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**For Entries:**
```json
{
  "id": "entry_id",
  "title": "Entry Title",
  "description": "Short description",
  "content": "Full content",
  "category": "robot_design",
  "team_number": "12345",
  "team_name": "Team Name",
  "season": "INTO THE DEEP 2024-2025",
  "tags": ["tag1", "tag2"],
  "image_urls": ["url1", "url2"],
  "file_urls": ["url1"],
  "created_by": "user@example.com",
  "created_date": "2024-01-01T00:00:00Z",
  "upvotes": 5,
  "upvoted_by": ["user1@example.com"],
  "view_count": 10,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**For Bookmarks:**
```json
{
  "entry_id": "entry_id",
  "user_email": "user@example.com",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 3. Import via Firebase Console

1. Go to Firestore Database in Firebase Console
2. For each collection (users, entries, bookmarks):
   - Click **Start collection**
   - Enter collection name
   - Import documents manually or via script

### 4. Verify Migration

Check a few entries in Firestore:
- ✅ User count matches
- ✅ Entry content is correct
- ✅ Bookmarks reference correct users and entries
- ✅ Timestamps are preserved

## Troubleshooting

### Document Size Exceeded
- Firebase has a 1MB limit per document
- Split large entries into multiple documents if needed

### Missing Relationships
- Ensure user emails are consistent between collections
- Check entry `created_by` matches user emails exactly

### Timestamp Issues
- Convert all timestamps to ISO 8601 format
- Use `new Date(timestamp)` in JavaScript

### Duplicate Documents
- Remove old test documents from Firestore before production
- Use Firestore console to delete if needed

## Verification Checklist

- [ ] All users migrated
- [ ] All entries migrated
- [ ] All bookmarks migrated
- [ ] User roles preserved
- [ ] Entry metadata correct
- [ ] File URLs still accessible
- [ ] Image URLs still accessible
- [ ] Timestamps in UTC/ISO format
- [ ] No 1MB+ documents
- [ ] Test app works with migrated data

## Rollback Plan

If migration fails:
1. Delete the problematic collection in Firestore
2. Fix the data transformation
3. Re-run the migration script

Or use Firestore backups if available.