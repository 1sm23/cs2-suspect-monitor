import { NextRequest, NextResponse } from 'next/server';
import { getAllSuspects, createSuspect } from '@/lib/db';
import { getSteamIdFromUrl, getSteamProfile } from '@/lib/steam';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    const suspects = getAllSuspects();
    return NextResponse.json({ success: true, data: suspects });
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
    const { steamUrl, notes } = await request.json();

    if (!steamUrl) {
      return NextResponse.json(
        { error: 'Steam URL is required' },
        { status: 400 }
      );
    }

    // Extract Steam ID from URL
    const steamId = await getSteamIdFromUrl(steamUrl);
    if (!steamId) {
      return NextResponse.json(
        { error: 'Invalid Steam URL or ID' },
        { status: 400 }
      );
    }

    // Get Steam profile
    let profile;
    try {
      profile = await getSteamProfile(steamId);
    } catch (error) {
      console.error('Steam API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch Steam profile. Please check your Steam API key.' },
        { status: 400 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Steam profile not found' },
        { status: 404 }
      );
    }

    // Create suspect record
    const suspect = {
      id: randomBytes(16).toString('hex'),
      steamId: profile.steamid,
      displayName: profile.personaname,
      profileUrl: profile.profileurl,
      avatarUrl: profile.avatarfull || profile.avatar,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'monitoring' as const,
      notes: notes || '',
      tags: [],
      lastChecked: new Date().toISOString()
    };

    createSuspect(suspect);

    return NextResponse.json({ success: true, data: suspect });
  } catch (error) {
    console.error('Error creating suspect:', error);
    return NextResponse.json(
      { error: 'Failed to create suspect' },
      { status: 500 }
    );
  }
}