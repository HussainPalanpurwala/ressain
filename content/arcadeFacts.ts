/**
 * Typed structured data for The Revleen Arcade.
 *
 * The fact wording is hand-curated and verbatim — do not rewrite or "correct"
 * any of it. Each fact gets a stable, unique id for React keys and a simple
 * emoji icon. Categories are ordered exactly as they should appear.
 */

export type ArcadeCategoryId =
  | "food"
  | "flowers"
  | "movies"
  | "world"
  | "random"
  | "future";

export interface ArcadeFact {
  id: string;
  text: string;
  icon: string;
}

export interface ArcadeCategory {
  id: ArcadeCategoryId;
  title: string;
  subtitle: string;
  icon: string;
  facts: ArcadeFact[];
}

export const arcadeCategories: ArcadeCategory[] = [
  {
    id: "food",
    title: "FOOD FIGHTER",
    subtitle: "Collect her favourites",
    icon: "🍜",
    facts: [
      { id: "food-1", text: "Hates chocolate.", icon: "🍫" },
      { id: "food-2", text: "Loves Wazwan for family dinners.", icon: "🍲" },
      { id: "food-3", text: "Favourite sweet: Panjiri.", icon: "🍬" },
      { id: "food-4", text: "Favourite fruits: Lychee and pineapple.", icon: "🍍" },
      { id: "food-5", text: "Favourite drink: Piña colada.", icon: "🍹" },
      { id: "food-6", text: "Favourite ice cream: Blackcurrant.", icon: "🍨" },
      { id: "food-7", text: "Favourite dry fruit: Cashew.", icon: "🥜" },
      { id: "food-8", text: "Cheese popcorn and imli candy.", icon: "🍿" },
      { id: "food-9", text: "Spicy steamed river fish made by her mom.", icon: "🐟" },
      { id: "food-10", text: "Afghani chicken.", icon: "🍗" },
      { id: "food-11", text: "Okra fries.", icon: "🍟" },
      { id: "food-12", text: "Spicy Budlak noodles/ramen.", icon: "🍝" },
    ],
  },
  {
    id: "flowers",
    title: "FLOWER POWER",
    subtitle: "A little garden of favourites",
    icon: "🌸",
    facts: [
      { id: "flowers-1", text: "Roses.", icon: "🌹" },
      { id: "flowers-2", text: "Jasmine fragrance.", icon: "🌼" },
      {
        id: "flowers-3",
        text: "Inky, petrol-like, green, mossy and vetiver perfume preferences.",
        icon: "🌿",
      },
    ],
  },
  {
    id: "movies",
    title: "MOVIE MODE",
    subtitle: "Now showing",
    icon: "🎬",
    facts: [
      { id: "movies-1", text: "Better Days", icon: "🎞️" },
      { id: "movies-2", text: "Slumdog Millionaire", icon: "🎬" },
      { id: "movies-3", text: "Past Lives", icon: "💞" },
      { id: "movies-4", text: "M.A.I", icon: "🎥" },
      { id: "movies-5", text: "Black Swan", icon: "🦢" },
    ],
  },
  {
    id: "world",
    title: "WORLD EXPLORER",
    subtitle: "Places and little rituals",
    icon: "🌍",
    facts: [
      { id: "world-1", text: "Egypt.", icon: "🇪🇬" },
      { id: "world-2", text: "Iceland.", icon: "🇮🇸" },
      { id: "world-3", text: "MKT, Delhi.", icon: "🏙️" },
      { id: "world-4", text: "Loves local cuisine while travelling.", icon: "🧳" },
      { id: "world-5", text: "Likes buying souvenirs.", icon: "🛍️" },
    ],
  },
  {
    id: "random",
    title: "RANDOM REVLEEN FACTS",
    subtitle: "One of a kind",
    icon: "✨",
    facts: [
      { id: "random-1", text: "Likes South Indian houses.", icon: "🏡" },
    ],
  },
  {
    id: "future",
    title: "FUTURE QUEST",
    subtitle: "A tiny look ahead",
    icon: "🔮",
    facts: [
      { id: "future-1", text: "Wants to have three children.", icon: "👶" },
    ],
  },
];

export const arcadeTitle = "THE REVLEEN ARCADE";
export const arcadeSubtitle =
  "A collection of very important facts about a very particular person.";
