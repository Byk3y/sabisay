#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * This script validates that all required environment variables are present
 * and have the correct shape before the build process starts.
 * 
 * Usage: node scripts/validate-env.js
 */

const path = require('path');
const fs = require('fs');

// ANSI color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function validateEnvironment() {
  log('🔍 Validating environment variables...', 'bold');
  
  try {
    // Load environment variables from .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    
    if (!fs.existsSync(envPath)) {
      logError('Environment file .env.local not found!');
      logInfo('Please create .env.local based on .env.local.example');
      process.exit(1);
    }

    // Load the environment file
    require('dotenv').config({ path: envPath });
    
    logInfo('Environment file loaded successfully');

    // Validate server environment variables directly
    log('Validating server environment variables...');
    const requiredServerVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'MAGIC_SECRET_KEY',
      'IRON_SESSION_PASSWORD',
      'PRIVATE_KEY',
    ];
    
    const missingServerVars = requiredServerVars.filter(varName => !process.env[varName]);
    if (missingServerVars.length > 0) {
      logError(`Missing required server variables: ${missingServerVars.join(', ')}`);
      process.exit(1);
    }
    logSuccess('All required server variables present');

    // Validate client environment variables
    log('Validating client environment variables...');
    const requiredClientVars = [
      'NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY',
      'NEXT_PUBLIC_RPC_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ];
    
    const missingClientVars = requiredClientVars.filter(varName => !process.env[varName]);
    if (missingClientVars.length > 0) {
      logError(`Missing required client variables: ${missingClientVars.join(', ')}`);
      process.exit(1);
    }
    logSuccess('All required client variables present');

    // Validate environment variable security
    log('Validating environment variable security...');
    
    // Check that server-only variables are not prefixed with NEXT_PUBLIC_
    const serverOnlyVars = [
      'PRIVATE_KEY',
      'MAGIC_SECRET_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'IRON_SESSION_PASSWORD',
      'ALCHEMY_AMOY_RPC_URL',
    ];
    
    const exposedSecrets = serverOnlyVars.filter(varName => process.env[`NEXT_PUBLIC_${varName}`]);
    if (exposedSecrets.length > 0) {
      logError(`Server secrets exposed as NEXT_PUBLIC_ variables: ${exposedSecrets.join(', ')}`);
      process.exit(1);
    }
    logSuccess('No server secrets exposed as public variables');

    // Validate RPC URL format
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    if (rpcUrl && !rpcUrl.startsWith('https://')) {
      logWarning('RPC URL should use HTTPS in production');
    }
    
    // Validate private key format
    const privateKey = process.env.PRIVATE_KEY;
    if (privateKey && !privateKey.match(/^0x[0-9a-fA-F]{64}$/)) {
      logError('PRIVATE_KEY must be a valid 64-character hex string starting with 0x');
      process.exit(1);
    }
    logSuccess('Private key format is valid');

    logSuccess('🎉 All environment validations passed!');
    logInfo('Environment is ready for build');
    
  } catch (error) {
    logError('Environment validation failed:');
    logError(error.message);
    logError(error.stack);
    process.exit(1);
  }
}

// Run validation
validateEnvironment().catch(error => {
  logError('Unexpected error during validation:');
  logError(error.message);
  process.exit(1);
});
