import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

// const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosTableUserIdIndex = process.env.TODOS_USERID_INDEX
  ) {}

  async createTodo(todo: TodoItem): Promise<void> {
    console.log("inside createDl", todo)
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()
    console.log("done creating inside dl")
  }

  async getAllTodosForUser(userId: string): Promise<TodoItem[]> {
    console.log("inside getAll", userId)
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosTableUserIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      })
      .promise()

      console.log("done with getAll", result)

    return result.Items as TodoItem[]
  }

  async getTodo(userId: string,todoId: string): Promise<TodoItem> {
    console.log("inside getTodo datalayer")
    console.log(userId)
    const queryResult = await this.getAllTodosForUser(userId)

    const result = queryResult.filter(todo  => todo.todoId === todoId)
    console.log("done with getTodo", result)

    return result[0] as TodoItem
  }


  async deleteTodo(todoId: string, userId: string): Promise<void> {
    console.log("inside deleteTodo datalayer")
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId, // partition key
          todoId,   //sort key
         
        }
      })
      .promise()
      console.log("done with deleteTodo datalayer")
  }

  async updateTodo(
    todoId: string,
    userId: string,
    todo: TodoUpdate
  ): Promise<void> {
    await this.docClient
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
      })
      .promise()
  }

  async updateTodoAttachmentUrl(
    todoId: string,
    userId: string,
    attachmentId: TodoUpdate
  ): Promise<void> {
    console.log("inside updateTodoAttachmentUrl")
    const bucketName = process.env.ATTACHMENT_S3_BUCKET;
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId, // partition key
          todoId,   //sort key
        },
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${attachmentId}`,
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      })
      .promise()
    console.log("done with updateTodoAttachmentUrl")
  }

}
