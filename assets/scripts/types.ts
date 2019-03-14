export interface ContribootUser {
    username: string;
    id: string;
    displayName: string;
    profileImageURL: string;
}

export type ContribootEntryType = 'contributions' | 'interests';

export interface ContribootEntry {
    type: ContribootEntryType;
    title: string;
    description: string;
    user?: ContribootUser;
    '.key'?: string;
}

export type ContribootEntryKey = string;

export interface ContribootVote {
    '.value': string;
    '.key': string;
}

export interface GitHubUserProfile {
    uid: string;
    displayName: string;
    photoURL: string;
}