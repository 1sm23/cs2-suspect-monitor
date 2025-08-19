import { NextRequest, NextResponse } from 'next/server';
import { steamAPI } from '@/app/lib/steam';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get('steamId');

    if (!steamId) {
      return NextResponse.json(
        { error: 'Steam ID is required' },
        { status: 400 }
      );
    }

    const player = await steamAPI.getPlayerSummary(steamId);
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player data' },
      { status: 500 }
    );
  }
}