import { GoogleAuth } from 'google-auth-library';
import { NextRequest, NextResponse } from 'next/server';

const SHEET_ID = process.env.GOOGLE_SHEETS_ID!;
const SHEET_NAME = 'nepal-watch';

async function getAuthToken() {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, role, party, date, charge, status, source, notes } = body;

  if (!name || !charge || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const token = await getAuthToken();

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:H:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[name, role, party, date, charge, status, source, notes]],
      }),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    console.error('Sheets write error:', error);
    return NextResponse.json({ error: 'Failed to write to sheet' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}