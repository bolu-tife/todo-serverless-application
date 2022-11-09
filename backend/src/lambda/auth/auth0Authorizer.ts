import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { JwksClient } from 'jwks-rsa'
import { getToken } from '../utils'

const logger = createLogger('auth')

const jwksUrl = process.env.AUTH0_JWKS_URL
let cachedCertificate: string

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  const cert = await getCertificate(jwt.header.kid)

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

const getCertificate = async (kid: string): Promise<string> => {
  try {
    if (cachedCertificate) return cachedCertificate

    const client = new JwksClient({
      jwksUri: jwksUrl,
      requestHeaders: {}, // Optional
      timeout: 30000 // Defaults to 30s
    })

    const key = await client.getSigningKey(kid)
    const signingKey = key.getPublicKey()

    cachedCertificate = signingKey

    return cachedCertificate
  } catch (error) {
    throw new Error(error)
  }
}
