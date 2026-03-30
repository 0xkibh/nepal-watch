import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  let articleText = '';
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const html = await res.text();
    articleText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 4000);
  } catch {
    return NextResponse.json({ error: 'Could not fetch article' }, { status: 400 });
  }

  const prompt = `You are a data extraction assistant for Nepal Watch, a site tracking arrests made by Nepal's RSP government.

Read this news article and extract arrest information. Return ONLY a JSON object, no explanation, no markdown, no backticks.

If the article is not about an arrest, return: {"is_arrest": false}

If it is about an arrest, return:
{
  "is_arrest": true,
  "name": "Full name of arrested person",
  "role": "Their political role or profession",
  "party": "Their political party if mentioned",
  "date": "Date of arrest in YYYY-MM-DD format",
  "charge": "The reason or charge for arrest",
  "status": "Detained or Released or Charged",
  "notes": "Any other relevant context in one sentence"
}

Article URL: ${url}
Article content: ${articleText}`;

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${process.env.GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 },
      }),
    }
  );

  if (!geminiRes.ok) {
    const error = await geminiRes.json();
    console.error('Gemini error:', error);
    return NextResponse.json({ error: 'AI extraction failed' }, { status: 500 });
  }

  const geminiData = await geminiRes.json();
  const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

  try {
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch {
    console.error('Parse error:', rawText);
    return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 });
  }
}