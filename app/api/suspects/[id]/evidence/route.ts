import { NextRequest, NextResponse } from 'next/server';
import { evidence, suspects } from '@/app/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const suspectId = parseInt(params.id);
    if (isNaN(suspectId)) {
      return NextResponse.json(
        { error: 'Invalid suspect ID' },
        { status: 400 }
      );
    }

    // Check if suspect exists
    const suspect = suspects.getById(suspectId);
    if (!suspect) {
      return NextResponse.json(
        { error: 'Suspect not found' },
        { status: 404 }
      );
    }

    const evidenceList = evidence.getBySuspectId(suspectId);
    return NextResponse.json(evidenceList);
  } catch (error) {
    console.error('Error fetching evidence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evidence' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const suspectId = parseInt(params.id);
    if (isNaN(suspectId)) {
      return NextResponse.json(
        { error: 'Invalid suspect ID' },
        { status: 400 }
      );
    }

    // Check if suspect exists
    const suspect = suspects.getById(suspectId);
    if (!suspect) {
      return NextResponse.json(
        { error: 'Suspect not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { type, content, description, importance = 1 } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: 'Type and content are required' },
        { status: 400 }
      );
    }

    if (!['text', 'link', 'video', 'image'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid evidence type' },
        { status: 400 }
      );
    }

    if (importance < 1 || importance > 5) {
      return NextResponse.json(
        { error: 'Importance must be between 1 and 5' },
        { status: 400 }
      );
    }

    const evidenceData = {
      suspect_id: suspectId,
      type,
      content,
      description,
      importance
    };

    const newEvidence = evidence.create(evidenceData);
    return NextResponse.json(newEvidence, { status: 201 });
  } catch (error) {
    console.error('Error creating evidence:', error);
    return NextResponse.json(
      { error: 'Failed to create evidence' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const evidenceId = url.searchParams.get('evidenceId');
    
    if (!evidenceId) {
      return NextResponse.json(
        { error: 'Evidence ID is required' },
        { status: 400 }
      );
    }

    const id = parseInt(evidenceId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid evidence ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updatedEvidence = evidence.update(id, body);
    
    if (!updatedEvidence) {
      return NextResponse.json(
        { error: 'Evidence not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedEvidence);
  } catch (error) {
    console.error('Error updating evidence:', error);
    return NextResponse.json(
      { error: 'Failed to update evidence' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const evidenceId = url.searchParams.get('evidenceId');
    
    if (!evidenceId) {
      return NextResponse.json(
        { error: 'Evidence ID is required' },
        { status: 400 }
      );
    }

    const id = parseInt(evidenceId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid evidence ID' },
        { status: 400 }
      );
    }

    const deleted = evidence.delete(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Evidence not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting evidence:', error);
    return NextResponse.json(
      { error: 'Failed to delete evidence' },
      { status: 500 }
    );
  }
}