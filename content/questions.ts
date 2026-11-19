/**
 * A hand-curated deck of 200 questions for the two of us.
 *
 * Every question is written by hand — there is no generation, templating, or
 * placeholder text here. The deck is split evenly across four categories
 * (50 each). IDs run from 1 to 200 with no gaps or duplicates.
 *
 * `perspective` says who the question is really for: "Me" (Hussain), "You"
 * (Revleen), or "Both". `depth` runs from a light warm-up to the rare, genuinely
 * challenging question. Most of the deck is comfortable; the "Very Deep" ones
 * are intentionally few and scattered rather than bunched together.
 *
 * Around 70% of the questions are universal (about life, thoughts and feelings).
 * The other ~30% are quietly personal to us — little threads from our
 * conversations, the Jammu surprise, the missed train, the temple, Hari Niwas
 * Palace, our calls and chats, our habits, and the things we still have yet to
 * discover about each other.
 */

export type QuestionCategory =
  | "Deep & Philosophical"
  | "Personal"
  | "Hypothetical"
  | "Playful & Random";

export type QuestionDepth = "Light" | "Medium" | "Deep" | "Very Deep";

export type QuestionPerspective = "Me" | "You" | "Both";

export interface Question {
  id: number;
  text: string;
  category: QuestionCategory;
  depth: QuestionDepth;
  perspective: QuestionPerspective;
}

