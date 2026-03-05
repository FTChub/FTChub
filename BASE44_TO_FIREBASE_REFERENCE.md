# From Base44 to Firebase - Code Changes Reference

## API Client Changes

### Before (Base44)
```javascript
// src/api/base44Client.js
import { createClient } from '@base44/sdk';
export const base44 = createClient({...});

// Usage in components
const entries = await base44.entities.TeamEntry.list();
const user = await base44.auth.me();
base44.auth.logout();
```

### After (Firebase)
```javascript
// src/api/firebaseClient.js
import { authService, entryService, userService } from '@/api/firebaseClient';

// Usage in components
const entries = await entryService.getAllEntries();
const user = authService.getCurrentUser();
await authService.signOut();
```

---

## Authentication Changes

### Before (Base44)
```javascript
// AuthContext.jsx
const appClient = createAxiosClient({...});
const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
const currentUser = await base44.auth.me();
base44.auth.logout(window.location.href);
base44.auth.redirectToLogin(window.location.href);
```

### After (Firebase)
```javascript
// AuthContext.jsx
const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
  const userData = await userService.getUser(firebaseUser.uid);
});
await authService.signOut();
await authService.signInWithGoogle();
```

---

## Entry Management Changes

### Before (Base44)
```javascript
// CreateEntry.jsx
await base44.integrations.Core.UploadFile({ file });
await base44.entities.TeamEntry.create({...});

// Home.jsx
const entries = await base44.entities.TeamEntry.list("-created_date", 200);

// EntryDetail.jsx
const entries = await base44.entities.TeamEntry.filter({ id: entryId });
await base44.entities.TeamEntry.update(e.id, { view_count: ... });
```

### After (Firebase)
```javascript
// CreateEntry.jsx
const { file_url } = await fileService.uploadFile(file);
await entryService.createEntry({...});

// Home.jsx
const entries = await entryService.getAllEntries(200);

// EntryDetail.jsx
const entry = await entryService.getEntry(entryId);
await entryService.updateEntry(entryId, { view_count: ... });
```

---

## Admin Panel Changes

### Before (Base44)
```javascript
// AdminPanel.jsx
const users = await base44.entities.User.list();
await base44.entities.User.update(id, { role });
await base44.users.inviteUser(email, "admin");
```

### After (Firebase)
```javascript
// AdminPanel.jsx
const users = await userService.getAllUsers();
await userService.updateUserRole(id, role);
// Manual role assignment - no email invites yet
// (Can add Cloud Functions later)
```

---

## Bookmarks Changes

### Before (Base44)
```javascript
// EntryDetail.jsx
const bookmarks = await base44.entities.Bookmark.filter({ user_email });
await base44.entities.Bookmark.create({ entry_id, user_email });
await base44.entities.Bookmark.delete(bm.id);
```

### After (Firebase)
```javascript
// EntryDetail.jsx
const bookmarks = await bookmarkService.getBookmarksByUser(userEmail);
await bookmarkService.createBookmark({ entry_id, user_email });
await bookmarkService.deleteBookmark(bookmarkId);
```

---

## Key Structural Differences

| Aspect | Base44 | Firebase |
|--------|--------|----------|
| **API Pattern** | Entity-based (base44.entities.X) | Service-based (service.X()) |
| **Authentication** | SDK methods (base44.auth.me()) | Firebase Auth + Firestore |
| **File Upload** | base44.integrations.Core | Firebase Storage |
| **Database Query** | Entity filter/list methods | Firestore queries |
| **Real-time** | Not directly used | Available with onSnapshot |
| **User Roles** | managed by backend | Client-side Firestore docs |

---

## Service Layer Comparison

### Base44 Approach
```javascript
base44.entities.TeamEntry.list()
base44.entities.TeamEntry.filter({ category: "robot_design" })
base44.entities.TeamEntry.update(id, data)
base44.entities.Bookmark.filter()
base44.auth.me()
```

### Firebase Approach
```javascript
entryService.getAllEntries()
entryService.filterEntries({ category: "robot_design" })
entryService.updateEntry(id, data)
bookmarkService.getBookmarksByUser(email)
authService.getCurrentUser()
```

