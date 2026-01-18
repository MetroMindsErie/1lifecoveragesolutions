/**
 * Life Impact Map™ - Hackathon MVP Test
 * 
 * This script tests the full flow:
 * 1. Email enrichment
 * 2. Impact map generation
 * 3. Console output validation
 */

async function testFlow() {
  console.log('='.repeat(60));
  console.log('LIFE IMPACT MAP™ - HACKATHON MVP TEST');
  console.log('='.repeat(60));

  // Test data
  const testEmail = 'jordan@example.com';

  try {
    // Step 1: Enrich email
    console.log('\n📧 STEP 1: Enriching email...');
    console.log(`Input: ${testEmail}`);

    const enrichResponse = await fetch('/api/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    if (!enrichResponse.ok) {
      throw new Error(`Enrich API failed: ${enrichResponse.status}`);
    }

    const enrichData = await enrichResponse.json();
    console.log('✓ Enrichment successful');
    console.log('Profile:', enrichData.data);

    // Step 2: Generate impact map
    console.log('\n🗺️ STEP 2: Generating impact map...');
    const impactResponse = await fetch('/api/impact-map', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        ageRange: '40-49',
        maritalStatus: 'married',
      }),
    });

    if (!impactResponse.ok) {
      throw new Error(`Impact map API failed: ${impactResponse.status}`);
    }

    const impactData = await impactResponse.json();
    console.log('✓ Impact map generated');
    console.log('Impact Map:', impactData.data);

    // Step 3: Validate output structure
    console.log('\n✅ VALIDATION');
    const map = impactData.data;

    const checks = [
      ['Person data', !!map.person?.name],
      ['Income band', !!map.incomeBand],
      ['Dependents', Array.isArray(map.dependents) && map.dependents.length > 0],
      ['Exposure estimate', !!map.estimatedAnnualExposure],
      ['Coverage range', !!map.recommendedCoverageRange],
      ['Explanation', !!map.explanation],
    ];

    checks.forEach(([label, passed]) => {
      console.log(`${passed ? '✓' : '✗'} ${label}`);
    });

    const allPassed = checks.every(([_, p]) => p);
    console.log('\n' + '='.repeat(60));
    console.log(allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
    console.log('='.repeat(60));

    return allPassed;
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    return false;
  }
}

// Run test
testFlow().then((success) => {
  process.exit(success ? 0 : 1);
});
