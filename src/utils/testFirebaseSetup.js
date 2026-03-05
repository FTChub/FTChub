// Test file to verify Firebase setup
// Run this in browser console or as a test file

async function testFirebaseSetup() {
  console.log('🔍 Testing Firebase setup...\n');

  try {
    // Test 1: Firebase config loaded
    console.log('✓ Test 1: Checking Firebase config...');
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    const hasConfig = Object.values(config).every(val => val && val.length > 0);
    if (hasConfig) {
      console.log('  ✓ All Firebase config values present');
      console.log('  Config:', config);
    } else {
      console.error('  ✗ Missing Firebase config values in .env.local');
      console.error('  Missing:', Object.entries(config)
        .filter(([, val]) => !val)
        .map(([key]) => key));
      return;
    }

    // Test 2: Firebase app initialized
    console.log('\n✓ Test 2: Checking Firebase app...');
    const app = (await import('@/lib/firebase')).default;
    if (app) {
      console.log('  ✓ Firebase app initialized');
    } else {
      console.error('  ✗ Firebase app not initialized');
      return;
    }

    // Test 3: Authentication service
    console.log('\n✓ Test 3: Checking Auth service...');
    const { authService } = await import('@/api/firebaseClient');
    if (authService && authService.getCurrentUser) {
      console.log('  ✓ Auth service available');
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        console.log('  ✓ User signed in:', currentUser.email);
      } else {
        console.log('  ℹ No user currently signed in (this is okay for first run)');
      }
    } else {
      console.error('  ✗ Auth service not available');
      return;
    }

    // Test 4: Firestore access
    console.log('\n✓ Test 4: Checking Firestore...');
    const { db } = await import('@/lib/firebase');
    const { collection, getDocs } = await import('firebase/firestore');
    
    try {
      const testCollection = collection(db, 'entries');
      const snapshot = await getDocs(testCollection);
      console.log('  ✓ Firestore accessible');
      console.log(`  ℹ Found ${snapshot.size} entries in database`);
    } catch (error) {
      if (error.code === 'permission-denied') {
        console.error('  ✗ Firestore permission denied');
        console.error('    Check your security rules in Firebase Console');
      } else {
        console.error('  ✗ Firestore error:', error.message);
      }
      return;
    }

    // Test 5: Cloud Storage access
    console.log('\n✓ Test 5: Checking Cloud Storage...');
    const { storage } = await import('@/lib/firebase');
    if (storage) {
      console.log('  ✓ Cloud Storage initialized');
    } else {
      console.error('  ✗ Cloud Storage not initialized');
      return;
    }

    // Test 6: User service
    console.log('\n✓ Test 6: Checking User service...');
    const { userService } = await import('@/api/firebaseClient');
    if (userService && userService.getAllUsers) {
      console.log('  ✓ User service available');
      try {
        const users = await userService.getAllUsers();
        console.log(`  ℹ Found ${users.length} users in database`);
      } catch (error) {
        console.log('  ℹ Cannot read users (may need to sign in first)');
      }
    } else {
      console.error('  ✗ User service not available');
      return;
    }

    console.log('\n✅ All tests passed! Firebase setup is working correctly.\n');
    console.log('Next steps:');
    console.log('1. Sign in with Google');
    console.log('2. Create an entry');
    console.log('3. Test bookmarking');
    console.log('4. Check admin panel if admin');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    console.error('Error details:', error.message);
  }
}

// Export for use in tests
export default testFirebaseSetup;

// Uncomment to run automatically on page load
// if (typeof window !== 'undefined') {
//   testFirebaseSetup();
// }