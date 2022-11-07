import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
      // DONE: Update a TODO item with the provided id using values in the "updatedTodo" object
      const jwtToken = getUserId(event)
      await updateTodo(jwtToken, todoId, updatedTodo) //throw unauthorized

      return {
        statusCode: 200,
        body: ''
      }

    } catch (error) {
      return {
        statusCode: error.statusCode || 400,
        body: error
      }
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
