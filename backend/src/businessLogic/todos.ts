import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentUtils } from '../dataLayer/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
// import { parseUserId } from '../auth/utils'

// TODO: Implement businessLogic
const todoAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  // const userId = parseUserId(jwtToken)
  return await todoAccess.getAllTodosForUser(userId)
}

export async function createTodo(
  userId: string,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {

  console.log("inside createTodoBL")
  const todoId = uuid.v4()
  console.log("todoId", todoId)
  // const userId = parseUserId(jwtToken)
  console.log("userId", userId)

  const newItem = {
    todoId,
    userId,
    ...createTodoRequest,
    done: false,
    createdAt: new Date().toISOString(),
  }
  console.log("newItem", newItem)
  await todoAccess.createTodo(newItem)
  console.log("ending of bl", newItem)

  return newItem
}

export async function updateTodo(
  userId: string,
  todoId: string,
  UpdateTodoRequest: UpdateTodoRequest
): Promise<void> {
  // const userId = parseUserId(jwtToken)
  console.log('Inside UpdateToDOBL:')

  const todo = await todoAccess.getTodo(userId, todoId)
  console.log('Inside UpdateToDOBL:')
  if (!todo) createError(404, 'Todo Does not exist or belong to user')
  // if (todo.userId !== userId) createError(404, 'Todo Does not belong to user');

  await todoAccess.updateTodo(
    todoId,
    userId,
    UpdateTodoRequest
  )
}

export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<void> {
  // const userId = parseUserId(jwtToken)
  console.log("inside deleteTodo")
  const todo = await todoAccess.getTodo(userId, todoId)
  console.log("done with getTodo ", todo)
  if (!todo) createError(404, 'Todo Does not exist or belong to user')
  // if (todo.userId !== userId) createError(404, 'Todo Does not belong to user');
  
  await todoAccess.deleteTodo(todoId, userId)
}

  export async function createAttachmentPresignedUrl(
    userId: string,
    todoId: string,
  ): Promise<string> {
    console.log("inside createAttachmentPresignedUrl")
  // const userId = parseUserId(jwtToken)
  const todo = await todoAccess.getTodo(userId,todoId)
  console.log("done with  get", todo)
  if (!todo) createError(404, 'Todo Does not exist');

  // if (todo.userId !== userId) createError(404, 'Todo Does not belong to user');

  const attachmentId = uuid.v4()
  console.log("attachmentID", attachmentId)
  await todoAccess.updateTodoAttachmentUrl(  todoId, userId, attachmentId)
  console.log("done with update")
  const uploadUrl = attachmentUtils.getUploadUrl(attachmentId)
  console.log("done with get url")
    return uploadUrl;
  }
