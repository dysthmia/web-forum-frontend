import { createContext } from 'react'
import type { LoginRequest, RegisterRequest } from '../api/authApi.ts'
import type { AuthStatus, OwnUserProfile } from './types.ts'

export interface AuthContextValue { status: AuthStatus; user: OwnUserProfile | null; login: (input: LoginRequest) => Promise<void>; register: (input: RegisterRequest) => Promise<void>; logout: () => Promise<void> }
export const AuthContext = createContext<AuthContextValue | null>(null)
