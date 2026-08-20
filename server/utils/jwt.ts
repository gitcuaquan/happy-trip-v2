import jwt from 'jsonwebtoken'

export interface JwtAdminPayload {
  id: string
  username: string
  full_name: string
}

export function generateAdminToken(payload: JwtAdminPayload): string {
  const config = useRuntimeConfig()
  const secret = config.jwtSecret || 'happytrip_jwt_secret_key_2026_super_secure'
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export function verifyAdminToken(token: string): JwtAdminPayload | null {
  const config = useRuntimeConfig()
  const secret = config.jwtSecret || 'happytrip_jwt_secret_key_2026_super_secure'
  try {
    return jwt.verify(token, secret) as JwtAdminPayload
  } catch {
    return null
  }
}
