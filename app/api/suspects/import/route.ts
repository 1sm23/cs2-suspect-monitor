import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { isValidSteamID, steamIdToProfileUrl } from '@/lib/steam';

// POST /api/suspects/import - Batch import suspects
export async function POST(request: NextRequest) {
  try {
    const { suspects } = await request.json();
    
    if (!Array.isArray(suspects)) {
      return NextResponse.json(
        { error: 'Suspects must be an array' },
        { status: 400 }
      );
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    };

    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO suspects (steam_id, nickname, profile_url, status)
      VALUES (?, ?, ?, ?)
    `);

    for (const suspect of suspects) {
      try {
        const { steam_id, nickname } = suspect;
        
        if (!steam_id || !isValidSteamID(steam_id)) {
          results.errors.push(`Invalid Steam ID: ${steam_id}`);
          continue;
        }

        const profileUrl = steamIdToProfileUrl(steam_id);
        const result = insertStmt.run(steam_id, nickname || null, profileUrl, 'unknown');
        
        if (result.changes > 0) {
          results.imported++;
        } else {
          results.skipped++;
        }
      } catch (error) {
        results.errors.push(`Error processing ${suspect.steam_id}: ${error}`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error importing suspects:', error);
    return NextResponse.json(
      { error: 'Failed to import suspects' },
      { status: 500 }
    );
  }
}