/**
 * Coerce a FormData payload into a plain object suitable for Zod parsing.
 *
 * - `"true"` / `"false"` string values become booleans.
 * - Empty strings become `undefined` (or `null` if `emptyAs: "null"`).
 * - The literal string `"null"` becomes `null` when `treatStringNullAsNull` is set.
 * - Keys listed in `fileKeys` and `arrayKeys` are skipped — callers handle those separately
 *   (e.g. via `formData.get("file")` or `parseStringArray(formData, "tagIds")`).
 */
export function coerceFormData(
  formData: FormData,
  options: {
    fileKeys?: readonly string[]
    arrayKeys?: readonly string[]
    emptyAs?: "undefined" | "null"
    treatStringNullAsNull?: boolean
  } = {},
): Record<string, unknown> {
  const fileKeys = new Set(options.fileKeys ?? [])
  const arrayKeys = new Set(options.arrayKeys ?? [])
  const emptyAs = options.emptyAs ?? "undefined"
  const treatStringNullAsNull = options.treatStringNullAsNull ?? false

  const raw: Record<string, unknown> = {}
  formData.forEach((value, key) => {
    if (fileKeys.has(key) || arrayKeys.has(key)) return
    if (value === "true") raw[key] = true
    else if (value === "false") raw[key] = false
    else if (value === "") raw[key] = emptyAs === "null" ? null : undefined
    else if (treatStringNullAsNull && value === "null") raw[key] = null
    else raw[key] = value
  })
  return raw
}
