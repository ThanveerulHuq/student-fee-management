"use client"

import { motion } from "framer-motion"
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity,
  Sparkles,
  Rocket,
  Coffee,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AnalyticsComingSoonPage() {
  const features = [
    {
      icon: BarChart3,
      title: "Interactive Dashboards",
      description: "Beautiful charts and graphs to visualize your school's data",
      color: "text-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Revenue Analytics",
      description: "Track fee collection trends and financial insights",
      color: "text-green-500"
    },
    {
      icon: PieChart,
      title: "Student Demographics", 
      description: "Breakdown of students by class, section, and more",
      color: "text-purple-500"
    },
    {
      icon: Activity,
      title: "Performance Metrics",
      description: "Monitor key school performance indicators",
      color: "text-red-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-60 h-60 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [-100, 100, -100],
            y: [50, -50, 50],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 max-w-6xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <BarChart3 className="w-20 h-20 text-indigo-600 mx-auto" />
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4"
          >
            Analytics Dashboard
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 px-4 py-2 text-lg font-medium">
              <Rocket className="w-4 h-4 mr-2" />
              Coming Soon
            </Badge>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            We're cooking up something amazing! 🎉 Get ready for powerful analytics and insights that will transform how you understand your school's data.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                      className="mb-4"
                    >
                      <Icon className={`w-12 h-12 ${feature.color} mx-auto`} />
                    </motion.div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Fun Message Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 rounded-2xl shadow-2xl max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-8">
              <motion.div
                animate={{ bounce: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center justify-center gap-3 mb-4"
              >
                <Coffee className="w-8 h-8 text-amber-500" />
                <Zap className="w-8 h-8 text-yellow-500" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Our developers are caffeinated and coding! ☕
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                We're putting the finishing touches on charts, graphs, and insights that'll make your data dance! 
                Expected launch: <span className="font-semibold text-indigo-600">Next Month</span> 🚀
              </p>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                  onClick={() => {
                    // Could add email subscription or notification signup
                    alert("We'll notify you when it's ready! 🎉")
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Notify Me When Ready!
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.6 }}
                className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500"
              >
                <span>In the meantime, check out our</span>
                <Button variant="link" className="p-0 h-auto text-indigo-600 font-medium">
                  Reports Section
                </Button>
                <span>for current insights! 📊</span>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}