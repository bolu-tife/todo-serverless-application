import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess Data Layer')

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosTableUserIdIndex = process.env.TODOS_USERID_INDEX
  ) {}

  async createTodo(todo: TodoItem): Promise<void> {
    logger.info('Creating', todo)
    const result = await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()

      logger.info('Done creating todo:', result)
  }

  async getAllTodosForUser(userId: string): Promise<TodoItem[] | []> {
    logger.info('Getting all  todo for user,', userId)

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosTableUserIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      })
      .promise()

      logger.info(`Todos for ${userId}: ${result.Items}`)

    return result.Items as TodoItem[]
  }

  async getTodo(userId: string, todoId: string): Promise<TodoItem | null> {
    logger.info(`Getting todo with todoId ${todoId} for userId with ${userId}`)
    
    const queryResult = await this.getAllTodosForUser(userId)

    let result = []
    if (queryResult) result = queryResult.filter(todo  => todo.todoId === todoId)

    const todo = result.length == 0 ? null: result[0]
    logger.info(`Todo for ${userId} with todoId ${todoId} - ${todo}`)
   
    return todo
  }


  async deleteTodo(todoId: string, userId: string): Promise<void> {
    logger.info(`Deleting todo with todoId ${todoId} for userId with ${userId}`)
    const todo =  await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId, // partition key
          todoId,   //sort key
        },
        ReturnValues: "ALL_OLD",
      })
      .promise()

      logger.info(`Todo deleted - ${todo}`)
  }

  async updateTodo(
    todoId: string,
    userId: string,
    todo: TodoUpdate
  ): Promise<void> {
    logger.info(`Updating todo with todoId ${todoId} for userId with ${userId} - ${todo}`)
    const result = await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId, // partition key
          todoId,   //sort key
        },
        ExpressionAttributeNames: {
          "#name": "name", 
         },
        ExpressionAttributeValues: {
          ':name': todo.name,
          ':dueDate': todo.dueDate,
          ':done': todo.done
        },
        UpdateExpression: 'set #name = :name, dueDate =:dueDate, done =:done',
        ReturnValues:  "UPDATED_NEW",
      })
      .promise()

      logger.info(`Todo updated - ${result}`)
  }

  async updateTodoAttachmentUrl(
    todoId: string,
    userId: string,
    attachmentId: TodoUpdate
  ): Promise<string> {
    logger.info(`Updating todoId ${todoId} for userId ${userId} attachmentId -  ${attachmentId}`)

    const bucketName = process.env.ATTACHMENT_S3_BUCKET;
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${attachmentId}`
    const result = await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId, // partition key
          todoId,   //sort key
        },
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl,
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ReturnValues:  "UPDATED_NEW",
      })
      .promise()
      logger.info(`Todo attachmentUrl updated - ${result}`)

      return attachmentUrl

  }

}
