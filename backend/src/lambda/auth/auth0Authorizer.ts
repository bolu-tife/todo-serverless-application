import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode, } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import {JwksClient} from "jwks-rsa"

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

  const cert =await getCertificate(jwt.header.kid)
  // DONE: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  //  const secret = GetPublicKeyOrSecret()
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
   
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

const getCertificate =  async(kid: string): Promise<string> => {
  try{
  if (cachedCertificate)return cachedCertificate

  // const response = await Axios.get(jwksUrl)
  // const keys = response.data.keys

  const client = new JwksClient({
    jwksUri: jwksUrl,
    requestHeaders: {}, // Optional
    timeout: 30000 // Defaults to 30s
  });

const key = await client.getSigningKey(kid);
const signingKey = key.getPublicKey();

cachedCertificate = signingKey

return cachedCertificate
} catch (error){
throw new Error (error)
}


}
  // getSigningKeys(cb) {

  //   if (!keys || !keys.length) {
  //     throw new Error('The JWKS endpoint did not contain any keys');
  //   }

  //   const signingKeys = keys
  //     .filter(key => key.use === 'sig' // JWK property `use` determines the JWK is for signature verification
  //                 && key.kty === 'RSA' // We are only supporting RSA (RS256)
  //                 && key.kid           // The `kid` must be present to be useful for later
  //                 && ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
  //     ).map(key => {
  //       return { kid: key.kid, nbf: key.nbf, publicKey: key.x5c[0] };
  //     });

  // //   // If at least one signing key doesn't exist we have a problem... Kaboom.
  //   if (!signingKeys.length) {
  //     throw new Error('The JWKS endpoint did not contain any signature verification keys');
  //   }

  //   const signingKey = keys.find(key => key.kid === kid);

  //     if (!signingKey) {
  //       throw new Error(`Unable to find a signing key that matches '${kid}'`);
  //     }


