export type Availability = "Available" | "Unavailable" | "Ordered" | string;

export interface Book {
  id: string;
  title: string;
  author: string;
  translator: string;
  category: string;
  subcategory: string;
  subject: string;
  medium: string;
  language: string;
  availability: Availability;
  availabilityReason: string;
  lastUpdated: string;
  printed: boolean;
}

export type LibraryView = "overview" | "catalogue" | "insights" | "authors";
