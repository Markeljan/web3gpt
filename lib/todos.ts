interface Todo {
  [key: string]: string;
}
type TodosType = Todo[];

let todos: TodosType = [];

export const getTodos = (): TodosType => {
  return todos;
};

export const createTodo = (todo: Todo) => {
  todos = [...todos, todo];
};

export const deleteTodo = (todo: Todo): void => {
  const index = todos.findIndex((item) => item.todo === todo.todo);
  if (index !== -1) {
    todos.splice(index, 1);
  }
};
