const fs = require('fs');

const sql = fs.readFileSync('supabase-advanced-schema-complete.sql', 'utf-8');

// Replace 'users' references with '"User"' to match Prisma
// Replace 'analyses' references with '"Analysis"' to match Prisma
let compatible = sql
  .replace(/REFERENCES users\(/g, 'REFERENCES "User"(')
  .replace(/FROM users/g, 'FROM "User"')
  .replace(/UPDATE users/g, 'UPDATE "User"')
  .replace(/REFERENCES analyses\(/g, 'REFERENCES "Analysis"(')
  .replace(/FROM analyses/g, 'FROM "Analysis"')
  .replace(/CREATE TABLE users \(/g, '-- CREATE TABLE users ( -- EXISTS AS "User"\n-- ')
  .replace(/CREATE TABLE analyses \(/g, '-- CREATE TABLE analyses ( -- EXISTS AS "Analysis"\n-- ');

// Add header
const header = `-- =====================================================
-- ZERO BARRIERS ADVANCED SCHEMA - PRISMA COMPATIBLE
-- Version: 2.0
-- Compatibility: Works with existing Prisma User/Analysis tables
-- Total New Tables: 78
-- Synonym Patterns: 150+
-- =====================================================

-- IMPORTANT: This schema extends your existing Prisma schema
-- Tables "User" and "Analysis" already exist
-- This adds synonym detection and detailed tracking

-- =====================================================

`;

const final = header + compatible;

fs.writeFileSync('supabase-advanced-schema-prisma-compatible.sql', final);
console.log('✅ Created Prisma-compatible SQL file');
console.log(`✅ File: supabase-advanced-schema-prisma-compatible.sql`);
console.log(`✅ Lines: ${final.split('\n').length}`);
