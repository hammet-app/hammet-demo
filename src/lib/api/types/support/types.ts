// ============================================================
// SUPPORT ROUTES
// ============================================================

// POST /callback
export type CallbackForm = {
  schoolName: string;
  fullName: string;
  email: string;
  role: string;
  phone: string;
  city: string;
}

export type Pagination = {
  page: number
  pageSize: number;
  total: number;
  totalPages: number
}