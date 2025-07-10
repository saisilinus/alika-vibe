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
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface UpdateProfileRequest {
  name?: string
  email?: string
  image?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface VerifyEmailRequest {
  token: string
}

const apiWithAuthTags = api.enhanceEndpoints({
  addTagTypes: ["Auth", "User"],
})

const authApi = apiWithAuthTags.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: "auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    getProfile: builder.query<User, void>({
      query: () => ({
        url: "auth/profile",
        method: "GET",
      }),
      providesTags: (result) => (result ? [{ type: "User", id: result._id?.toString() }] : ["User"]),
    }),

    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (updates) => ({
        url: "auth/profile",
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: (result) => (result ? [{ type: "User", id: result._id?.toString() }] : ["User"]),
    }),

    refreshToken: builder.mutation<{ accessToken: string }, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: "auth/refresh",
        method: "POST",
        body: { refreshToken },
      }),
    }),

    forgotPassword: builder.mutation<{ success: boolean }, ForgotPasswordRequest>({
      query: (body) => ({
        url: "auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<{ success: boolean }, ResetPasswordRequest>({
      query: (body) => ({
        url: "auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    verifyEmail: builder.mutation<{ success: boolean }, VerifyEmailRequest>({
      query: (body) => ({
        url: "auth/verify-email",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
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
