import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSteamPlayerSummaries, mapPlayerStateToStatus } from '@/lib/steam';

// POST /api/suspects/status/refresh - Batch refresh all suspect statuses
export async function POST(request: NextRequest) {
  try {
    if (!process.env.STEAM_API_KEY) {
      return NextResponse.json(
        { error: 'Steam API key not configured' },
        { status: 500 }
      );
    }

    // Get all suspects
    const suspects = db.prepare('SELECT * FROM suspects').all() as any[];
    
    if (suspects.length === 0) {
      return NextResponse.json({ updated: 0, errors: [] });
    }

    const steamIds = suspects.map(s => s.steam_id);
    const results = {
      updated: 0,
      errors: [] as string[]
    };

    try {
      // Fetch player summaries from Steam API
      const playerSummaries = await getSteamPlayerSummaries(steamIds);
      
      const updateStmt = db.prepare(`
        UPDATE suspects 
        SET nickname = ?, avatar_url = ?, status = ?, last_checked = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE steam_id = ?
      `);

      const insertHistoryStmt = db.prepare(`
        INSERT INTO suspect_status_history (suspect_id, old_status, new_status, nickname)
        VALUES (?, ?, ?, ?)
      `);

      for (const suspect of suspects) {
        try {
          const playerData = playerSummaries.find(p => p.steamid === suspect.steam_id);
          
          if (playerData) {
            const newStatus = mapPlayerStateToStatus(playerData.personastate, playerData.communityvisibilitystate);
            const nickname = playerData.personaname || suspect.nickname;
            const avatarUrl = playerData.avatarfull || suspect.avatar_url;

            // Update suspect
            updateStmt.run(nickname, avatarUrl, newStatus, suspect.steam_id);

            // Add to history if status changed
            if (newStatus !== suspect.status) {
              insertHistoryStmt.run(suspect.id, suspect.status, newStatus, nickname);
            }

            results.updated++;
          } else {
            // Player not found, mark as unknown
            updateStmt.run(suspect.nickname, suspect.avatar_url, 'unknown', suspect.steam_id);
            
            if (suspect.status !== 'unknown') {
              insertHistoryStmt.run(suspect.id, suspect.status, 'unknown', suspect.nickname);
            }
            
            results.updated++;
          }
        } catch (error) {
          results.errors.push(`Error updating ${suspect.steam_id}: ${error}`);
        }
      }

    } catch (error) {
      console.error('Steam API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch data from Steam API' },
        { status: 500 }
      );
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error refreshing suspect statuses:', error);
    return NextResponse.json(
      { error: 'Failed to refresh suspect statuses' },
      { status: 500 }
    );
  }
}