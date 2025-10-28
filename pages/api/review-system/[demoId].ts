import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { demoId } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  res.json({
    demoId,
    system: {
      automatedRequests: true,
      followUpSequence: ['Day 1: Thank you email', 'Day 3: Review request'],
      platforms: ['Google', 'Facebook', 'Yelp']
    }
  })
}