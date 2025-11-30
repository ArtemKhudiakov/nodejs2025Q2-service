export interface Favorites {
  artists: string[]; // favorite artists ids
  albums: string[]; // favorite albums ids
  tracks: string[]; // favorite tracks ids
}

export interface FavoritesResponse {
  artists: any[]; // Artist[]
  albums: any[]; // Album[]
  tracks: any[]; // Track[]
}

