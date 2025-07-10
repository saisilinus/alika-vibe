import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { getSession } from "next-auth/react"

const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  prepareHeaders: async (headers) => {
    const session = await getSession()
    if (session?.accessToken) {
      headers.set("authorization", `Bearer ${session.accessToken}`)
    }
    return headers
  },
})

const api = createApi({
  reducerPath: "api",
  baseQuery,
  endpoints: () => ({}),
})

export default api
