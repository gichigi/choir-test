"use client"

import { useState, useEffect } from "react"

export const useMutation = (mutationFunction: any) => {
  return async (...args: any[]) => {
    console.log("Mutation called with args:", args)
    return "mock_id_123456"
  }
}

export const useQuery = (queryFunction: any) => {
  const [result, setResult] = useState(null)

  useEffect(() => {
    setResult("Mock query result")
  }, [])

  return result
}

export const useConvexAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  return { isAuthenticated, isLoading }
}