---

## Data Model Mapping

### Users
```
Base44: User entity with id, email, role
Firebase: Firestore document with uid, email, full_name, role
```

### Entries
```
Base44: TeamEntry entity with auto-managed timestamps
Firebase: Firestore entry document with explicit timestamps
```

### Bookmarks
```
Base44: Bookmark entity with user_id reference
Firebase: Bookmark document with user_email reference
```

---

## Configuration Changes

### Before
```javascript
// app-params.js
import { createClient } from '@base44/sdk';
const appParams = {
  appId: env.VITE_BASE44_APP_ID,
  token: env.VITE_BASE44_TOKEN,
  ...
}
```

### After
```javascript
// .env.local
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
// Automatically loaded by Firebase SDK
```

---

## Query Pattern Changes

### Before (Base44)
```javascript
// Filter entries
const entries = await base44.entities.TeamEntry.filter(
  { category: "robot_design" },
  "-created_date"
);

// Get specific entry
const entries = await base44.entities.TeamEntry.filter({ id: entryId });
const entry = entries[0];
```

### After (Firebase)
```javascript
// Filter entries using Firestore query
const constraints = [where('category', '==', 'robot_design')];
const q = query(collection(db, 'entries'), ...constraints);
const snapshot = await getDocs(q);

// Get specific entry
const entry = await entryService.getEntry(entryId);
```

---

## Error Handling

### Before
```javascript
try {
  await base44.entities.TeamEntry.create(data);
} catch (e) {
  if (e.status === 401) { /* handle */ }
}
```

### After
```javascript
try {
  await entryService.createEntry(data);
} catch (error) {
  if (error.code === 'permission-denied') { /* handle */ }
}
```

---

## Real-time Capabilities

### Base44
- Limited real-time features
- Mostly fetch-based updates

### Firebase
- Built-in real-time listeners
- Easy live updates with `onSnapshot()`
- Commented out in current implementation but available

---

## Lifting Constraints

| Constraint | Base44 | Firebase | Notes |
|-----------|--------|----------|-------|
| Users per collection | Unlimited | Unlimited | |
| Document size | Custom | 1MB max | Split large docs if needed |
| Query complexity | SDK handles | Manual | More control but more code |
| Real-time updates | Limited | Full | Can implement later |
| Authentication | Custom | OAuth | Simpler, more secure |
| File storage | Custom API | Cloud Storage | Better scalability |

---

## Migration Tips for Team

1. **If modifying entry creation**
   - Old: `base44.entities.TeamEntry.create()`
   - New: `entryService.createEntry()`

2. **If adding user features**
   - Old: `base44.entities.User.list()`
   - New: `userService.getAllUsers()`

3. **If adding real-time**
   - Old: Not available
   - New: `realtimeService.onEntriesChange(callback)`

4. **If storing new fields**
   - Create them in Firestore document
   - Update schema documentation
   - No migrations needed

5. **If modifying security**
   - Old: Backend enforced
   - New: Firestore security rules (edit in Firebase Console)

---

## Debugging Tools

### Base44
```javascript
// SDK debugging
console.log(base44); // See all methods
```

### Firebase
```javascript
// Firestore debugging
console.log(await getDocs(collection(db, 'entries')));

// Run test
import testFirebaseSetup from '@/utils/testFirebaseSetup';
await testFirebaseSetup();
```

---

## Performance Considerations

### Base44
- REST API based
- Request per operation

### Firebase
- Firestore at 100 reads/sec free tier
- Cloud Storage generous free tier
- Real-time listeners enable efficient updates

---

## Summary of Moving Parts

| Component | Before | After |
|-----------|--------|-------|
| Auth | base44.auth | Firebase Auth |
| Database | Base44 API | Firestore |
| Storage | Base44 API | Cloud Storage |
| Users | base44.entities.User | userService |
| Entries | base44.entities.TeamEntry | entryService |
| Bookmarks | base44.entities.Bookmark | bookmarkService |
| Files | base44.integrations.Core | fileService |

All application logic remains the same - only the backend changed!