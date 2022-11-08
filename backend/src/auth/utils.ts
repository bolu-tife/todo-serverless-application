import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  console.log("inside ParseUserId")
  const decodedJwt = decode(jwtToken) as JwtPayload
  console.log("decode ", decodedJwt)
  return decodedJwt.sub
}
