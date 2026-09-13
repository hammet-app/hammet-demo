// ============================================================
// SUPPORT ROUTES
// ============================================================

// POST /callback
export type CallbackFormDto = {
  school_name: string;
  full_name: string;
  email: string;
  role: string;
  phone: string;
  city: string;
}

export type PaginationDto = {
  page: number
  page_size: number;
  total: number;
  total_pages: number
}