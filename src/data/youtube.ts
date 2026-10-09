export const youtubeChannel = {
  handle: "@nilsaneducare",
  name: "NilSan Educare",
  url: "https://www.youtube.com/@nilsaneducare",
  playlistsUrl: "https://www.youtube.com/@nilsaneducare/playlists"
};

export type YoutubePlaylist = {
  id: string;
  title: string;
  videoCount: number;
  coverVideoId: string;
  description: string;
  url: string;
};

export type YoutubeVideo = {
  id: string;
  title: string;
  playlistTitle: string;
  playlistId: string;
  url: string;
  thumbnail: string;
};

function thumb(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function playlistUrl(id: string) {
  return `https://www.youtube.com/playlist?list=${id}`;
}

function videoUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export const youtubePlaylists: YoutubePlaylist[] = [
  {
    id: "PLbFZ-8LMUY7eLIio5nL0GkZ0YdtYsta12",
    title: "12th HSC English",
    videoCount: 49,
    coverVideoId: "OnG4aCupjsI",
    description: "Board paper practice and full 12th HSC English lessons."
  },
  {
    id: "PLbFZ-8LMUY7c0wuF2VfUR1UZiGXKL_7Qz",
    title: "English Grammar videos",
    videoCount: 31,
    coverVideoId: "GWCBwm0GWXk",
    description: "Tenses, grammar basics, and clear explanations for school students."
  },
  {
    id: "PLbFZ-8LMUY7cT4UVClcAC9ML5Ff8MkHQa",
    title: "Novel Section",
    videoCount: 18,
    coverVideoId: "90ZtcvGXxsY",
    description: "Chapter-wise novel explanations, including Around the World in Eighty Days."
  },
  {
    id: "PLbFZ-8LMUY7cyTZiMdn303XRfbPd0qRPh",
    title: "Writing skill",
    videoCount: 7,
    coverVideoId: "82-uU1ymRA8",
    description: "Writing practice and foundational English skills for exams."
  },
  {
    id: "PLbFZ-8LMUY7fcx-DD5mUHfKpo5GYgnAnm",
    title: "Sample papers & Paper pattern",
    videoCount: 10,
    coverVideoId: "ea4Sl08uFL8",
    description: "Sample papers, paper patterns, and exam-oriented practice sets."
  }
].map((item) => ({
  ...item,
  url: playlistUrl(item.id)
}));

export const featuredYoutubeVideos: YoutubeVideo[] = [
  {
    id: "OnG4aCupjsI",
    title: "12th Board Paper Practice 2022 | Nilesh Wankhade Sir",
    playlistTitle: "12th HSC English",
    playlistId: "PLbFZ-8LMUY7eLIio5nL0GkZ0YdtYsta12"
  },
  {
    id: "DsBnX9Jgct8",
    title: "12th English Paper Practice part 2",
    playlistTitle: "12th HSC English",
    playlistId: "PLbFZ-8LMUY7eLIio5nL0GkZ0YdtYsta12"
  },
  {
    id: "GWCBwm0GWXk",
    title: "10th & 12th Grammar",
    playlistTitle: "English Grammar videos",
    playlistId: "PLbFZ-8LMUY7c0wuF2VfUR1UZiGXKL_7Qz"
  },
  {
    id: "S4u6EYEXWyc",
    title: "Present Perfect Continuous Tense | Tense part 4",
    playlistTitle: "English Grammar videos",
    playlistId: "PLbFZ-8LMUY7c0wuF2VfUR1UZiGXKL_7Qz"
  },
  {
    id: "jTP0-s2pXEs",
    title: "Present Perfect Tense | Tense Part-3",
    playlistTitle: "English Grammar videos",
    playlistId: "PLbFZ-8LMUY7c0wuF2VfUR1UZiGXKL_7Qz"
  },
  {
    id: "90ZtcvGXxsY",
    title: "Around the World in Eighty Days part 5",
    playlistTitle: "Novel Section",
    playlistId: "PLbFZ-8LMUY7cT4UVClcAC9ML5Ff8MkHQa"
  },
  {
    id: "nGx0Z1_SC_c",
    title: "Around the World in Eighty Days part 4",
    playlistTitle: "Novel Section",
    playlistId: "PLbFZ-8LMUY7cT4UVClcAC9ML5Ff8MkHQa"
  },
  {
    id: "82-uU1ymRA8",
    title: "Basic English Grammar Course",
    playlistTitle: "Writing skill",
    playlistId: "PLbFZ-8LMUY7cyTZiMdn303XRfbPd0qRPh"
  },
  {
    id: "ea4Sl08uFL8",
    title: "12th Sample paper part 3",
    playlistTitle: "Sample papers & Paper pattern",
    playlistId: "PLbFZ-8LMUY7fcx-DD5mUHfKpo5GYgnAnm"
  },
  {
    id: "SH8kbCgWAso",
    title: "12th English Paper Practice | Nilesh Wankhade",
    playlistTitle: "12th HSC English",
    playlistId: "PLbFZ-8LMUY7eLIio5nL0GkZ0YdtYsta12"
  }
].map((item) => ({
  ...item,
  url: videoUrl(item.id),
  thumbnail: thumb(item.id)
}));

export function playlistCover(playlist: YoutubePlaylist) {
  return thumb(playlist.coverVideoId);
}
