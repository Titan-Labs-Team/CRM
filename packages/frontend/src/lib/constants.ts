/// <reference types="vite/client" />
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api/v1';
