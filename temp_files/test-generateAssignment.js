/**
 * Test script for Firebase Function: generateAssignment
 * 
 * Usage:
 *   1. Install dependencies: npm install firebase-admin firebase-functions
 *   2. Set GOOGLE_APPLICATION_CREDENTIALS environment variable to your service account key
 *   3. Run: node test-generateAssignment.js
 * 
 * Alternative: Use this code in your browser console if Firebase is already initialized
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
// Option 1: Use service account key file
// admin.initializeApp({
//   credential: admin.credential.cert(require('./path/to/serviceAccountKey.json'))
// });

// Option 2: Use Application Default Credentials (recommended for local testing)
// Set GOOGLE_APPLICATION_CREDENTIALS environment variable
try {
  admin.initializeApp({
    projectId: 'lego-tips'
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  console.log('💡 Tip: Set GOOGLE_APPLICATION_CREDENTIALS or use service account key');
  process.exit(1);
}

// Import Firebase Functions
const { getFunctions } = require('firebase-functions/v2');
const { httpsCallable } = require('firebase-functions/v2/https');

async function testGenerateAssignment() {
  try {
    console.log('\n🧪 Testing generateAssignment function...\n');

    const functions = getFunctions();
    const generateAssignment = httpsCallable(functions, 'generateAssignment');

    // Test data - minimal valid request
    const testData = {
      courseName: 'מבוא לפסיכולוגיה',
      faculty: 'מדעי החברה',
      department: 'פסיכולוגיה',
      courseDescription: 'קורס בסיסי בפסיכולוגיה המכסה תיאוריות למידה וקוגניציה. הקורס כולל נושאים כמו התניה קלאסית, התניה אופרנטית, וזיכרון.',
      selectedMethods: [
        {
          title: 'עבודה בקבוצות',
          description: 'עבודה משותפת בקבוצות של 3-4 סטודנטים'
        },
        {
          title: 'רפלקציה',
          description: 'כתיבת רפלקציה אישית על תהליך הלמידה'
        }
      ],
      preferredProvider: 'openai'
    };

    console.log('📤 Sending request with data:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\n⏳ Waiting for response...\n');

    const startTime = Date.now();
    const result = await generateAssignment(testData);
    const duration = Date.now() - startTime;

    console.log('✅ SUCCESS!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Response Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⏱️  Duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
    console.log(`🤖 Provider: ${result.data.provider}`);
    console.log(`✅ Success: ${result.data.success}`);
    console.log(`📅 Timestamp: ${result.data.timestamp}`);
    console.log('\n📝 Assignment Data:');
    console.log(`   Title: ${result.data.data.title}`);
    console.log(`   Model Used: ${result.data.data.modelUsed}`);
    console.log(`   Generated At: ${result.data.data.generatedAt}`);
    console.log(`   Instructions Count: ${result.data.data.instructions?.length || 0}`);
    console.log(`   Requirements Count: ${result.data.data.requirements?.length || 0}`);
    console.log(`   Rubric HTML Length: ${result.data.data.rubricHtml?.length || 0} characters`);
    
    if (result.data.data.rubricHtml) {
      console.log('\n📄 Preview of generated HTML (first 200 chars):');
      console.log(result.data.data.rubricHtml.substring(0, 200) + '...');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Function test completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return result;

  } catch (error) {
    console.error('\n❌ ERROR!\n');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error Code:', error.code || 'UNKNOWN');
    console.error('Error Message:', error.message || 'No message');
    
    if (error.details) {
      console.error('Error Details:', JSON.stringify(error.details, null, 2));
    }

    if (error.code === 'functions/not-found') {
      console.error('\n💡 Tip: Function not found. Make sure it\'s deployed:');
      console.error('   firebase deploy --only functions:generateAssignment');
    }

    if (error.code === 'functions/permission-denied') {
      console.error('\n💡 Tip: Permission denied. Check:');
      console.error('   1. Firebase authentication');
      console.error('   2. Service account permissions');
      console.error('   3. Function IAM roles');
    }

    if (error.code === 'functions/invalid-argument') {
      console.error('\n💡 Tip: Invalid argument. Check:');
      console.error('   1. Request data format');
      console.error('   2. Required fields (courseName is mandatory)');
    }

    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(1);
  }
}

// Run the test
testGenerateAssignment()
  .then(() => {
    console.log('Test completed. Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

