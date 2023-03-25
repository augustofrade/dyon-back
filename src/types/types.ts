import { IPeriodo } from "./interface"

export type Documento<T> = T & { _id: string, createdAt?: string }

export type IPeriodoSaida = Omit<IPeriodo, "evento">