import { NextRequest, NextResponse } from 'next/server';

// Legacy authentication route - now using Steam API key authentication
// This route is kept for backward compatibility but no longer functional

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: 'This application now uses Steam API key authentication. Please use the login page.',
    deprecated: true,
    architecture: 'client-side',
    authentication: 'steam-api-key'
  }, { status: 200 });
}
