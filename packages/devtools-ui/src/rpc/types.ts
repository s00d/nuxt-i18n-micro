export interface JsonRpcRequest {
  jsonrpc: '2.0'
  id: string
  method: string
  params?: unknown
}

export interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: string
  result?: unknown
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

export interface JsonRpcEvent {
  jsonrpc: '2.0'
  method: string
  params?: unknown
}
