import { NextRequest, NextResponse } from 'next/server';

const NGROK_BASE_URL = 'https://yahir-unscorched-pierre.ngrok-free.dev';

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin || 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  const path = params.path.join('/');
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';
  
  const targetUrl = `${NGROK_BASE_URL}/${path}${queryString}`;
  
  try {
    // Get the request body for non-GET requests
    let requestBody: string | undefined;
    if (method !== 'GET') {
      requestBody = await request.text();
      console.log('API Proxy - Request body:', requestBody);
    }

    // Create headers object, ensuring Content-Type is set correctly
    const headers: Record<string, string> = {
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json',
    };

    // Copy other headers but avoid overriding Content-Type and host
    for (const [key, value] of request.headers.entries()) {
      if (key.toLowerCase() !== 'content-type' && key.toLowerCase() !== 'host') {
        headers[key] = value;
      }
    }
    
    // Ensure cookies are forwarded
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers['cookie'] = cookieHeader;
    }

    console.log('API Proxy - Target URL:', targetUrl);
    console.log('API Proxy - Headers:', headers);
    console.log('API Proxy - Method:', method);

    const response = await fetch(targetUrl, {
      method,
      headers,
      body: requestBody,
    });

    const data = await response.text();
    
    const origin = request.headers.get('origin');
    const responseHeaders: Record<string, string> = {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
      'Access-Control-Allow-Origin': origin || 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
      'Access-Control-Allow-Credentials': 'true',
    };
    
    // Forward Set-Cookie headers from the backend
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      responseHeaders['set-cookie'] = setCookieHeader;
    }
    
    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('API proxy error:', error);
    const origin = request.headers.get('origin');
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin || 'http://localhost:3000',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
          'Access-Control-Allow-Credentials': 'true',
        },
      }
    );
  }
}
