/**
 * Single source of truth for every piece of user-supplied copy and media used
 * by <OurStory />. Replace the placeholders below with the real values — you
 * should never need to touch the component's JSX or CSS to fill the story in.
 *
 * Conventions:
 *  - `text: ""` shows the dashed "text to be provided" placeholder. Fill it
 *    with prose to have that prose rendered in its place.
 *  - `src: ""` shows the polaroid / video placeholder. Fill it with a path to
 *    a file in /public (or a remote URL) to display real media.
 *  - `label` / `caption` are only shown while their matching `text` / `src`
 *    is still empty; replace them alongside the real content.
 */

/** A block of prose shown inside the scrapbook's dashed "paper" box. */
export interface StoryTextBlock {
  /** Shown while `text` is empty. */
  label: string;
  /** Number of faded lines drawn in the placeholder. */
  lines: number;
  /** The real prose. An empty string means "still a placeholder". */
  text: string;
}

export type StoryPhotoShape = "wide" | "tall" | "square";

/** A polaroid. */
export interface StoryPhoto {
  /** Accessible name and the name used in the placeholder/lightbox. */
  label: string;
  shape: StoryPhotoShape;
  /** Image path/URL. Empty means "still a placeholder". */
  src: string;
  /** Handwritten caption. Empty means the caption placeholder is shown. */
  caption: string;
}

/** A video card. */
export interface StoryVideo {
  label: string;
  /** Adds the featured (pink) treatment. */
  featured: boolean;
  /** Video path/URL. Empty means "still a placeholder". */
  src: string;
}

export interface StoryLetter {
  /** Heading used on both the card and the full-letter reading view. */
  heading: string;
  /** Teaser shown on the closed letter card. */
  cardPreview: string;
  readLabel: string;
  /** The full letter, shown when the card is opened. */
  fullText: StoryTextBlock;
}

export interface StorySong {
  /** Shown while no song details have been supplied. */
  label: string;
  title: string;
  artist: string;
  lyrics: string;
}

export interface StoryContent {
  intro: {
    title: string;
    line: string;
  };
  memories: {
    beginning: {
      marker: string;
      title: string;
      story: StoryTextBlock;
      marginNote: string;
      instagramDetail: string;
    };
    conversations: {
      marker: string;
      title: string;
      letter: StoryLetter;
      firstVideo: StoryVideo;
      secondVideo: StoryVideo;
    };
    surprise: {
      marker: string;
      title: string;
      reactionVideo: StoryVideo;
      gallery: StoryPhoto[];
      story: StoryTextBlock;
    };
    palace: {
      marker: string;
      title: string;
      bluePainting: StoryPhoto;
      blueSky: StoryTextBlock;
      drunkUncle: StoryTextBlock;
      hidingVideo: StoryVideo;
    };
    temple: {
      marker: string;
      title: string;
      story: StoryTextBlock;
      photo: StoryPhoto;
    };
    train: {
      marker: string;
      title: string;
      story: StoryTextBlock;
    };
  };
  momentToRemember: {
    title: string;
    text: StoryTextBlock;
  };
  personalNote: {
    title: string;
    opening: StoryTextBlock;
    middle: StoryTextBlock;
    ending: StoryTextBlock;
    song: StorySong;
  };
  lightbox: {
    /** Tail of the full-size-photo placeholder, after the photo's label. */
    photoLabel: string;
  };
}

export const story: StoryContent = {
  intro: {
    title: "Our Story",
    line: "A few moments, a few places, and a little bit of everything that brought us here.",
  },
  memories: {
    beginning: {
      marker: "01",
      title: "The Beginning",
      story: { label: "The Beginning story", lines: 4, text: "" },
      marginNote: "[ handwritten note in the margin — to be provided ]",
      instagramDetail: "[ small Instagram-inspired detail — to be provided ]",
    },
    conversations: {
      marker: "02",
      title: "The Conversations",
      letter: {
        heading: "The original letter",
        cardPreview: "[ letter text to be provided ]",
        readLabel: "Read the letter →",
        fullText: {
          label: "Full original letter — preserve exactly as supplied",
          lines: 12,
          text: "",
        },
      },
      firstVideo: { label: "First video response", featured: false, src: "" },
      secondVideo: { label: "Second video response", featured: true, src: "" },
    },
    surprise: {
      marker: "03",
      title: "The Jammu Surprise",
      reactionVideo: {
        label: "Surprise reaction video",
        featured: true,
        src: "",
      },
      gallery: [
        { label: "Jammu photo 1", shape: "square", src: "", caption: "" },
        { label: "Jammu photo 2", shape: "square", src: "", caption: "" },
        { label: "Jammu photo 3", shape: "square", src: "", caption: "" },
      ],
      story: { label: "The Jammu Surprise story", lines: 3, text: "" },
    },
    palace: {
      marker: "04",
      title: "Hari Niwas Palace",
      bluePainting: { label: "Blue painting", shape: "tall", src: "", caption: "" },
      blueSky: { label: "Blue sky and her dad", lines: 4, text: "" },
      drunkUncle: { label: "The drunk uncle story", lines: 3, text: "" },
      hidingVideo: { label: "Hiding video", featured: false, src: "" },
    },
    temple: {
      marker: "05",
      title: "The Temple",
      story: { label: "The Temple story", lines: 4, text: "" },
      photo: { label: "Temple photo", shape: "wide", src: "", caption: "" },
    },
    train: {
      marker: "06",
      title: "The Missed Train",
      story: { label: "The Missed Train story", lines: 5, text: "" },
    },
  },
  momentToRemember: {
    title: "A Moment to Remember",
    text: { label: "A Moment to Remember text", lines: 4, text: "" },
  },
  personalNote: {
    title: "A Personal Note",
    opening: { label: "Personal note — opening", lines: 3, text: "" },
    middle: {
      label: "Personal note — middle (keep full approved wording)",
      lines: 7,
      text: "",
    },
    ending: {
      label: "Personal note — ending leading into the song",
      lines: 3,
      text: "",
    },
    song: {
      label: "[ song details and selected lyrics — to be provided ]",
      title: "",
      artist: "",
      lyrics: "",
    },
  },
  lightbox: {
    photoLabel: "— full-size photo to be provided",
  },
};