export const questions: Question[] = [
  // ---------------------------------------------------------------------------
  // Deep & Philosophical — 1–50
  // ---------------------------------------------------------------------------
  { id: 1, text: "If your whole life had a background score, what genre would it be, and why that one?", category: "Deep & Philosophical", depth: "Light", perspective: "Both" },
  { id: 2, text: "Do you think people really change, or do they just get better at hiding who they used to be?", category: "Deep & Philosophical", depth: "Medium", perspective: "You" },
  { id: 3, text: "What's the smallest thing that can instantly turn a bad day around for you?", category: "Deep & Philosophical", depth: "Light", perspective: "Me" },
  { id: 4, text: "What's a belief you held strongly as a kid that you've completely let go of now?", category: "Deep & Philosophical", depth: "Medium", perspective: "Both" },
  { id: 5, text: "When was the last time you felt completely, unapologetically yourself?", category: "Deep & Philosophical", depth: "Deep", perspective: "You" },
  { id: 6, text: "If you could have dinner with any fictional character, who would it be and what would you two even talk about?", category: "Deep & Philosophical", depth: "Light", perspective: "Both" },
  { id: 7, text: "What's a regret you've never said out loud to anyone?", category: "Deep & Philosophical", depth: "Very Deep", perspective: "Me" },
  { id: 8, text: "Do you think it's possible to truly know another person, or only the version of them we happen to meet?", category: "Deep & Philosophical", depth: "Medium", perspective: "You" },
  { id: 9, text: "What's a smell that instantly takes you back to a particular time in your life?", category: "Deep & Philosophical", depth: "Light", perspective: "Both" },
  { id: 10, text: "What do you think people most often get wrong about happiness?", category: "Deep & Philosophical", depth: "Medium", perspective: "Me" },
  { id: 11, text: "If you could see one single moment from your future, would you want to, or would you rather not know?", category: "Deep & Philosophical", depth: "Deep", perspective: "Both" },
  { id: 12, text: "What's a question you wish someone had asked you when you were younger?", category: "Deep & Philosophical", depth: "Light", perspective: "You" },
  { id: 13, text: "Do you think we find the people we're meant to find, or do we just make meaning after the fact?", category: "Deep & Philosophical", depth: "Medium", perspective: "Both" },
  { id: 14, text: "What's a sound that instantly calms you down?", category: "Deep & Philosophical", depth: "Light", perspective: "Me" },
  { id: 15, text: "What's something you used to be absolutely certain about that you're not so sure of anymore?", category: "Deep & Philosophical", depth: "Deep", perspective: "You" },
  { id: 16, text: "If you had to describe your outlook on life in one sentence, what would it be?", category: "Deep & Philosophical", depth: "Medium", perspective: "Both" },
  { id: 17, text: "What's the one thing you'd keep if you had to empty your room except for one object?", category: "Deep & Philosophical", depth: "Light", perspective: "You" },
  { id: 18, text: "What's a fear you've never told anyone, the kind that shows up at two in the morning?", category: "Deep & Philosophical", depth: "Very Deep", perspective: "Both" },
  { id: 19, text: "When we see things differently, what matters more to you — that we understand each other, or that we just don't stay upset?", category: "Deep & Philosophical", depth: "Medium", perspective: "Both" },
  { id: 20, text: "What's a word that you think doesn't have a perfect translation in your language?", category: "Deep & Philosophical", depth: "Light", perspective: "Both" },
  { id: 21, text: "When you look back at who you were five years ago, what surprises you most?", category: "Deep & Philosophical", depth: "Deep", perspective: "You" },
  { id: 22, text: "What's a small act of kindness someone did for you that you still think about?", category: "Deep & Philosophical", depth: "Medium", perspective: "Me" },
  { id: 23, text: "Sunrise or sunset — and be honest about why?", category: "Deep & Philosophical", depth: "Light", perspective: "Both" },
  { id: 24, text: "Do you think timing matters more than effort in how things turn out?", category: "Deep & Philosophical", depth: "Medium", perspective: "You" },
  { id: 25, text: "What's a part of yourself you're still learning to accept?", category: "Deep & Philosophical", depth: "Deep", perspective: "Both" },
  { id: 26, text: "What's something that always makes you laugh, no matter how many times you've seen it?", category: "Deep & Philosophical", depth: "Light", perspective: "Me" },
  { id: 27, text: "If you could ask the universe one question and get a real answer, what would it be?", category: "Deep & Philosophical", depth: "Medium", perspective: "Both" },
  { id: 28, text: "What's the best piece of advice you've actually followed?", category: "Deep & Philosophical", depth: "Light", perspective: "You" },
  { id: 29, text: "What do you think makes a memory stay with us for years while others just vanish?", category: "Deep & Philosophical", depth: "Deep", perspective: "Me" },
  { id: 30, text: "Do you believe things happen for a reason, or is that just a story we tell ourselves?", category: "Deep & Philosophical", depth: "Medium", perspective: "Both" },
  { id: 31, text: "What's something about yourself you've been pretending is fine but isn't?", category: "Deep & Philosophical", depth: "Very Deep", perspective: "You" },
  { id: 32, text: "What's a place you've never been but feel like you'd love?", category: "Deep & Philosophical", depth: "Light", perspective: "Me" },
  { id: 33, text: "What's the difference, to you, between being lonely and being alone?", category: "Deep & Philosophical", depth: "Medium", perspective: "Both" },
  { id: 34, text: "What's a hobby you'd try if you knew you could be terrible at it and no one would care?", category: "Deep & Philosophical", depth: "Light", perspective: "You" },
  { id: 35, text: "What's one thing you'd change about the world if you could, and what would it cost you?", category: "Deep & Philosophical", depth: "Deep", perspective: "Both" },
  { id: 36, text: "Do you think people are born with a 'type,' or is attraction something we learn?", category: "Deep & Philosophical", depth: "Medium", perspective: "Me" },
  { id: 37, text: "What's a food that tastes like childhood to you?", category: "Deep & Philosophical", depth: "Light", perspective: "Both" },
  { id: 38, text: "If you could relive one ordinary day of ours exactly as it was, which one would it be?", category: "Deep & Philosophical", depth: "Medium", perspective: "You" },
  { id: 39, text: "What's the last thing that genuinely made you change your mind about something?", category: "Deep & Philosophical", depth: "Deep", perspective: "Me" },
  { id: 40, text: "What's a question you could talk about for hours if someone asked?", category: "Deep & Philosophical", depth: "Light", perspective: "Both" },
  { id: 41, text: "Do you think we're shaped more by the things that happen to us or by how we respond to them?", category: "Deep & Philosophical", depth: "Medium", perspective: "You" },
  { id: 42, text: "What's something you're grateful for now that you used to take for granted?", category: "Deep & Philosophical", depth: "Deep", perspective: "Both" },
  { id: 43, text: "What would be the title of the story of your life so far?", category: "Deep & Philosophical", depth: "Light", perspective: "Me" },
  { id: 44, text: "What's a difficult choice you made that you still think about?", category: "Deep & Philosophical", depth: "Very Deep", perspective: "Me" },
  { id: 45, text: "What's a quality in someone that instantly makes you trust them?", category: "Deep & Philosophical", depth: "Medium", perspective: "Both" },
  { id: 46, text: "What's the most random thing you've ever googled?", category: "Deep & Philosophical", depth: "Light", perspective: "You" },
  { id: 47, text: "Do you think we become who we are because of the people we love?", category: "Deep & Philosophical", depth: "Deep", perspective: "Both" },
  { id: 48, text: "What's a moment you wish you could pause and stay in a little longer?", category: "Deep & Philosophical", depth: "Medium", perspective: "Me" },
  { id: 49, text: "What's a belief you'd happily be wrong about?", category: "Deep & Philosophical", depth: "Light", perspective: "Both" },
  { id: 50, text: "If you could leave one idea behind for the world, what would it be?", category: "Deep & Philosophical", depth: "Medium", perspective: "You" },

  // ---------------------------------------------------------------------------
  // Personal — 51–100
  // ---------------------------------------------------------------------------
  { id: 51, text: "What's the first thing you remember noticing about me, back when you thought my account was fake?", category: "Personal", depth: "Light", perspective: "You" },
  { id: 52, text: "Which of our earliest conversations do you remember most clearly?", category: "Personal", depth: "Medium", perspective: "Both" },
  { id: 53, text: "What's a habit of mine you think is quietly adorable?", category: "Personal", depth: "Light", perspective: "Me" },
  { id: 54, text: "When I replied to your story as a joke, did you have any idea it would turn into all this?", category: "Personal", depth: "Medium", perspective: "You" },
  { id: 55, text: "What's something you feel we understand about each other that no one else does?", category: "Personal", depth: "Deep", perspective: "Both" },
  { id: 56, text: "That tiny voice you use with your mom — do you know you do a version of it with me too?", category: "Personal", depth: "Light", perspective: "You" },
  { id: 57, text: "Is there anything you've wanted to tell me but haven't, because you weren't sure how I'd take it?", category: "Personal", depth: "Very Deep", perspective: "Me" },
  { id: 58, text: "What's a moment from the Jammu surprise you think I'll never forget?", category: "Personal", depth: "Medium", perspective: "Both" },
  { id: 59, text: "When I showed up in Jammu, what went through your head in that first second?", category: "Personal", depth: "Light", perspective: "You" },
  { id: 60, text: "What do you think my reaction to the surprise told you about me?", category: "Personal", depth: "Deep", perspective: "Me" },
  { id: 61, text: "Of everything at Hari Niwas Palace, what's the one thing you'd want to remember most?", category: "Personal", depth: "Medium", perspective: "Both" },
  { id: 62, text: "That shade of blue you told me about — does it still remind you of your dad?", category: "Personal", depth: "Light", perspective: "You" },
  { id: 63, text: "What's a small detail from the temple day that's stayed with you?", category: "Personal", depth: "Medium", perspective: "Me" },
  { id: 64, text: "When we were praying together, what was going through your mind?", category: "Personal", depth: "Deep", perspective: "Both" },
  { id: 65, text: "Do you remember every part of that day, or just a few pieces?", category: "Personal", depth: "Light", perspective: "You" },
  { id: 66, text: "Of the missed train in Delhi, what's the one thing you actually want me to remember?", category: "Personal", depth: "Medium", perspective: "Me" },
  { id: 67, text: "When I was stuck there, what made you stay on the call with me the whole time?", category: "Personal", depth: "Deep", perspective: "You" },
  { id: 68, text: "If our time together had a soundtrack, which song would you pick?", category: "Personal", depth: "Light", perspective: "Both" },
  { id: 69, text: "What's an insecurity of yours that you've never let me see?", category: "Personal", depth: "Very Deep", perspective: "You" },
  { id: 70, text: "What's a small thing I do that makes you feel looked after?", category: "Personal", depth: "Medium", perspective: "Me" },
  { id: 71, text: "What's the most random picture you've taken of us?", category: "Personal", depth: "Light", perspective: "Both" },
  { id: 72, text: "Of all the questions I ask, which one do you think reveals the most about how I see you?", category: "Personal", depth: "Medium", perspective: "Me" },
  { id: 73, text: "What's something you still want to discover about me?", category: "Personal", depth: "Deep", perspective: "You" },
  { id: 74, text: "What's a question you've been meaning to ask me but keep forgetting?", category: "Personal", depth: "Light", perspective: "Both" },
  { id: 75, text: "What's a moment when you felt I really got you?", category: "Personal", depth: "Medium", perspective: "Me" },
  { id: 76, text: "Do you feel like you can be every version of yourself around me — the silly, quiet and confused ones too?", category: "Personal", depth: "Deep", perspective: "You" },
  { id: 77, text: "What's an inside joke or nickname only the two of us would get?", category: "Personal", depth: "Light", perspective: "Both" },
  { id: 78, text: "What's a story of yours I still haven't heard?", category: "Personal", depth: "Medium", perspective: "Me" },
  { id: 79, text: "Looking at all these memories we've collected, what do they say about us?", category: "Personal", depth: "Deep", perspective: "You" },
  { id: 80, text: "If you had to describe me to someone in three words, what would they be?", category: "Personal", depth: "Light", perspective: "Both" },
  { id: 81, text: "What's a moment when I completely surprised you?", category: "Personal", depth: "Medium", perspective: "Me" },
  { id: 82, text: "What's something about the way I look at places and their stories that you find interesting?", category: "Personal", depth: "Deep", perspective: "You" },
  { id: 83, text: "What's a misunderstanding between us that we never really cleared up?", category: "Personal", depth: "Very Deep", perspective: "Both" },
  { id: 84, text: "What's your favourite way for us to spend a quiet evening?", category: "Personal", depth: "Light", perspective: "Me" },
  { id: 85, text: "What's a habit of ours you'd never want to change?", category: "Personal", depth: "Medium", perspective: "You" },
  { id: 86, text: "If you could bottle one feeling from our time together, which one would it be?", category: "Personal", depth: "Deep", perspective: "Both" },
  { id: 87, text: "What's something you know about me that I'd be surprised you remembered?", category: "Personal", depth: "Light", perspective: "Me" },
  { id: 88, text: "What's one thing you wish I understood about how you see the world?", category: "Personal", depth: "Medium", perspective: "You" },
  { id: 89, text: "What's a way we've both grown since we met?", category: "Personal", depth: "Deep", perspective: "Both" },
  { id: 90, text: "What's the last thing that made you laugh about us?", category: "Personal", depth: "Light", perspective: "You" },
  { id: 91, text: "When I send you those random feeling-pretty pictures, what's your reaction?", category: "Personal", depth: "Medium", perspective: "Me" },
  { id: 92, text: "What's something you hope we never lose, even as things change?", category: "Personal", depth: "Deep", perspective: "You" },
  { id: 93, text: "What's the one memory of us you'd replay if you could?", category: "Personal", depth: "Light", perspective: "Both" },
  { id: 94, text: "What's a small gesture of mine you don't realize matters?", category: "Personal", depth: "Medium", perspective: "Me" },
  { id: 95, text: "What do you think I'm most afraid of losing?", category: "Personal", depth: "Deep", perspective: "You" },
  { id: 96, text: "Is there something about us you're quietly unsure of?", category: "Personal", depth: "Very Deep", perspective: "Me" },
  { id: 97, text: "What's a place you'd love for us to go next?", category: "Personal", depth: "Light", perspective: "Both" },
  { id: 98, text: "What's a question you'd ask me if you knew I'd answer honestly?", category: "Personal", depth: "Medium", perspective: "You" },
  { id: 99, text: "What's the thing you appreciate most about how I show up for you?", category: "Personal", depth: "Deep", perspective: "Me" },
  { id: 100, text: "What's one small thing about us that only we would know?", category: "Personal", depth: "Light", perspective: "Both" },

  // ---------------------------------------------------------------------------
  // Hypothetical — 101–150
  // ---------------------------------------------------------------------------
  { id: 101, text: "If you woke up tomorrow able to speak every language, what's the first conversation you'd want to have?", category: "Hypothetical", depth: "Light", perspective: "Both" },
  { id: 102, text: "If you could live in any decade, which one would you pick and why?", category: "Hypothetical", depth: "Medium", perspective: "You" },
  { id: 103, text: "If you had an extra hour every day with no obligations, how would you spend it?", category: "Hypothetical", depth: "Light", perspective: "Me" },
  { id: 104, text: "If money were truly no object, what's the first place you'd take me?", category: "Hypothetical", depth: "Medium", perspective: "You" },
  { id: 105, text: "If you could go back and give your younger self one piece of advice, what would it be?", category: "Hypothetical", depth: "Deep", perspective: "Both" },
  { id: 106, text: "If animals could talk, which one would you most want to hear from?", category: "Hypothetical", depth: "Light", perspective: "Both" },
  { id: 107, text: "If you had to move to a new city tomorrow, what would you look for first?", category: "Hypothetical", depth: "Medium", perspective: "Me" },
  { id: 108, text: "If you could eat one meal for the rest of your life, what would it be?", category: "Hypothetical", depth: "Light", perspective: "You" },
  { id: 109, text: "If you knew today was your last complete day, how would you spend it?", category: "Hypothetical", depth: "Deep", perspective: "Both" },
  { id: 110, text: "If you could erase one invention from history, which would it be?", category: "Hypothetical", depth: "Medium", perspective: "Me" },
  { id: 111, text: "If you were handed a book with the story of your life, would you read the last chapter first?", category: "Hypothetical", depth: "Light", perspective: "Both" },
  { id: 112, text: "If you could swap lives with someone for a week, who would it be?", category: "Hypothetical", depth: "Medium", perspective: "You" },
  { id: 113, text: "If you could undo one choice you've made, would you — and what would you lose by changing it?", category: "Hypothetical", depth: "Very Deep", perspective: "Me" },
  { id: 114, text: "If your house were on fire and you could save one non-living thing, what would it be?", category: "Hypothetical", depth: "Light", perspective: "Both" },
  { id: 115, text: "If you could have any job for just one day, what would you try?", category: "Hypothetical", depth: "Medium", perspective: "You" },
  { id: 116, text: "If you found a bag of money with no note and no name, what would you do?", category: "Hypothetical", depth: "Light", perspective: "Me" },
  { id: 117, text: "If you could ask one person from your past a single question, who would it be and what would you ask?", category: "Hypothetical", depth: "Deep", perspective: "Both" },
  { id: 118, text: "If you had to describe your ideal day from morning to night, what does it look like?", category: "Hypothetical", depth: "Medium", perspective: "You" },
  { id: 119, text: "If you could be any age for a week, which age would you pick?", category: "Hypothetical", depth: "Light", perspective: "Me" },
  { id: 120, text: "If everything you believed about someone turned out to be wrong, would you still want to know them?", category: "Hypothetical", depth: "Deep", perspective: "Both" },
  { id: 121, text: "If you could plant one tree that would live a thousand years, what would it be and where?", category: "Hypothetical", depth: "Medium", perspective: "Me" },
  { id: 122, text: "If a theme song played every time you walked into a room, what would yours be?", category: "Hypothetical", depth: "Light", perspective: "You" },
  { id: 123, text: "If you could change one thing about yourself, but it cost you a memory you love, would you do it?", category: "Hypothetical", depth: "Deep", perspective: "Me" },
  { id: 124, text: "If you could send a message to us ten years from now, what would you write?", category: "Hypothetical", depth: "Medium", perspective: "Both" },
  { id: 125, text: "If you were a season, which one would you be and why?", category: "Hypothetical", depth: "Light", perspective: "Me" },
  { id: 126, text: "If you could only keep five memories from your whole life, which five?", category: "Hypothetical", depth: "Deep", perspective: "You" },
  { id: 127, text: "If you could meet yourself as a child, what would you say to them?", category: "Hypothetical", depth: "Medium", perspective: "Both" },
  { id: 128, text: "If you could train an animal to do one useful thing, what would it be?", category: "Hypothetical", depth: "Light", perspective: "You" },
  { id: 129, text: "If you were offered fame for something you weren't proud of, would you take it?", category: "Hypothetical", depth: "Medium", perspective: "Me" },
  { id: 130, text: "If we swapped places in our last disagreement, would you see it differently?", category: "Hypothetical", depth: "Deep", perspective: "Both" },
  { id: 131, text: "If you could invent a holiday that didn't exist, what would it celebrate?", category: "Hypothetical", depth: "Light", perspective: "You" },
  { id: 132, text: "If you could write the rules for a perfect friendship, what would the first rule be?", category: "Hypothetical", depth: "Medium", perspective: "Me" },
  { id: 133, text: "If you had to choose between being deeply loved and deeply understood, which would you pick?", category: "Hypothetical", depth: "Very Deep", perspective: "Both" },
  { id: 134, text: "If you could rename yourself for a single day, what name would you choose?", category: "Hypothetical", depth: "Light", perspective: "You" },
  { id: 135, text: "If you were given a million pounds but had to give it all away in a week, how would you?", category: "Hypothetical", depth: "Medium", perspective: "Me" },
  { id: 136, text: "If you could remove one painful memory, would you — even if it helped make you who you are?", category: "Hypothetical", depth: "Deep", perspective: "Both" },
  { id: 137, text: "If you could have an imaginary pet that was real to everyone else, what would it be?", category: "Hypothetical", depth: "Light", perspective: "You" },
  { id: 138, text: "If a stranger offered you a free trip anywhere with no return date, would you go?", category: "Hypothetical", depth: "Medium", perspective: "Me" },
  { id: 139, text: "If you could know exactly how someone feels about you, would you want to know?", category: "Hypothetical", depth: "Deep", perspective: "You" },
  { id: 140, text: "If you could make one thing in the world disappear, what would it be?", category: "Hypothetical", depth: "Light", perspective: "Both" },
  { id: 141, text: "If you could attend any concert from history, which one would it be?", category: "Hypothetical", depth: "Medium", perspective: "Me" },
  { id: 142, text: "If your life had a skip-intro button, which part would you skip?", category: "Hypothetical", depth: "Light", perspective: "You" },
  { id: 143, text: "If you had to live in a world where no one remembered you, what would you do with your life?", category: "Hypothetical", depth: "Deep", perspective: "Both" },
  { id: 144, text: "If you could master one skill instantly, what would it be?", category: "Hypothetical", depth: "Medium", perspective: "Me" },
  { id: 145, text: "If telling someone the truth about how you feel might ruin things, would you still tell them?", category: "Hypothetical", depth: "Very Deep", perspective: "You" },
  { id: 146, text: "If you could invent a brand-new flavour, what would it taste like?", category: "Hypothetical", depth: "Light", perspective: "Both" },
  { id: 147, text: "If you were stuck on an island with one other person, what quality would you hope they had?", category: "Hypothetical", depth: "Medium", perspective: "Me" },
  { id: 148, text: "If you could change one tiny rule in the world, what would it be?", category: "Hypothetical", depth: "Light", perspective: "You" },
  { id: 149, text: "If you could hear what people say about you when you're not there, would you?", category: "Hypothetical", depth: "Very Deep", perspective: "Both" },
  { id: 150, text: "If you got a do-over on one conversation, which one would you redo?", category: "Hypothetical", depth: "Medium", perspective: "You" },

  // ---------------------------------------------------------------------------
  // Playful & Random — 151–200
  // ---------------------------------------------------------------------------
  { id: 151, text: "Pineapple on pizza: defend your position with the passion it deserves.", category: "Playful & Random", depth: "Light", perspective: "Both" },
  { id: 152, text: "What's the most ridiculously specific thing you're oddly good at?", category: "Playful & Random", depth: "Medium", perspective: "You" },
  { id: 153, text: "If you had to eat one snack for the rest of your life, what are you picking?", category: "Playful & Random", depth: "Light", perspective: "Me" },
  { id: 154, text: "What's the worst haircut you've ever had?", category: "Playful & Random", depth: "Light", perspective: "Both" },
  { id: 155, text: "What's a song you're secretly embarrassed to love — would you admit it to me?", category: "Playful & Random", depth: "Medium", perspective: "You" },
  { id: 156, text: "What's the strangest dream you've had recently?", category: "Playful & Random", depth: "Light", perspective: "Me" },
  { id: 157, text: "What's the silliest thing you've ever cried over?", category: "Playful & Random", depth: "Deep", perspective: "Both" },
  { id: 158, text: "Dogs or cats — and will you accept both as a valid answer?", category: "Playful & Random", depth: "Light", perspective: "You" },
  { id: 159, text: "What's a food combination everyone loves that you just can't get behind?", category: "Playful & Random", depth: "Medium", perspective: "Me" },
  { id: 160, text: "What's your go-to karaoke song?", category: "Playful & Random", depth: "Light", perspective: "Both" },
  { id: 161, text: "What's the most random fact you know by heart?", category: "Playful & Random", depth: "Medium", perspective: "You" },
  { id: 162, text: "If you could only use one emoji for the rest of your life, which one?", category: "Playful & Random", depth: "Light", perspective: "Me" },
  { id: 163, text: "What's the worst film you've ever paid to watch?", category: "Playful & Random", depth: "Light", perspective: "Both" },
  { id: 164, text: "What's a weird little ritual you do before something important?", category: "Playful & Random", depth: "Medium", perspective: "You" },
  { id: 165, text: "What's your most irrational fear?", category: "Playful & Random", depth: "Light", perspective: "Me" },
  { id: 166, text: "What's a compliment from me that's stayed with you?", category: "Playful & Random", depth: "Deep", perspective: "You" },
  { id: 167, text: "What's the best thing you've ever eaten — no notes?", category: "Playful & Random", depth: "Light", perspective: "Both" },
  { id: 168, text: "If your life had a laugh track, when would it play?", category: "Playful & Random", depth: "Medium", perspective: "Me" },
  { id: 169, text: "What's a word you love saying out loud?", category: "Playful & Random", depth: "Light", perspective: "Both" },
  { id: 170, text: "What's the most unnecessary thing you've ever bought?", category: "Playful & Random", depth: "Medium", perspective: "You" },
  { id: 171, text: "What's a dance move you'd actually attempt at a wedding?", category: "Playful & Random", depth: "Light", perspective: "Me" },
  { id: 172, text: "What's a time you laughed so hard you couldn't breathe?", category: "Playful & Random", depth: "Deep", perspective: "Both" },
  { id: 173, text: "What's your spirit animal — and be honest?", category: "Playful & Random", depth: "Light", perspective: "You" },
  { id: 174, text: "What's a smell you secretly love that others might find weird?", category: "Playful & Random", depth: "Medium", perspective: "Me" },
  { id: 175, text: "What's the best prank you've ever pulled or witnessed?", category: "Playful & Random", depth: "Light", perspective: "Both" },
  { id: 176, text: "What's a talent you wish you had, even if it's completely useless?", category: "Playful & Random", depth: "Medium", perspective: "You" },
  { id: 177, text: "What's your ideal breakfast?", category: "Playful & Random", depth: "Light", perspective: "Me" },
  { id: 178, text: "What's a moment you felt left out and pretended you didn't care?", category: "Playful & Random", depth: "Very Deep", perspective: "Me" },
  { id: 179, text: "What's the most ridiculous thing you've ever argued about?", category: "Playful & Random", depth: "Light", perspective: "You" },
  { id: 180, text: "What's a phrase I say way too often?", category: "Playful & Random", depth: "Medium", perspective: "Me" },
  { id: 181, text: "If you could be any fictional creature, what would you be?", category: "Playful & Random", depth: "Light", perspective: "Both" },
  { id: 182, text: "What's a guilty-pleasure show you'd defend with your life?", category: "Playful & Random", depth: "Medium", perspective: "You" },
  { id: 183, text: "What's your favourite way to completely waste an afternoon?", category: "Playful & Random", depth: "Light", perspective: "Me" },
  { id: 184, text: "What's a small thing that makes you quietly proud of yourself?", category: "Playful & Random", depth: "Deep", perspective: "Both" },
  { id: 185, text: "What's the weirdest thing currently in your fridge?", category: "Playful & Random", depth: "Light", perspective: "You" },
  { id: 186, text: "What's a compliment you'd give yourself, out loud?", category: "Playful & Random", depth: "Medium", perspective: "Me" },
  { id: 187, text: "What's the most chaotic thing we've ever done on a whim?", category: "Playful & Random", depth: "Light", perspective: "Both" },
  { id: 188, text: "What's a noise you simply cannot stand?", category: "Playful & Random", depth: "Medium", perspective: "You" },
  { id: 189, text: "What's something you're secretly insecure about that you wish people saw differently?", category: "Playful & Random", depth: "Very Deep", perspective: "Both" },
  { id: 190, text: "What's your go-to excuse for being late?", category: "Playful & Random", depth: "Light", perspective: "Both" },
  { id: 191, text: "What's a food you used to hate but love now?", category: "Playful & Random", depth: "Medium", perspective: "You" },
  { id: 192, text: "What's a silly thing you do when you're completely alone?", category: "Playful & Random", depth: "Light", perspective: "Me" },
  { id: 193, text: "What's the best advice you've ever given someone else?", category: "Playful & Random", depth: "Medium", perspective: "Both" },
  { id: 194, text: "What's your favourite colour, and does it actually match your personality?", category: "Playful & Random", depth: "Light", perspective: "You" },
  { id: 195, text: "What's the last thing that made you genuinely proud of someone else?", category: "Playful & Random", depth: "Deep", perspective: "Me" },
  { id: 196, text: "What's a meme that you think perfectly describes your life?", category: "Playful & Random", depth: "Light", perspective: "Both" },
  { id: 197, text: "What's something you wish people understood about the real you?", category: "Playful & Random", depth: "Very Deep", perspective: "You" },
  { id: 198, text: "What's the strangest compliment you've ever received?", category: "Playful & Random", depth: "Medium", perspective: "Me" },
  { id: 199, text: "What's a tiny thing about us that instantly makes you smile?", category: "Playful & Random", depth: "Light", perspective: "Both" },
  { id: 200, text: "What's one more question you wish I'd ask you?", category: "Playful & Random", depth: "Medium", perspective: "You" },
];
