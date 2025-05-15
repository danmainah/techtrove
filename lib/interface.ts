export interface User {
  id?: string;
  email?: string;
  password_hash?: string;
  name?: string;
  role?: string;
}

export interface Gadget {
  id: string;
  created_at: string;
  title: string;
  category: string;
  specifications: Record<string, string>;
  image_urls: string[];
  status: 'pending' | 'approved';
}