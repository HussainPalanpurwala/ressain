/**
 * Typed structured data for The Revleen Arcade quiz.
 *
 * The question wording is hand-curated and verbatim — do not rewrite or
 * "correct" any of it. Options are listed in the supplied A/B/C/D order and
 * `correctIndex` is the zero-based index of the correct answer.
 */

export type QuizCategoryId =
  | "food"
  | "flowers"
  | "movies"
  | "world"
  | "random"
  | "future";

export interface QuizQuestion {
  id: number; // 1..24
  category: QuizCategoryId;
  question: string;
  options: [string, string, string, string]; // A,B,C,D in the order supplied
  correctIndex: number; // 0-based index matching the supplied correct answer letter
}

export interface QuizCategoryInfo {
  id: QuizCategoryId;
  title: string;
}

export const quizCategories: QuizCategoryInfo[] = [
  { id: "food", title: "FOOD FIGHTER" },
  { id: "flowers", title: "FLOWER POWER" },
  { id: "movies", title: "MOVIE MODE" },
  { id: "world", title: "WORLD EXPLORER" },
  { id: "random", title: "RANDOM REVLEEN FACTS" },
  { id: "future", title: "FUTURE QUEST" },
];

export const quizQuestions: QuizQuestion[] = [
  // CATEGORY 01 — FOOD FIGHTER
  {
    id: 1,
    category: "food",
    question: "What is Revleen's relationship with chocolate?",
    options: [
      "Absolutely loves it",
      "Only likes dark chocolate",
      "Doesn't like chocolate at all",
      "Likes it occasionally",
    ],
    correctIndex: 2, // C
  },
  {
    id: 2,
    category: "food",
    question: "What would Revleen prefer for a family dinner?",
    options: ["Butter chicken", "Wazwan", "Biryani", "Tandoori platter"],
    correctIndex: 1, // B
  },
  {
    id: 3,
    category: "food",
    question: "What's her favourite sweet dish?",
    options: ["Gulab jamun", "Kheer", "Panjiri", "Rasmalai"],
    correctIndex: 2, // C
  },
  {
    id: 4,
    category: "food",
    question: "Which two fruits are her favourites?",
    options: [
      "Mango and strawberry",
      "Lychee and pineapple",
      "Watermelon and grapes",
      "Peach and kiwi",
    ],
    correctIndex: 1, // B
  },
  {
    id: 5,
    category: "food",
    question: "What's her favourite drink?",
    options: ["Mojito", "Piña colada", "Iced coffee", "Lemonade"],
    correctIndex: 1, // B
  },
  {
    id: 6,
    category: "food",
    question: "Which ice cream flavour does she love?",
    options: ["Chocolate", "Vanilla", "Blackcurrant", "Strawberry"],
    correctIndex: 2, // C
  },
  {
    id: 7,
    category: "food",
    question: "Which of these foods would Revleen enjoy?",
    options: [
      "Very spicy steamed river fish made by her mom",
      "Mild grilled fish",
      "Plain steamed vegetables",
      "Sweet-and-sour fish",
    ],
    correctIndex: 0, // A
  },
  {
    id: 8,
    category: "food",
    question: "Which of these is her favorite?",
    options: [
      "Afghani chicken",
      "Sweet chilli chicken",
      "Lemon herb chicken",
      "Plain roasted chicken",
    ],
    correctIndex: 0, // A
  },
  {
    id: 9,
    category: "food",
    question: "Which snack combination sounds most like Revleen?",
    options: [
      "Cheese popcorn and imli candy",
      "Chocolate popcorn and gummy bears",
      "Salted chips and marshmallows",
      "Caramel popcorn and jelly beans",
    ],
    correctIndex: 0, // A
  },
  {
    id: 10,
    category: "food",
    question: "What else does she enjoy?",
    options: [
      "Okra fries and spicy Budlak noodles/ramen",
      "Plain noodles and mashed potatoes",
      "Sweet corn and mild pasta",
      "Potato wedges and macaroni",
    ],
    correctIndex: 0, // A
  },

  // CATEGORY 02 — FLOWER POWER
  {
    id: 11,
    category: "flowers",
    question: "Which flowers does Revleen like?",
    options: ["Tulips", "Sunflowers", "Roses", "Orchids"],
    correctIndex: 2, // C
  },
  {
    id: 12,
    category: "flowers",
    question: "Which of these scents does she love ?",
    options: [
      "Sweet vanilla and caramel",
      "Inky, petrol-like, green mossy vetiver",
      "Fresh citrus and coconut",
      "Powdery florals and rose",
    ],
    correctIndex: 1, // B
  },
  {
    id: 13,
    category: "flowers",
    question: "Which natural fragrance does she love?",
    options: ["Lavender", "Jasmine", "Sandalwood", "Lily"],
    correctIndex: 1, // B
  },

  // CATEGORY 03 — MOVIE MODE
  {
    id: 14,
    category: "movies",
    question: "Which of these is one of Revleen's favourite films?",
    options: ["Past Lives", "La La Land", "The Notebook", "Before Sunrise"],
    correctIndex: 0, // A
  },
  {
    id: 15,
    category: "movies",
    question: "Which psychological film is also among her favourites?",
    options: ["Shutter Island", "Black Swan", "Gone Girl", "Joker"],
    correctIndex: 1, // B
  },
  {
    id: 16,
    category: "movies",
    question: "Which of these films is also on her favourites list?",
    options: ["Better Days", "Parasite", "Oldboy", "In the Mood for Love"],
    correctIndex: 0, // A
  },
  {
    id: 17,
    category: "movies",
    question:
      "Which film featuring the story of a young man from Mumbai is one of her favourites?",
    options: ["Dangal", "Slumdog Millionaire", "The Lunchbox", "Swades"],
    correctIndex: 1, // B
  },
  {
    id: 18,
    category: "movies",
    question: "Which Vietnamese film is among her favourites?",
    options: [
      "M.A.I",
      "The Scent of Green Papaya",
      "Three Seasons",
      "Cyclo",
    ],
    correctIndex: 0, // A
  },

  // CATEGORY 04 — WORLD EXPLORER
  {
    id: 19,
    category: "world",
    question: "Her first international trip plans?",
    options: [
      "Japan and South Korea",
      "Egypt and Iceland",
      "Italy and France",
      "Switzerland and Austria",
    ],
    correctIndex: 1, // B
  },
  {
    id: 20,
    category: "world",
    question: "Which Delhi place is one of her favourites?",
    options: ["Connaught Place", "Hauz Khas", "MKT", "Khan Market"],
    correctIndex: 2, // C
  },
  {
    id: 21,
    category: "world",
    question: "What does Revleen particularly enjoy while travelling?",
    options: [
      "Staying inside the hotel",
      "Only visiting famous tourist attractions",
      "Trying local cuisine and shopping for souvenirs",
      "Shopping exclusively at luxury stores",
    ],
    correctIndex: 2, // C
  },

  // CATEGORY 05 — RANDOM REVLEEN FACTS
  {
    id: 22,
    category: "random",
    question: "What kind of houses does Revleen like?",
    options: [
      "Modern glass houses",
      "South Indian houses",
      "Industrial-style lofts",
      "Minimalist concrete houses",
    ],
    correctIndex: 1, // B
  },
  {
    id: 23,
    category: "random",
    question: "Which nut does she like?",
    options: ["Almonds", "Walnuts", "Cashews", "Pistachios"],
    correctIndex: 2, // C
  },

  // CATEGORY 06 — FUTURE QUEST
  {
    id: 24,
    category: "future",
    question: "How many children does Revleen want to have?",
    options: ["One", "Two", "Three", "Four"],
    correctIndex: 2, // C
  },
];

export const categoryMessages = {
  perfect: "You know her a little too well.",
  most: "Not bad. There's still more to learn.",
  few: "We might need to revise the Revleen encyclopaedia.",
  none: "Did you even read the manual?",
};

export const scoreTitles = [
  {
    min: 0,
    max: 5,
    title: "The Newcomer",
    message: "A perfect place to begin — every expert started somewhere.",
  },
  {
    min: 6,
    max: 10,
    title: "Getting to Know Her",
    message: "You're picking up the little details. Keep going.",
  },
  {
    min: 11,
    max: 15,
    title: "Revleen Enthusiast",
    message:
      "You know more than the average person — but there's still magic left to discover.",
  },
  {
    min: 16,
    max: 20,
    title: "Revleen Expert",
    message: "Impressive. You've clearly been paying attention to the important things.",
  },
  {
    min: 21,
    max: 23,
    title: "Certified Revleen Encyclopaedia",
    message: "Almost flawless. You could probably write the next chapter yourself.",
  },
  {
    min: 24,
    max: 24,
    title: "The Ultimate Revleen Specialist",
    message:
      "Perfect. There is no one else quite like her — and now no one else quite like you.",
  },
];
