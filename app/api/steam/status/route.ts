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

    const gameStatus = await steamAPI.getPlayerCurrentGame(steamId);
    return NextResponse.json(gameStatus);
  } catch (error) {
    console.error('Error fetching player status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player status' },
      { status: 500 }
    );
  }
}