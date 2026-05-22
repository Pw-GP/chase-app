import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const { emailText } = await req.json()
  if (!emailText?.trim()) {
    return NextResponse.json({ error: 'No email text provided' }, { status: 400 })
  }

  const prompt = `You are an assistant for a construction project team. Analyse this email and extract the key action item.

Return ONLY valid JSON with these exact fields:
{
  "title": "short action title, max 80 chars",
  "summary": "1-2 sentence summary",
  "action_required": "the specific action needed",
  "responsible_party": "name of person or company responsible",
  "company": "their company",
  "discipline": "one of: Architecture, Structure, Services, Civil, Facade, Fire, Acoustic, ESD, Contractor, Client, Project Management, Cost Management, Other",
  "due_date": "YYYY-MM-DD or empty string",
  "register_type": "one of: RFI, APR, SUB, VAR, EOT, DEF, SI, ACT",
  "priority": "one of: High, Medium, Low",
  "status": "appropriate starting status",
  "suggested_follow_up_email": "draft follow-up email body"
}

Email:
${emailText}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = data.content?.[0]?.text ?? '{}'
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return NextResponse.json(parsed)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to parse response' }, { status: 500 })
  }
}