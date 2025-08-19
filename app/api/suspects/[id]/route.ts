import { NextRequest, NextResponse } from 'next/server';
import { suspects } from '@/app/lib/db';
import { updatePlayerInfo } from '@/app/lib/steam';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid suspect ID' },
        { status: 400 }
      );
    }

    const suspect = suspects.getById(id);
    if (!suspect) {
      return NextResponse.json(
        { error: 'Suspect not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(suspect);
  } catch (error) {
    console.error('Error fetching suspect:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suspect' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid suspect ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { refresh = false, ...updates } = body;

    // If refresh is requested, fetch latest data from Steam
    if (refresh) {
      const suspect = suspects.getById(id);
      if (suspect) {
        const playerInfo = await updatePlayerInfo(suspect.steam_id);
        if (playerInfo) {
          Object.assign(updates, playerInfo);
        }
      }
    }

    const updatedSuspect = suspects.update(id, updates);
    if (!updatedSuspect) {
      return NextResponse.json(
        { error: 'Suspect not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSuspect);
  } catch (error) {
    console.error('Error updating suspect:', error);
    return NextResponse.json(
      { error: 'Failed to update suspect' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid suspect ID' },
        { status: 400 }
      );
    }

    const deleted = suspects.delete(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Suspect not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting suspect:', error);
    return NextResponse.json(
      { error: 'Failed to delete suspect' },
      { status: 500 }
    );
  }
}