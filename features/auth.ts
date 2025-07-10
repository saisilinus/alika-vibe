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

export interface ProfileUpdateRequest {
  name?: string
  email?: string
  bio?: string
  avatar?: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirmRequest {
  token: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

const apiWithAuthTags = api.enhanceEndpoints({ addTagTypes: ["Auth", "User"] })

const authApi = apiWithAuthTags.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: "auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Auth"],
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

    updateProfile: builder.mutation<User, ProfileUpdateRequest>({
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

    forgotPassword: builder.mutation<{ success: boolean; message: string }, PasswordResetRequest>({
      query: (data) => ({
        url: "auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation<{ success: boolean; message: string }, PasswordResetConfirmRequest>({
      query: (data) => ({
        url: "auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),

    changePassword: builder.mutation<{ success: boolean; message: string }, ChangePasswordRequest>({
      query: (data) => ({
        url: "auth/change-password",
        method: "POST",
        body: data,
      }),
    }),

    verifyEmail: builder.mutation<{ success: boolean; message: string }, { token: string }>({
      query: ({ token }) => ({
        url: "auth/verify-email",
        method: "POST",
        body: { token },
      }),
      invalidatesTags: (result, error, { token }) => ["Auth", "User"],
    }),

    resendVerification: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "auth/resend-verification",
        method: "POST",
      }),
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
  useChangePasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
} = authApi

export default authApi
