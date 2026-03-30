export type Arrest = {
  id: string;
  name: string;
  role: string;
  party: string;
  date: string;
  charge: string;
  status: 'Detained' | 'Released' | 'Charged';
  source: string;
  notes: string;
};

const SHEET_NAME = 'nepal-watch';
const SHEET_RANGE = `${SHEET_NAME}!A2:H1000`;

export async function getArrests(): Promise<Arrest[]> {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const range = encodeURIComponent(SHEET_RANGE);

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    const error = await res.json();
    console.error('Sheets error:', JSON.stringify(error, null, 2));
    throw new Error(`Google Sheets fetch failed: ${res.status}`);
  }

  const data = await res.json();
  const rows = data.values || [];

  return rows
    .filter((row: string[]) => row[0])
    .map((row: string[], index: number) => ({
      id: String(index),
      name: row[0] || '',
      role: row[1] || '',
      party: row[2] || '',
      date: row[3] || '',
      charge: row[4] || '',
      status: (row[5] as Arrest['status']) || 'Detained',
      source: row[6] || '',
      notes: row[7] || '',
    }))
    .sort((a: Arrest, b: Arrest) => new Date(b.date).getTime() - new Date(a.date).getTime());
}