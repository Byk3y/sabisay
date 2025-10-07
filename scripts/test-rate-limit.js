#!/usr/bin/env node

/**
 * Rate Limiting Verification Script
 * 
 * This script tests the rate limiting functionality by making multiple
 * requests to the /api/auth/me endpoint and verifying that rate limiting
 * kicks in after the limit is exceeded.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const ENDPOINT = '/api/auth/me';
const RATE_LIMIT = 60; // requests per minute
const TEST_REQUESTS = 65; // Should trigger rate limiting

async function makeRequest(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return {
      status: response.status,
      headers: {
        'x-ratelimit-limit': response.headers.get('x-ratelimit-limit'),
        'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
        'x-ratelimit-reset': response.headers.get('x-ratelimit-reset'),
        'retry-after': response.headers.get('retry-after'),
      },
      body: await response.text(),
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
    };
  }
}

async function testRateLimiting() {
  console.log(`🧪 Testing rate limiting on ${BASE_URL}${ENDPOINT}`);
  console.log(`📊 Expected limit: ${RATE_LIMIT} requests per minute`);
  console.log(`🚀 Making ${TEST_REQUESTS} requests...\n`);

  const results = [];
  const startTime = Date.now();

  // Make requests in batches to avoid overwhelming the server
  for (let i = 0; i < TEST_REQUESTS; i++) {
    const result = await makeRequest(`${BASE_URL}${ENDPOINT}`);
    results.push(result);
    
    // Log progress every 10 requests
    if ((i + 1) % 10 === 0) {
      console.log(`📈 Made ${i + 1} requests...`);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Analyze results
  const successCount = results.filter(r => r.status === 200 || r.status === 401).length;
  const rateLimitedCount = results.filter(r => r.status === 429).length;
  const errorCount = results.filter(r => r.status === 0 || (r.status >= 400 && r.status !== 401 && r.status !== 429)).length;

  console.log('\n📊 Results:');
  console.log(`✅ Successful requests: ${successCount}`);
  console.log(`🚫 Rate limited requests: ${rateLimitedCount}`);
  console.log(`❌ Error requests: ${errorCount}`);
  console.log(`⏱️  Total duration: ${duration}ms`);

  // Check if rate limiting worked
  if (rateLimitedCount > 0) {
    console.log('\n🎉 Rate limiting is working!');
    
    // Show details of rate limited responses
    const rateLimitedResults = results.filter(r => r.status === 429);
    const firstRateLimited = rateLimitedResults[0];
    
    console.log('\n📋 Rate limit response details:');
    console.log(`   Status: ${firstRateLimited.status}`);
    console.log(`   X-RateLimit-Limit: ${firstRateLimited.headers['x-ratelimit-limit']}`);
    console.log(`   X-RateLimit-Remaining: ${firstRateLimited.headers['x-ratelimit-remaining']}`);
    console.log(`   X-RateLimit-Reset: ${firstRateLimited.headers['x-ratelimit-reset']}`);
    console.log(`   Retry-After: ${firstRateLimited.headers['retry-after']}`);
    
    // Verify headers are present
    const hasRequiredHeaders = 
      firstRateLimited.headers['x-ratelimit-limit'] &&
      firstRateLimited.headers['x-ratelimit-remaining'] &&
      firstRateLimited.headers['x-ratelimit-reset'] &&
      firstRateLimited.headers['retry-after'];
    
    if (hasRequiredHeaders) {
      console.log('✅ All required rate limit headers are present');
    } else {
      console.log('❌ Missing required rate limit headers');
    }
    
    return true;
  } else {
    console.log('\n❌ Rate limiting is not working - no 429 responses received');
    return false;
  }
}

// Run the test
testRateLimiting()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });







