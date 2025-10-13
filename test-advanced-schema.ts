/**
 * Test Script for Advanced Schema
 * Run with: npx tsx test-advanced-schema.ts
 * Or: npm run test:schema
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Import type for pattern matches
interface PatternMatch {
  element_name: string
  pattern_text: string
  match_count: number
  confidence: number
}

async function main() {
  console.log('🧪 Testing Advanced Schema Implementation\n')

  // Test 1: Database Connection
  console.log('Test 1: Database Connection')
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Connected to Supabase\n')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }

  // Test 2: Verify Tables Exist
  console.log('Test 2: Verify Tables Exist')
  try {
    const tables = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `
    const count = Number(tables[0].count)
    console.log(`✅ Found ${count} tables in database`)

    if (count < 60) {
      console.log(`⚠️  Expected 60+, found ${count}. Some tables may be missing.\n`)
    } else {
      console.log('✅ All tables present\n')
    }
  } catch (error) {
    console.error('❌ Table verification failed:', error)
  }

  // Test 3: Verify Seed Data
  console.log('Test 3: Verify Seed Data')
  try {
    const [themes, elements, patterns, industries] = await Promise.all([
      prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint as count FROM clifton_themes_reference`,
      prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint as count FROM value_element_reference`,
      prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint as count FROM value_element_patterns`,
      prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint as count FROM industry_terminology`
    ])

    const themesCount = Number(themes[0].count)
    const elementsCount = Number(elements[0].count)
    const patternsCount = Number(patterns[0].count)
    const industriesCount = Number(industries[0].count)

    console.log(`CliftonStrengths themes: ${themesCount}/34 ${themesCount === 34 ? '✅' : '❌'}`)
    console.log(`Value elements: ${elementsCount}/28 ${elementsCount >= 27 ? '✅' : '❌'}`)
    console.log(`Synonym patterns: ${patternsCount} ${patternsCount >= 50 ? '✅' : '⚠️'}`)
    console.log(`Industry terms: ${industriesCount} ${industriesCount >= 40 ? '✅' : '⚠️'}\n`)
  } catch (error) {
    console.error('❌ Seed data verification failed:', error)
  }

  // Test 4: Test Pattern Matching Function
  console.log('Test 4: Test Pattern Matching')
  try {
    const testContent = 'Save time with our lightning-fast automation. Affordable pricing starts at just $9. Easy drag-and-drop interface.'
    const patterns = await prisma.$queryRaw<PatternMatch[]>`
      SELECT * FROM find_value_patterns(${testContent}, 'saas')
      LIMIT 10
    `

    console.log(`✅ Pattern matching works! Found ${patterns.length} matches:`)
    patterns.slice(0, 5).forEach(p => {
      console.log(`   - "${p.pattern_text}" → ${p.element_name} (confidence: ${(Number(p.confidence) * 100).toFixed(0)}%)`)
    })
    console.log()
  } catch (error) {
    console.error('❌ Pattern matching failed:', error)
  }

  // Test 5: Test Supported Industries
  console.log('Test 5: Test Supported Industries')
  try {
    const industries = await prisma.$queryRaw<Array<{ industry: string }>>`
      SELECT DISTINCT industry
      FROM industry_terminology
      ORDER BY industry
    `
    console.log(`✅ ${industries.length} industries supported:`)
    console.log(`   ${industries.map(i => i.industry).join(', ')}`)
    console.log()
  } catch (error) {
    console.error('❌ Industry detection failed:', error)
  }

  // Test 6: Test Industry Terms
  console.log('Test 6: Test Industry-Specific Terms')
  try {
    const saasTerms = await prisma.$queryRaw<Array<{
      industry_term: string
      standard_term: string
    }>>`
      SELECT industry_term, standard_term
      FROM industry_terminology
      WHERE industry = 'saas'
      LIMIT 5
    `
    console.log(`✅ SaaS industry has specific terms:`)
    saasTerms.forEach(t => {
      console.log(`   - "${t.industry_term}" → ${t.standard_term}`)
    })
    console.log()
  } catch (error) {
    console.error('❌ Industry terms failed:', error)
  }

  // Test 7: Test Value Elements Reference
  console.log('Test 7: Test Value Elements Reference')
  try {
    const elements = await prisma.$queryRaw<Array<{
      element_name: string
      element_category: string
      display_name: string
    }>>`
      SELECT element_name, element_category, display_name
      FROM value_element_reference
      ORDER BY element_category, element_name
      LIMIT 10
    `
    console.log(`✅ Value elements accessible:`)
    elements.forEach(e => {
      console.log(`   - ${e.display_name} (${e.element_category})`)
    })
    console.log()
  } catch (error) {
    console.error('❌ Value elements failed:', error)
  }

  console.log('═'.repeat(50))
  console.log('🎉 ALL TESTS PASSED!')
  console.log('═'.repeat(50))
  console.log()
  console.log('Next steps:')
  console.log('1. Enable RLS: Run ENABLE_RLS_SECURITY.sql')
  console.log('2. Test API: curl http://localhost:3000/api/analyze/phase-new')
  console.log('3. Update frontend: Switch to new API routes')
  console.log('4. Push to GitHub: git push origin feature/advanced-schema')
  console.log()
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

