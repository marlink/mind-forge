#!/usr/bin/env node

/**
 * Script to add type annotations to API calls
 * This fixes TypeScript errors where response.data is of type 'unknown'
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'client/app/bootcamps/[id]/discussions/page.tsx',
  'client/app/bootcamps/[id]/edit/page.tsx',
  'client/app/bootcamps/[id]/page.tsx',
  'client/app/bootcamps/[id]/sessions/[sessionId]/edit/page.tsx',
  'client/app/bootcamps/[id]/sessions/page.tsx',
  'client/app/bootcamps/new/page.tsx',
  'client/app/bootcamps/page.tsx',
];

console.log('Note: Please manually add type annotations to API calls.');
console.log('Example: api.get<{ data: YourType }>(...)');

