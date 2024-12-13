export type ContentPagesData = Record<string, ContentPagesValue>;

export interface ContentPagesSection {
  _title?: string;
}

export type ContentPagesValue = unknown[] | unknown | ContentPagesSection;
