export type Availability = "Available" | "Unavailable" | "Ordered" | string;

export interface Book {
  id: string;
  title: string;
  romanizedTitle: string;
  author: string;
  translator: string;
  category: string;
  subcategory: string;
  subject: string;
  medium: string;
  language: string;
  availability: Availability;
  availabilityReason: string;
  borrowedBy: string;
  borrowedDate: string;
  lastUpdated: string;
  printed: boolean;
  driveLink?: string;
  driveId?: string;
  format?: string;
}

export type LibraryView = "home" | "explore" | "overview" | "catalogue" | "rack" | "ebooks" | "collection" | "insights" | "authors";
