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

export async function getArrests(): Promise<Arrest[]> {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  const tableName = encodeURIComponent('Arrests');

  const res = await fetch(
    `https://api.airtable.com/v0/${baseId}/${tableName}?sort[0][field]=Date&sort[0][direction]=desc`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    const error = await res.json();
    console.error('Airtable error:', JSON.stringify(error, null, 2));
    throw new Error(`Airtable fetch failed: ${res.status}`);
  }

  const data = await res.json();

  return data.records.map((record: any) => ({
    id: record.id,
    name: record.fields['Name'] || '',
    role: record.fields['Role'] || '',
    party: record.fields['Party'] || '',
    date: record.fields['Date'] || '',
    charge: record.fields['Charge'] || '',
    status: record.fields['Status'] || 'Detained',
    source: record.fields['Source'] || '',
    notes: record.fields['Notes'] || '',
  }));
}
