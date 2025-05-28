export interface RecentChange {
    id: string;
    comment: string;
    timestamp: string;
    author?: { displayname: string };
}

export interface Book {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
    details: BookDetails;
}

export interface BookDetails {
    title?: string;
    description?: string | { value?: string };
    covers?: number[];
    authors?: { author: { key: string } }[];
    links?: { title: string; url: string }[];
    subject_places?: string[];
    subject_people?: string[];
    subject_times?: string[];
    subjects?: string[];
    excerpts?: { excerpt: string; comment?: string }[];
}

export interface WikiData {
    extract: string;
    image?: string;
    pageUrl: string;
}
