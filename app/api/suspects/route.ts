import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { isValidSteamID, steamIdToProfileUrl } from '@/lib/steam';

// GET /api/suspects - List all suspects
export async function GET() {
  try {
    const suspects = db.prepare('SELECT * FROM suspects ORDER BY created_at DESC').all();
    return NextResponse.json(suspects);
  } catch (error) {
    console.error('Error fetching suspects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suspects' },
      { status: 500 }
    );
  }
}

// POST /api/suspects - Create new suspect
export async function POST(request: NextRequest) {
  try {
    const { steam_id, nickname } = await request.json();

    if (!steam_id || !isValidSteamID(steam_id)) {
      return NextResponse.json(
        { error: 'Invalid Steam ID. Must be 17 digits.' },
        { status: 400 }
      );
    }

    // Check if suspect already exists
    const existing = db.prepare('SELECT id FROM suspects WHERE steam_id = ?').get(steam_id);
    if (existing) {
      return NextResponse.json(
        { error: 'Suspect already exists' },
        { status: 409 }
      );
    }

    const profileUrl = steamIdToProfileUrl(steam_id);
    
    const result = db.prepare(`
      INSERT INTO suspects (steam_id, nickname, profile_url, status)
      VALUES (?, ?, ?, ?)
    `).run(steam_id, nickname || null, profileUrl, 'unknown');

    const suspect = db.prepare('SELECT * FROM suspects WHERE id = ?').get(result.lastInsertRowid);
    
    return NextResponse.json(suspect, { status: 201 });
  } catch (error) {
    console.error('Error creating suspect:', error);
    return NextResponse.json(
      { error: 'Failed to create suspect' },
      { status: 500 }
    );
  }
}