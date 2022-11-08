import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentUtils } from '../dataLayer/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

const logger = createLogger('Todo Business Logic')

const todoAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return await todoAccess.getAllTodosForUser(userId)
}

export async function createTodo(
  userId: string,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const newItem = {
    todoId,
    userId,
    ...createTodoRequest,
    done: false,
    createdAt: new Date().toISOString()
  }

  logger.info(`Creating todo ${newItem} for userId, ${userId}`)
  await todoAccess.createTodo(newItem)

  return newItem
}

export async function updateTodo(
  userId: string,
  todoId: string,
  UpdateTodoRequest: UpdateTodoRequest
): Promise<void> {
  const todo = await todoAccess.getTodo(userId, todoId)
  logger.info(
    `Updating todo ${todo} for userId, ${userId}  with ${UpdateTodoRequest}`
  )

  if (!todo) createError(404, 'Todo Does not exist or belong to current user')

  await todoAccess.updateTodo(todoId, userId, UpdateTodoRequest)
}

export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<void> {
  const todo = await todoAccess.getTodo(userId, todoId)
  logger.info(`Deleting todo ${todo} for userId, ${userId}`)

  if (!todo) createError(404, 'Todo Does not exist or belong to current user')

  await todoAccess.deleteTodo(todoId, userId)
}

export async function createAttachmentPresignedUrl(
  userId: string,
  todoId: string
): Promise<string> {
  const todo = await todoAccess.getTodo(userId, todoId)
  logger.info(`Creating PresignedUrl for todo - ${todo}, userId  - ${userId}`)

  if (!todo) createError(404, 'Todo Does not exist or belong to current user')

  const attachmentId = uuid.v4()
  const attachmentUrl = await todoAccess.updateTodoAttachmentUrl(
    todoId,
    userId,
    attachmentId
  )
  logger.info(
    `Done updating attachment url for todoId ${todoId} - ${attachmentUrl}`
  )
  const uploadUrl = attachmentUtils.getUploadUrl(attachmentId)
  logger.info(`Done getting upload url for todoId ${todoId} - ${uploadUrl}`)
  console.log('done with get url')
  return uploadUrl
}
