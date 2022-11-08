import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'


const logger = createLogger('Get all Todos')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      logger.info('Processing event ', event)

      const userId = getUserId(event)
      logger.info('UserId', userId)

      const todos = await getTodosForUser(userId)
      logger.info('Todo list', todos)

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
      },
        body: JSON.stringify({
          items: todos
        })
      }
    } catch (error) {
      return {
        statusCode: error.statusCode || 400,
        body:JSON.stringify({
          error
        }),
        headers: {
          "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
      },
      }
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
