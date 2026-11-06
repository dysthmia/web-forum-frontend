import { createContext } from 'react'
import type { LoginRequest, RegisterRequest, UpdateProfileRequest } from '../api/authApi.ts'
import type { AuthStatus, OwnUserProfile } from './types.ts'

export interface AuthContextValue { status: AuthStatus; user: OwnUserProfile | null; login: (input: LoginRequest) => Promise<void>; register: (input: RegisterRequest) => Promise<void>; updateProfile?: (input: UpdateProfileRequest) => Promise<OwnUserProfile>; logout: () => Promise<void> }
export const AuthContext = createContext<AuthContextValue | null>(null)
