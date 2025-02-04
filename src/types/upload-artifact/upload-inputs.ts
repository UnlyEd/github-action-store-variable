import { NoFileOptions } from "./constants"

/**
 * Copied from https://github.com/actions/upload-artifact/blob/65c4c4a1ddee5b72f698fdd19549f0f0fb45cf08/src/upload/upload-inputs.ts#L22
 */
export interface UploadInputs {
  /**
   * The name of the artifact that will be uploaded
   */
  artifactName: string

  /**
   * The search path used to describe what to upload as part of the artifact
   */
  searchPath: string

  /**
   * The desired behavior if no files are found with the provided search path
   */
  ifNoFilesFound: NoFileOptions

  /**
   * Duration after which artifact will expire in days
   */
  retentionDays: number

  /**
   * The level of compression for Zlib to be applied to the artifact archive.
   */
  compressionLevel?: number

  /**
   * Whether or not to replace an existing artifact with the same name
   */
  overwrite: boolean

  /**
   * Whether or not to include hidden files in the artifact
   */
  includeHiddenFiles: boolean
}
