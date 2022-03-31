import type { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const url = decodeURIComponent(req.query.url as string);
  const result = await fetch(url);
  const body = await result.body;
  if (body) body.pipeThrough(res as any);
};