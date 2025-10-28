import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { demoId } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  res.json({
    demoId,
    sequences: [
      {
        name: 'Welcome Series',
        emails: [
          { subject: 'Welcome!', timing: 'Immediate' },
          { subject: 'Getting Started', timing: 'Day 2' }
        ]
      }
    ]
  })
}