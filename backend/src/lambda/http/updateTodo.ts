import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
// import * as middy from 'middy'
// import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

export const handler = 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Processing event: ', event)
    try {
      const todoId = event.pathParameters.todoId
      console.log("todoId", todoId)
      const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
      console.log("updatedTodo", updatedTodo)
      // DONE: Update a TODO item with the provided id using values in the "updatedTodo" object
      const userId = getUserId(event)
      console.log("userId", userId)
      await updateTodo(userId, todoId, updatedTodo) 

      return {
        statusCode: 200,
        body: JSON.stringify({
          message:"updated completed"
          
        }),
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
