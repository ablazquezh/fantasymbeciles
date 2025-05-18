// pages/api/verify.ts
export const TOTP_SECRET = process.env.TOTP_SECRET!
import speakeasy from 'speakeasy'
import { serialize } from 'cookie'
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { code } = req.body

  const verified = speakeasy.totp.verify({
    secret: TOTP_SECRET,
    encoding: 'base32',
    token: code,
    window: 1,
  })

  if (!verified) {
    return res.status(401).json({ error: 'Invalid code' })
  }

  const cookie = serialize('auth', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 6 * 60 * 60, // 6 hours
    path: '/',
  })

  res.setHeader('Set-Cookie', cookie)
  return res.status(200).json({ success: true })
}
