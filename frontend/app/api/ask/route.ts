import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, context, page } = body;

    const backendURL = 'http://localhost:8000/ask';

    const response = await fetch(backendURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question,
        context,
        page
      })
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to get response from backend' }), {
        status: 500
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Something went wrong in ask route' }), {
      status: 500
    });
  }
}
