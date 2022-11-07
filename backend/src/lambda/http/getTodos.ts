import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils'

// DONE: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      console.log('Processing event: ', event)

      const jwtToken = getUserId(event)
      const todos = await getTodosForUser(jwtToken)

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          items: todos
        })
      }
    } catch (error) {
      return {
        statusCode: error.statusCode || 400,
        body: error
      }
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)