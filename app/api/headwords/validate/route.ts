import { HeadwordSchema } from '@/lib/schemas';
import { isHeadwordSupported } from '@/lib/headwords';

export async function POST(request: Request) {
  const parsed = HeadwordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return new Response(null, { status: 422 });
  }

  if (!(await isHeadwordSupported(parsed.data))) {
    return new Response(null, { status: 422 });
  }

  return Response.json(parsed.data);
}
