import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    try{
      const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
    const jwtToken = getUserId(event)
    await deleteTodo( jwtToken, todoId)
    
    return {
      statusCode: 200,
      body: "",
    }

    }catch(error){
      return {
        statusCode: error.statusCode || 400 ,
        body:error
      }
    }

  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
