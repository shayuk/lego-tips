/**
 * Browser Console Test Script for generateAssignment Function
 * 
 * Usage:
 *   1. Open your app in browser (with Firebase initialized)
 *   2. Open browser console (F12)
 *   3. Copy and paste this entire script
 *   4. Press Enter
 * 
 * This script uses the Firebase SDK already loaded in your app.
 */

(async function testGenerateAssignment() {
  try {
    console.log('🧪 Testing generateAssignment function...\n');

    // Import Firebase Functions (adjust import path if needed)
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    
    // Or if using require (older setup):
    // const { getFunctions, httpsCallable } = require('firebase/functions');

    const functions = getFunctions();
    const generateAssignment = httpsCallable(functions, 'generateAssignment');

    // Test data
    const testData = {
      courseName: 'מבוא לפסיכולוגיה',
      faculty: 'מדעי החברה',
      department: 'פסיכולוגיה',
      courseDescription: 'קורס בסיסי בפסיכולוגיה המכסה תיאוריות למידה וקוגניציה',
      selectedMethods: [
        {
          title: 'עבודה בקבוצות',
          description: 'עבודה משותפת בקבוצות של 3-4 סטודנטים'
        }
      ],
      preferredProvider: 'openai'
    };

    console.log('📤 Request data:', testData);
    console.log('⏳ Calling function...\n');

    const startTime = Date.now();
    const result = await generateAssignment(testData);
    const duration = Date.now() - startTime;

    console.log('✅ SUCCESS!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`🤖 Provider: ${result.data.provider}`);
    console.log(`📝 Title: ${result.data.data.title}`);
    console.log(`🎯 Model: ${result.data.data.modelUsed}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Store result in global variable for inspection
    window.testResult = result.data;
    console.log('💾 Result stored in window.testResult');
    console.log('📋 Full result:', result.data);

    return result.data;

  } catch (error) {
    console.error('❌ ERROR:', error);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
    
    // Common error handling
    if (error.code === 'functions/not-found') {
      console.error('\n💡 Function not found. Deploy it first:');
      console.error('firebase deploy --only functions:generateAssignment');
    }
    
    if (error.code === 'functions/unauthenticated') {
      console.error('\n💡 Authentication required. Make sure user is logged in.');
    }
    
    throw error;
  }
})();

