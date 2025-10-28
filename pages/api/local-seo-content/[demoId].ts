import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { demoId } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  res.json({
    demoId,
    content: {
      title: 'Local SEO Content',
      description: 'SEO-optimized content for local search visibility',
      keywords: ['local business', 'nearby services'],
      pages: []
    }
  })
}