// Quick test script to verify the Add Client API works
const testAddClient = async () => {
  const testData = {
    website_url: 'https://example.com',
    business_name: 'Test Business',
    industry: 'Technology',
    intelligence_data: {
      business: {
        name: 'Test Business',
        industry: 'Technology'
      },
      metadata: {
        url: 'https://example.com'
      }
    }
  };

  console.log('Testing POST /api/demos...');
  console.log('Request body:', JSON.stringify(testData, null, 2));

  try {
    const response = await fetch('http://localhost:3000/api/demos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('\nResponse status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS: Client added successfully!');
    } else {
      console.log('\n❌ ERROR: Failed to add client');
    }
  } catch (error) {
    console.error('\n❌ FETCH ERROR:', error.message);
  }
};

// Run the test
testAddClient();
