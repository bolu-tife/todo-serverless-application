import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
// import * as middy from 'middy'
// import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'


const logger = createLogger('Generate UploadUrl Todo')
export const handler = 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try{
      logger.info('Processing event ', event)

      const todoId = event.pathParameters.todoId
      logger.info('todoId', todoId)

    const userId = getUserId(event)
    logger.info('UserId', userId)

    const url = await createAttachmentPresignedUrl(userId, todoId)
    logger.info('uploadUrl', url)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: url
      }),

      headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
    },
    }

    }
    catch(error){
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
// )

// handler
//   .use(httpErrorHandler())
//   .use(
//     cors({
//       credentials: true
//     })
//   )
