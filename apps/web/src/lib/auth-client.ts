'use client';

import { createAuthClient } from 'better-auth/react';
import { API_URL } from './api';

export const authClient = createAuthClient(API_URL ? { baseURL: API_URL } : {});

export function signIn(email: string, password: string, rememberMe?: boolean) {
  return authClient.signIn.email({ email, password, rememberMe });
}

export function signUp(name: string, email: string, password: string) {
  return authClient.signUp.email({ name, email, password });
}

export async function signOut() {
  await authClient.signOut();
}
