export interface ApiResult<T = unknown> {
  status: "success" | "fail";
  message: string;
  data?: T;
}

export interface User {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PostAuthor {
  name: string;
  photo?: string | null;
}

export interface PostComment {
  id: number;
  comment: string;
  created_at: string;
  updated_at?: string;
  user?: {
    id: number;
    name: string;
    photo?: string | null;
  };
}

export interface Post {
  id: number;
  user_id: number;
  cover?: string | null;
  description: string;
  created_at: string;
  updated_at?: string;
  author?: PostAuthor;
  likes?: number[] | { id: number }[];
  comments?: PostComment[] | number[];
  my_comment?: PostComment | null;
}