import { NextRequest, NextResponse } from 'next/server';
import { suspects } from '@/app/lib/db';
import { updatePlayerInfo } from '@/app/lib/steam';
import { isValidSteamId } from '@/app/lib/utils';
import { Suspect } from '@/app/lib/types';

export async function GET() {
  try {
    const allSuspects = suspects.getAll();
    return NextResponse.json(allSuspects);
  } catch (error) {
    console.error('Error fetching suspects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suspects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { steam_id } = body;

    if (!steam_id) {
      return NextResponse.json(
        { error: 'Steam ID is required' },
        { status: 400 }
      );
    }

    if (!isValidSteamId(steam_id)) {
      return NextResponse.json(
        { error: 'Invalid Steam ID format' },
        { status: 400 }
      );
    }

    // Check if suspect already exists
    const existingSuspect = suspects.getBySteamId(steam_id);
    if (existingSuspect) {
      return NextResponse.json(
        { error: 'Suspect already exists' },
        { status: 409 }
      );
    }

    // Fetch player info from Steam API
    const playerInfo = await updatePlayerInfo(steam_id);
    
    const suspectData = {
      steam_id,
      nickname: playerInfo?.nickname || '',
      status: (playerInfo?.status as Suspect['status']) || 'offline',
      is_playing_cs2: playerInfo?.is_playing_cs2 || false,
      avatar_url: playerInfo?.avatar_url || '',
      profile_url: playerInfo?.profile_url || '',
      last_checked: playerInfo?.last_checked || new Date().toISOString()
    };

    const newSuspect = suspects.create(suspectData);
    return NextResponse.json(newSuspect, { status: 201 });
  } catch (error) {
    console.error('Error creating suspect:', error);
    return NextResponse.json(
      { error: 'Failed to create suspect' },
      { status: 500 }
    );
  }
}