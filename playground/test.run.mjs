import { exec } from 'node:child_process'

function getProcessUsageMock() {
  // Returns random values for CPU and memory
  return {
    cpu: Math.random() * 100,
    memory: Math.random() * 2048, // в MB
  }
}

;(async () => {
  console.log('Starting build performance test...')

  const startTime = Date.now()
  let maxCpuUsage = 0
  let minCpuUsage = Infinity
  let totalCpuUsage = 0
  let maxMemoryUsed = 0
  let minMemoryUsed = Infinity
  let totalMemoryUsage = 0
  let cpuUsageSamples = 0

  const childProcess = exec('NODE_OPTIONS="--max-old-space-size=16000" nuxi build')

  childProcess.stdout?.on('data', (data) => {
    console.log(`[stdout]: ${data}`)
  })

  childProcess.stderr?.on('data', (data) => {
    console.error(`[stderr]: ${data}`)
  })

  const monitorInterval = setInterval(() => {
    const { cpu, memory } = getProcessUsageMock() // Using mock function for demonstration

    maxCpuUsage = Math.max(maxCpuUsage, cpu)
    minCpuUsage = Math.min(minCpuUsage, cpu)
    totalCpuUsage += cpu
    maxMemoryUsed = Math.max(maxMemoryUsed, memory)
    minMemoryUsed = Math.min(minMemoryUsed, memory)
    totalMemoryUsage += memory
    cpuUsageSamples++

    console.log(`Current CPU: ${cpu.toFixed(2)}%, Current Memory: ${memory.toFixed(2)} MB`)
  }, 1000)

  childProcess.on('exit', () => {
    const endTime = Date.now()
    const buildTime = (endTime - startTime) / 1000

    clearInterval(monitorInterval)

    const avgCpuUsage = totalCpuUsage / cpuUsageSamples
    const avgMemoryUsed = totalMemoryUsage / cpuUsageSamples

    console.log(`\nBuild Performance Report:`)
    console.log(`- Build Time: ${buildTime.toFixed(2)} seconds`)
    console.log(`- Max CPU Usage: ${maxCpuUsage.toFixed(2)}%`)
    console.log(`- Min CPU Usage: ${minCpuUsage.toFixed(2)}%`)
    console.log(`- Average CPU Usage: ${avgCpuUsage.toFixed(2)}%`)
    console.log(`- Max Memory Usage: ${maxMemoryUsed.toFixed(2)} MB`)
    console.log(`- Min Memory Usage: ${minMemoryUsed.toFixed(2)} MB`)
    console.log(`- Average Memory Usage: ${avgMemoryUsed.toFixed(2)} MB`)
  })

  childProcess.on('error', (error) => {
    clearInterval(monitorInterval)
    console.error('Build failed with error:', error)
  })
})()
