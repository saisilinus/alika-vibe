import { MongoClient, type Db, type Collection, ObjectId } from "mongodb"
import type { User, Campaign, GeneratedBanner, Comment } from "./types"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Database helper functions
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db("alika")
}

export async function getUsersCollection(): Promise<Collection<User>> {
  const db = await getDatabase()
  return db.collection<User>("users")
}

export async function getCampaignsCollection(): Promise<Collection<Campaign>> {
  const db = await getDatabase()
  return db.collection<Campaign>("campaigns")
}

export async function getGeneratedBannersCollection(): Promise<Collection<GeneratedBanner>> {
  const db = await getDatabase()
  return db.collection<GeneratedBanner>("generated_banners")
}

export async function getCommentsCollection(): Promise<Collection<Comment>> {
  const db = await getDatabase()
  return db.collection<Comment>("comments")
}

// Utility functions
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id)
}

export function createObjectId(id?: string): ObjectId {
  return id ? new ObjectId(id) : new ObjectId()
}

export default clientPromise
