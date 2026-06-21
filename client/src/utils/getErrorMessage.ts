import type { ServerError } from "../types/errors"

export function getErrorMessage(error?: ServerError): string | undefined {
  if (!error) {
    return undefined
  }

  return typeof error.message === "string" ? error.message : error.message[0]
}
