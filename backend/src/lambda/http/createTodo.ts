import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
// import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('Create Todo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      logger.info('Processing event ', event)

      const newTodo: CreateTodoRequest = JSON.parse(event.body)
      logger.info('Create todo body', newTodo)

      const userId = getUserId(event)
      logger.info('UserId', userId)

      const newItem = await createTodo(userId, newTodo)
      logger.info('Added', newItem)

      return {
        statusCode: 201,
        body: JSON.stringify({
          item: newItem
        }),
        headers: {
          'Access-Control-Allow-Origin': '*', // Required for CORS support to work
          'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
        }
      }
    } catch (error) {
      return {
        statusCode: error.statusCode || 400,
        body: JSON.stringify({
          error
        }),
        headers: {
          'Access-Control-Allow-Origin': '*', // Required for CORS support to work
          'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
        }
      }
    }
  }
)

// handler.use(
//   cors({
//     credentials: true
//   })
// )
