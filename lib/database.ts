import { MongoClient, type Db, type Collection, ObjectId } from "mongodb"
import type { User, Campaign, GeneratedBanner, Comment, Account, Session, VerificationToken } from "./types"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db("alika-platform")
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

export async function getAccountsCollection(): Promise<Collection<Account>> {
  const db = await getDatabase()
  return db.collection<Account>("accounts")
}

export async function getSessionsCollection(): Promise<Collection<Session>> {
  const db = await getDatabase()
  return db.collection<Session>("sessions")
}

export async function getVerificationTokensCollection(): Promise<Collection<VerificationToken>> {
  const db = await getDatabase()
  return db.collection<VerificationToken>("verification_tokens")
}

export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id)
}

export function toObjectId(id: string): ObjectId {
  return new ObjectId(id)
}

export default clientPromise
