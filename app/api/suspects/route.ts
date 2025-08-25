import { NextRequest, NextResponse } from 'next/server';

// Legacy API route - now using client-side IndexedDB storage
// This route is kept for backward compatibility but no longer functional

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'This application now uses client-side IndexedDB storage. Please use the web interface.',
    deprecated: true,
    architecture: 'client-side'
  }, { status: 200 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: 'This application now uses client-side IndexedDB storage. Please use the web interface.',
    deprecated: true,
    architecture: 'client-side'
  }, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    message: 'This application now uses client-side IndexedDB storage. Please use the web interface.',
    deprecated: true,
    architecture: 'client-side'
  }, { status: 200 });
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({
    message: 'This application now uses client-side IndexedDB storage. Please use the web interface.',
    deprecated: true,
    architecture: 'client-side'
  }, { status: 200 });
}
