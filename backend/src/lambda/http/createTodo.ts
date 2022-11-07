import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodo } from '../../businessLogic/todos'


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    try{
      const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // DONE: Implement creating a new TODO item

    const jwtToken =  getUserId(event)
    const newItem = await createTodo(jwtToken, newTodo)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem,
      })
    }

    }
    catch(error){
      return {
        statusCode: error.statusCode || 400 ,
        body:error
      }
    }

    }
    
)

handler.use(
  cors({
    credentials: true
  })
)

