import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
// import * as middy from 'middy'
// import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodo } from '../../businessLogic/todos'


// export const handler = middy(
  export const handler = 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    try{
      console.log("Processing create function")
      const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // DONE: Implement creating a new TODO item
    console.log("adding", newTodo)
    const userId =  getUserId(event)
    console.log("userId", userId)
    const newItem = await createTodo(userId, newTodo)
    console.log("item added", newItem)
    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem,
      }),
      headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
    },
    }

    }
    catch(error){
      return {
        statusCode: error.statusCode || 400 ,
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
    


// handler.use(
//   cors({
//     credentials: true
//   })
// )

