const fs = require('fs');

// Read the markdown file
const content = fs.readFileSync('complete_schema_md.md', 'utf-8');

// Extract SQL blocks
const sqlBlocks = [];
const lines = content.split('\n');
let inSqlBlock = false;
let currentBlock = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.trim() === '```sql') {
    inSqlBlock = true;
    continue;
  }
  
  if (line.trim() === '```' && inSqlBlock) {
    inSqlBlock = false;
    if (currentBlock.length > 0) {
      sqlBlocks.push(currentBlock.join('\n'));
      currentBlock = [];
    }
    continue;
  }
  
  if (inSqlBlock) {
    currentBlock.push(line);
  }
}

// Combine all SQL blocks
const completeSql = sqlBlocks.join('\n\n');

// Write to file
fs.writeFileSync('supabase-advanced-schema-complete.sql', completeSql);

console.log(`✅ Extracted ${sqlBlocks.length} SQL blocks`);
console.log(`✅ Total lines: ${completeSql.split('\n').length}`);
console.log(`✅ Written to: supabase-advanced-schema-complete.sql`);
