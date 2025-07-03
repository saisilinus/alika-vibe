"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Database, Server, CheckCircle, AlertCircle } from "lucide-react"

export default function TerminalPage() {
  const [output, setOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState<string | null>(null)

  const addOutput = (message: string, type: "info" | "success" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    const prefix = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"
    setOutput((prev) => [...prev, `[${timestamp}] ${prefix} ${message}`])
  }

  const runCommand = async (command: string, description: string) => {
    setCurrentStep(description)
    addOutput(`Starting: ${description}`)

    try {
      // Simulate API call to backend to run command
      const response = await fetch("/api/terminal/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, description }),
      })

      if (response.ok) {
        const result = await response.text()
        addOutput(result, "success")
        return true
      } else {
        const error = await response.text()
        addOutput(`Failed: ${error}`, "error")
        return false
      }
    } catch (error) {
      addOutput(`Error: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
      return false
    }
  }

  const setupBackend = async () => {
    setIsRunning(true)
    setOutput([])
    addOutput("🚀 Starting Alika Backend Setup...")

    try {
      // Step 1: Check database
      await runCommand("check-db", "Checking database connection")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Step 2: Initialize database
      await runCommand("init-db", "Initializing database with sample data")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Step 3: Start server
      addOutput("🎉 Setup complete! Backend is ready to start.", "success")
      addOutput("You can now run the frontend and backend together.", "info")
    } catch (error) {
      addOutput(`Setup failed: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
    } finally {
      setIsRunning(false)
      setCurrentStep(null)
    }
  }

  const quickCommands = [
    {
      name: "Check Database",
      description: "Test Supabase connection",
      command: "check-db",
      icon: <Database className="h-4 w-4" />,
    },
    {
      name: "Initialize Database",
      description: "Create tables and sample data",
      command: "init-db",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      name: "Start Server",
      description: "Run the backend API server",
      command: "start-server",
      icon: <Server className="h-4 w-4" />,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Alika Backend Terminal</h1>
          <p className="text-gray-600">Set up and manage your Alika backend server</p>
        </div>

        {/* Quick Setup */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Quick Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={setupBackend} disabled={isRunning} className="flex-1" size="lg">
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Setting up...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Full Setup
                  </>
                )}
              </Button>
              {currentStep && (
                <Badge variant="secondary" className="self-center">
                  {currentStep}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              This will check database connection, create tables, and prepare the backend
            </p>
          </CardContent>
        </Card>

        {/* Individual Commands */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Individual Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickCommands.map((cmd) => (
                <Button
                  key={cmd.command}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start"
                  onClick={() => runCommand(cmd.command, cmd.description)}
                  disabled={isRunning}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {cmd.icon}
                    <span className="font-medium">{cmd.name}</span>
                  </div>
                  <span className="text-sm text-gray-500 text-left">{cmd.description}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Terminal Output */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Terminal Output
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
              {output.length === 0 ? (
                <div className="text-gray-500">No output yet. Run a command to see results.</div>
              ) : (
                output.map((line, index) => (
                  <div key={index} className="mb-1">
                    {line}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manual Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Manual Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">If you have Node.js installed locally:</h4>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  <div>cd server</div>
                  <div>npm install</div>
                  <div>node scripts/check-database.js</div>
                  <div>node scripts/init-database.js</div>
                  <div>npm run dev</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Or run the SQL directly in Supabase:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Go to your Supabase project dashboard</li>
                  <li>Click on "SQL Editor" in the sidebar</li>
                  <li>Copy the SQL from scripts/setup-database-simple.sql</li>
                  <li>Paste and run it in the SQL Editor</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
