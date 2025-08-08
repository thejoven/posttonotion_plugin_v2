export interface UserTag {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
}

export interface UserTagData {
  username: string;
  displayName: string;
  avatar: string;
  tags: UserTag[];
  lastUpdated: number;
}

export interface UserTaggerStorage {
  [username: string]: UserTagData;
}