export interface LegalLink {
  readonly title: string
  readonly url: string
}

export interface LegalSection {
  readonly title: string
  readonly paragraphs: readonly string[]
  readonly items?: readonly string[]
  readonly links?: readonly LegalLink[]
}

export interface LegalDocument {
  readonly title: string
  readonly shortTitle: string
  readonly icon: string
  readonly version: string
  readonly updatedDate: string
  readonly effectiveDate: string
  readonly statusLabel: string
  readonly notice: string
  readonly sections: readonly LegalSection[]
}
