import api from "./api"
import type { User } from "@/lib/types"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface ProfileResponse {
  user: User
}

const apiWithAuthTags = api.enhanceEndpoints({ addTagTypes: ["Auth", "Profile"] })

const authApi = apiWithAuthTags.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth", "Profile"],
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: "auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Auth", "Profile"],
    }),

    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "Profile"],
    }),

    getProfile: builder.query<ProfileResponse, void>({
      query: () => ({
        url: "auth/profile",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),

    updateProfile: builder.mutation<ProfileResponse, Partial<User>>({
      query: (updates) => ({
        url: "auth/profile",
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: ["Profile"],
    }),

    refreshToken: builder.mutation<{ accessToken: string; refreshToken: string }, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: "auth/refresh",
        method: "POST",
        body: { refreshToken },
      }),
    }),

    forgotPassword: builder.mutation<{ success: boolean; message: string }, { email: string }>({
      query: ({ email }) => ({
        url: "auth/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),

    resetPassword: builder.mutation<{ success: boolean; message: string }, { token: string; password: string }>({
      query: ({ token, password }) => ({
        url: "auth/reset-password",
        method: "POST",
        body: { token, password },
      }),
    }),

    verifyEmail: builder.mutation<{ success: boolean; message: string }, { token: string }>({
      query: ({ token }) => ({
        url: "auth/verify-email",
        method: "POST",
        body: { token },
      }),
      invalidatesTags: ["Profile"],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
} = authApi

export default authApi
