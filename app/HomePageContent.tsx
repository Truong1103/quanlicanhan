"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Sphere, MeshDistortMaterial, Environment } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, Eye, EyeOff } from "lucide-react"
import FinanceManager from "./finance-manager"

function AnimatedSphere() {
  return (
    <Sphere visible args={[1, 100, 200]} scale={2}>
      <MeshDistortMaterial color="#8B5CF6" attach="material" distort={0.3} speed={1.5} roughness={0} />
    </Sphere>
  )
}

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userPassword, setUserPassword] = useState("")

  useEffect(() => {
    const auth = localStorage.getItem("finance_auth")
    const savedPassword = localStorage.getItem("user_password")
    if (auth === "true" && savedPassword) {
      setIsAuthenticated(true)
      setUserPassword(savedPassword)
    }
  }, [])

  const handleLogin = async () => {
    setIsLoading(true)
    setError("")

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (password === "160802") {
      localStorage.setItem("finance_auth", "true")
      localStorage.setItem("user_password", password)
      setUserPassword(password)
      setIsAuthenticated(true)
    } else {
      setError("Mật khẩu không đúng!")
    }
    setIsLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("finance_auth")
    localStorage.removeItem("user_password")
    setIsAuthenticated(false)
    setPassword("")
    setUserPassword("")
    setError("")
  }

  if (isAuthenticated) {
    return <FinanceManager onLogout={handleLogout} userPassword={userPassword} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-30">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <AnimatedSphere />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
          <Environment preset="night" />
        </Canvas>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-center mb-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="inline-block mb-4"
                  >
                    <Lock className="w-16 h-16 text-purple-300" />
                  </motion.div>
                  <h1 className="text-3xl font-bold text-white mb-2">Quản Lý Tài Chính</h1>
                  <p className="text-purple-200">Vui lòng nhập mật khẩu để tiếp tục</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                      className="bg-white/20 border-white/30 text-white placeholder-white/60 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-300 text-sm text-center"
                    >
                      {error}
                    </motion.p>
                  )}

                  <Button
                    onClick={handleLogin}
                    disabled={isLoading || !password}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      "Đăng Nhập"
                    )}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="mt-6 text-center"
                >
                  <p className="text-purple-200 text-sm">Bảo mật cao • Dữ liệu cá nhân</p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Animated background elements */}
      <div className="absolute top-10 left-10">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
          className="w-20 h-20 border-2 border-purple-400/30 rounded-full"
        />
      </div>
      <div className="absolute bottom-10 right-10">
        <motion.div
          animate={{ rotate: -360, scale: [1, 0.8, 1] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          className="w-16 h-16 border-2 border-blue-400/30 rounded-full"
        />
      </div>
    </div>
  )
} 