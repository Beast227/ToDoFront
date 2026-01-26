export interface user {
    email: string,
    password: string,
    username: string
}

export interface todocat {
    Id: number,
    category: string
}

export type Todo = {
  id: number;
  title: string;
  steps: string[];
  completed: boolean;
  category: string;
  dueDate: string;
};