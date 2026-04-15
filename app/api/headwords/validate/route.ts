import { validateQuery } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json();
  const result = await validateQuery(body.query, body.variety);

  if (!result.valid) {
    return Response.json({ valid: false }, { status: 422 });
  }

  return Response.json({ valid: true });
}
