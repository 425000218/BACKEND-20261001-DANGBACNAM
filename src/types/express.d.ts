export interface IUserAuth {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserAuth;
    }
  }
}
