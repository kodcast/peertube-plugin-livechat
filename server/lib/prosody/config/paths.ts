interface ProsodyFilePaths {
  dir: string
  pid: string
  error: string
  log: string
  config: string
  data: string
  modules: string
  avatars: string
  exec: string
  execArgs: string[]
  execCtl: string
  execCtlArgs: string[]
  appImageToExtract?: string
}

export {
  ProsodyFilePaths
}
