import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId } from "../auth/utils";

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const jwtToken = getToken(authorization)

  return parseUserId(jwtToken)
}

/**
 * Get a Jwt token from an auth header event
 * @param authorization an authorization header from API Gateway  event
 *
 * @returns a JWT token  from authorization header
 */
export function getToken(authorization: string): string {
  if (!authorization) throw new Error('No authentication header')

  if (!authorization.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authorization.split(' ')
  const token = split[1]

  return token 
}
