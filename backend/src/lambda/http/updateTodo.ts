import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
// import * as middy from 'middy'
// import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'


const logger = createLogger('Update Todo')
export const handler = 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      logger.info('Processing event ', event)

      const todoId = event.pathParameters.todoId
      logger.info('TodoId', todoId)

      const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
      updatedTodo.name = updatedTodo.name.trim()
      logger.info('Update todo body', updatedTodo)

      const userId = getUserId(event)
      logger.info('UserId', userId)
      
      await updateTodo(userId, todoId, updatedTodo) 

      return {
        statusCode: 200,
        body: "",
        headers: {
          "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
      },
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


// handler.use(httpErrorHandler()).use(
//   cors({
//     credentials: true
//   })
// )
