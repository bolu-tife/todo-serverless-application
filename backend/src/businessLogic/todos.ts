import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentUtils } from '../dataLayer/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { parseUserId } from '../auth/utils'

// TODO: Implement businessLogic
const todoAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getTodosForUser(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)
  return await todoAccess.getAllTodosForUser(userId)
}

export async function createTodo(
  jwtToken: string,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {

  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)

  const newItem = {
    todoId,
    userId,
    ...createTodoRequest,
    done: false,
    createdAt: new Date().toISOString(),
  }
  await todoAccess.createTodo(newItem)

  return newItem
}

export async function updateTodo(
  jwtToken: string,
  todoId: string,
  UpdateTodoRequest: UpdateTodoRequest
): Promise<void> {
  const userId = parseUserId(jwtToken)

  const todo = await todoAccess.getTodo(todoId)
  if (!todo) createError(404, 'Todo Does not exist')
  if (todo.userId !== userId) createError(404, 'Todo Does not belong to user');

  await todoAccess.updateTodo(
    todoId,
    todo.createdAt,
    UpdateTodoRequest
  )
}

export async function deleteTodo(
  jwtToken: string,
  todoId: string
): Promise<void> {
  const userId = parseUserId(jwtToken)

  const todo = await todoAccess.getTodo(todoId)
  if (!todo) createError(404, 'Todo Does not exist')
  if (todo.userId !== userId) createError(404, 'Todo Does not belong to user');
  
  await todoAccess.deleteTodo(todoId, todo.createdAt)
}

  export async function createAttachmentPresignedUrl(
    jwtToken: string,
    todoId: string,
  ): Promise<string> {

  const userId = parseUserId(jwtToken)
  const todo = await todoAccess.getTodo(todoId)
  if (!todo) createError(404, 'Todo Does not exist');

  if (todo.userId !== userId) createError(404, 'Todo Does not belong to user');

  const attachmentId = uuid.v4()
  await todoAccess.updateTodoAttachmentUrl(  todoId, todo.createdAt, attachmentId)
  
  const uploadUrl = attachmentUtils.getUploadUrl(attachmentId)
    return uploadUrl;
  }
