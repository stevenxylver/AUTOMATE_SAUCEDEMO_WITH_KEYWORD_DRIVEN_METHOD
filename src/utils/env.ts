/**
 * Environment utility for loading environment-specific configuration
 */

import * as path from 'path';
import * as fs from 'fs';

// Define the Environment interface
export interface Environment {
  baseUrl: string;
  username?: string;
  password?: string;
  apiKey?: string;
  timeout?: number;
  [key: string]: any; // Allow for additional custom properties
}

// Default environment configurations
const environments: Record<string, Environment> = {
  dev: {
    baseUrl: 'http://localhost:3000',
    username: 'testuser',
    password: 'password123',
    timeout: 30000
  },
  staging: {
    baseUrl: 'https://staging.example.com',
    username: 'staginguser',
    password: 'stagingpass',
    timeout: 60000
  },
  prod: {
    baseUrl: 'https://example.com',
    timeout: 90000
  }
};

/**
 * Loads environment configuration
 * @param envName The environment name to load (dev, staging, prod)
 * @returns The environment configuration object
 */
export function loadEnvironment(envName: string): Environment {
  // Default to 'dev' if no environment is specified
  const env = envName.toLowerCase() || 'dev';
  
  // Check if the environment exists in our predefined environments
  if (!environments[env]) {
    console.warn(`Environment '${env}' not found. Using 'dev' environment.`);
    return environments['dev'];
  }
  
  // Try to load custom environment from file if it exists
  const envFilePath = path.resolve(process.cwd(), 'environments', `${env}.json`);
  
  if (fs.existsSync(envFilePath)) {
    try {
      const customEnv = JSON.parse(fs.readFileSync(envFilePath, 'utf8'));
      // Merge custom environment with default environment
      return { ...environments[env], ...customEnv };
    } catch (error) {
      console.error(`Error loading custom environment from ${envFilePath}:`, error);
    }
  }
  
  return environments[env];
}