import { NextRequest } from 'next/server';
import { getSuspectById, updateSuspect, deleteSuspect, initDatabase } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    const { id } = await params;
    const suspect = await getSuspectById(parseInt(id));
    
    if (!suspect) {
      return Response.json({ error: 'Suspect not found' }, { status: 404 });
    }
    
    return Response.json(suspect);
  } catch (error) {
    console.error('Failed to fetch suspect:', error);
    return Response.json({ error: 'Failed to fetch suspect' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    const { id } = await params;
    const body = await request.json();
    
    const updatedSuspect = await updateSuspect(parseInt(id), body);
    
    if (!updatedSuspect) {
      return Response.json({ error: 'Suspect not found' }, { status: 404 });
    }
    
    return Response.json(updatedSuspect);
  } catch (error) {
    console.error('Failed to update suspect:', error);
    return Response.json({ error: 'Failed to update suspect' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    const { id } = await params;
    await deleteSuspect(parseInt(id));
    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to delete suspect:', error);
    return Response.json({ error: 'Failed to delete suspect' }, { status: 500 });
  }
}
