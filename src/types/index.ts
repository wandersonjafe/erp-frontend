export interface Usuario {
    id: string
    nome: string 
    email: string
    perfil: 'ADMIN' | 'OPERADOR' | 'VISUALIZADOR'
}

export interface LoginRequest {
    email: string 
    senha: string
}

export interface LoginResponse {
    token: string
    nome: string
    email: string
}

export interface Cliente {
    id: string
    nome: string
    email: string
    cpf: string 
    logradouro: string
    numero: string
    cep: string 
    cidade: string
    estado: string
}

export interface Produto {
    id: string 
    nome: string
    descricao: string
    preco: number
    estoque: number
    categoria: 'ELETRONICO' | 'ALIMENTO' | 'VESTUARIO' | 'MOVEL' | 'OUTROS'
}

export interface Venda  {
    id: string 
    clienteId: string
    status: 'ABERTA' | 'FECHADA' | 'CANCELADA'
    total: number 
}

export interface AdicionarItemRequest {
    produtoId: string
    quantidade: number
}