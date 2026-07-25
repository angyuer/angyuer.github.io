const requiredMajor = 22
const [major] = process.versions.node.split('.').map(Number)

if (major !== requiredMajor) {
  console.error(`Node.js 版本不兼容：当前 ${process.version}，项目要求 Node.js ${requiredMajor}.x。`)
  console.error('请先执行 nvm use，再重新运行命令。')
  process.exit(1)
}

console.log(`环境检查通过：Node.js ${process.version}。`)
