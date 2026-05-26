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
  "summary": "1-2 sentence summary of the email context",
  "action_required": "the specific action that needs to happen",
  "responsible_party": "name of the person or company responsible",
  "company": "their company or organisation",
  "discipline": "one of: Architecture, Structure, Services, Civil, Facade, Fire, Acoustic, ESD, Contractor, Client, Project Management, Cost Management, Other",
  "due_date": "YYYY-MM-DD format, or empty string if not mentioned",
  "register_type": "one of: RFI, APR, SUB, VAR, EOT, DEF, SI, ACT",
  "priority": "one of: High, Medium, Low",
  "status": "the most appropriate starting status for this type",
  "suggested_follow_up_email": "a draft professional follow-up email body if this item is not actioned"
}

Register type guide:
- RFI: Request for information or clarification
- APR: Approval required (samples, shop drawings, materials)
- SUB: Submittal of drawings or documentation for review
- VAR: Variation or change to the contract
- EOT: Extension of time claim
- DEF: Defect or non-conformance issue
- SI: Site instruction from superintendent
- ACT: General action or follow-up item

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
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', err)
      return NextResponse.json({ error: 'Extraction failed' }, { status: 502 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? '{}'
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Extract error:', err)
    return NextResponse.json({ error: 'Failed to parse response' }, { status: 500 })
  }
}
