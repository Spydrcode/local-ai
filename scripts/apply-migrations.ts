/**
 * Apply pending migrations to remote Supabase database
 *
 * Usage: npx tsx scripts/apply-migrations.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations');

interface Migration {
  filename: string;
  version: string;
  sql: string;
}

async function main() {
  console.log('🚀 Starting migration process...\n');

  // Create schema_migrations table if not exists
  await createMigrationsTable();

  // Get all migration files
  const migrations = await getMigrations();
  console.log(`📁 Found ${migrations.length} migration files\n`);

  // Get applied migrations
  const applied = await getAppliedMigrations();
  console.log(`✅ ${applied.size} migrations already applied\n`);

  // Filter pending migrations
  const pending = migrations.filter((m) => !applied.has(m.version));

  if (pending.length === 0) {
    console.log('✨ All migrations are up to date!');
    return;
  }

  console.log(`📝 Pending migrations: ${pending.length}\n`);

  // Apply each pending migration
  for (const migration of pending) {
    try {
      console.log(`⏳ Applying: ${migration.filename}...`);
      await applyMigration(migration);
      console.log(`✅ Success: ${migration.filename}\n`);
    } catch (error: any) {
      console.error(`❌ Failed: ${migration.filename}`);
      console.error(`Error: ${error.message}\n`);

      // Continue with other migrations
      continue;
    }
  }

  console.log('\n✨ Migration process complete!');
}

async function createMigrationsTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  });

  if (error) {
    // If rpc doesn't exist, try direct SQL
    const { error: sqlError } = await supabase.from('schema_migrations').select('version').limit(1);

    if (sqlError && sqlError.code === '42P01') {
      // Table doesn't exist, create it manually
      console.log('⚠️  Note: Creating schema_migrations table manually via Supabase dashboard may be required');
    }
  }
}

async function getMigrations(): Promise<Migration[]> {
  const files = fs.readdirSync(MIGRATIONS_DIR);

  const migrations = files
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((filename) => {
      const filePath = path.join(MIGRATIONS_DIR, filename);
      const sql = fs.readFileSync(filePath, 'utf-8');
      const version = filename.replace('.sql', '');

      return { filename, version, sql };
    });

  return migrations;
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('schema_migrations')
    .select('version');

  if (error) {
    // Table might not exist yet
    return new Set();
  }

  return new Set((data || []).map((row: any) => row.version));
}

async function applyMigration(migration: Migration) {
  // Note: Supabase doesn't support executing arbitrary SQL via the client library
  // for security reasons. We'll need to use the Management API or manual application.

  console.log('⚠️  This migration needs to be applied manually via Supabase SQL Editor:');
  console.log(`   https://supabase.com/dashboard/project/dtegqjoqywlxzsfkurzh/sql/new`);
  console.log(`\n📋 Migration: ${migration.filename}`);
  console.log('─'.repeat(80));
  console.log(migration.sql);
  console.log('─'.repeat(80));

  // Ask for confirmation
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<void>((resolve) => {
    readline.question('\n✓ Applied? (y/n): ', async (answer: string) => {
      readline.close();

      if (answer.toLowerCase() === 'y') {
        // Record migration as applied
        await supabase.from('schema_migrations').insert({
          version: migration.version,
          applied_at: new Date().toISOString(),
        });
        resolve();
      } else {
        throw new Error('Migration skipped by user');
      }
    });
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
