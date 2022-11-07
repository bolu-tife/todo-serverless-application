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
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()
  }

  async getAllTodosForUser(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosTableUserIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      })
      .promise()

    return result.Items as TodoItem[]
  }

  async getTodo(todoId: string): Promise<TodoItem> {
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: { todoId }
      })
      .promise()

    return result.Item as TodoItem
  }


  async deleteTodo(todoId: string, createdAt: string): Promise<void> {
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          todoId, // partition key
          createdAt //sort key
        }
      })
      .promise()
  }

  async updateTodo(
    todoId: string,
    createdAt: string,
    todo: TodoUpdate
  ): Promise<void> {
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId, // partition key
          createdAt //sort key
        },
        UpdateExpression: 'SET name = :name, dueDate =:dueDate, done =:done',
        ExpressionAttributeValues: {
          ':name': todo.name,
          ':dueDate': todo.dueDate,
          ':done': todo.done
        }
      })
      .promise()
  }

  async updateTodoAttachmentUrl(
    todoId: string,
    createdAt: string,
    attachmentId: TodoUpdate
  ): Promise<void> {
    const bucketName = process.env.ATTACHMENT_S3_BUCKET;
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId, // partition key
          createdAt //sort key
        },
        UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${attachmentId}`,
        }
      })
      .promise()
  }

}
