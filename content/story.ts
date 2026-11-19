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
    };
    conversations: {
      marker: string;
      title: string;
      story: StoryTextBlock;
      letter: StoryLetter;
      firstChatImage: StoryPhoto;
      secondChatImage: StoryPhoto;
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
      blueSkyPhoto: StoryPhoto;
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
    reflection: StoryTextBlock;
  };
  personalNote: {
    title: string;
    crossedName: string;
    boldName: string;
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
      story: {
        label: "The Beginning story",
        lines: 4,
        text: `Sometimes I think about how strange it is that I met you the way I did.

You sent me a request, and I genuinely thought your account was fake. I accepted it eventually, saw you, and somehow convinced myself that you must be from my college.

I remember asking people if they'd ever seen you around campus. I was so sure you studied there.

And then I found out you were from Jammu.

Our first conversation happened because I replied to one of your stories as a joke. I didn't have any particular reason to do it. I just did.

I didn't know anything about you then. Not your stories, not how bhondu and bauna you were

I only knew that you were fun to talk to.

And somehow, that was enough to make me want to know more.`,
      },
    },
    conversations: {
      marker: "02",
      title: "The Conversations",
      story: {
        label: "The Conversations story",
        lines: 6,
        text: `I think some people become a part of our routine so quietly that we don't even notice when it happens.

That's how it felt with you.

I remember those first few calls, how easily i got comfortable with you, and how i'd keep talking without realising how much time had passed and not realizing how id be a prime dengue victim with all those mosquitos biting me 

There was always something else to talk about. And even when there wasn't, somehow, it felt calm and nice.

I particularly remember that train journey, when I was trying to write something for you and my internet refused to cooperate. You kept roothofying because we both wanted to keep talking.

I still have what I wrote that day. And I remember the two videos you sent afterwards. I accidentally closed the first one, but the second one is still so clear in my mind. Your expression, your eyes, your reaction.

I sometimes wonder how many little moments we experience without realising that years later, we'll still be able to picture them so clearly.

Maybe that's what makes a memory special. Not how extraordinary it was when it happened, but how much of it stays with us.`,
      },
      letter: {
        heading: "The original letter",
        cardPreview: "There is about her a light that does not beg for attention, yet somehow guides me through the vast ocean of life.",
        readLabel: "Read the letter →",
        fullText: {
          label: "The original letter — preserve exactly as supplied",
          lines: 12,
          text: `There is about her a light that does not beg for attention, yet somehow guides me through the vast ocean of life. Not the loud blaze of the noon sun but the quiet, silver mercy of the moon. The kind that leads a lost traveler through a thick forest at midnight. The kind that steadies a fragile boat against a raging storm in the ocean

And yet… she is also the first touch of sunrise after a long, cold merciless night. The warmth on cold skin. The reminder that darkness never truly wins. With her I feel something rare, something like home 

She carries a grace that is not delicate, but deeply rooted. Strong and unmoving. There is a divine feminine presence in her that steadies the very air. When she is near, the noise of the world fades into nothing. Time slows. Everything else becomes irrelevant

To speak with her is a strange kind of comfort. Words flow without effort, yet never lose their depth. One conversation with her feels like sitting upon an ancient oak growing from the edge of a cliff with clouds rolling beneath you. It is calming yet thrilling. Safe yet awakening. You feel understood in ways you did not know you longed for. She does not listen merely to answer but listens to uncover. To peel back layers. To see the versions of you the world has overlooked

Her mind is no shallow stream but is like an ocean. Vast, philosophical and unafraid of depth or darkness. She does not skim the surface of ideas but dives into the trenches. Her views are not careless instead they are carved with thought. Firm as stone, yet alive like newly lit fire. When she stands her ground she does not need to raise her voice 

She speaks of life as though she has lived it a thousand times before. As though she has wandered through unseen worlds and returned with wisdom. She loves travel, yes but more than places, she loves what lies beneath them. The questions, the meaning, the purpose. The long conversations under open skies where time forgets to move and the soul feels heard

There is something beautifully unusual about her. She feels familiar, yet unknowable. Warm, yet deeply intriguing. Like a story written in ink that refuses to fade, no matter how many years pass

To describe her fully would be like trying to capture the wind within my hands

And yet…

I would keep trying until my very last breath`,
        },
      },
      firstChatImage: { label: "First chat image", shape: "tall", src: "/media/chat-1.jpg", caption: "" },
      secondChatImage: { label: "Second chat image", shape: "tall", src: "/media/chat-2.jpg", caption: "" },
    },
    surprise: {
      marker: "03",
      title: "The Jammu Surprise",
      reactionVideo: {
        label: "Surprise reaction video",
        featured: true,
        src: "/media/surprise-reaction.mp4",
      },
      gallery: [
        { label: "Jammu photo 1", shape: "square", src: "/media/jammu-1.jpg", caption: "" },
        { label: "Jammu photo 2", shape: "square", src: "/media/jammu-2.jpg", caption: "" },
        { label: "Jammu photo 3", shape: "square", src: "/media/jammu-3.jpg", caption: "" },
        { label: "Jammu photo 4", shape: "square", src: "", caption: "" },
      ],
      story: {
        label: "The Jammu Surprise story",
        lines: 3,
        text: `I still think it's a little crazy that I travelled all the way from Bombay to Jammu on a completely random day just to surprise you.

And I think your reaction made the entire journey worth it.

You stopped for a second, squinted your eyes, almost as if you needed to make sure you weren't imagining things, and then ran towards me. Followed, of course, by a slap on my arm. 

I remember being so nervous before seeing you. But somehow, after we met, you became the nervous one.

Your mom thought you were meeting Dhwani and wanted a picture. And there we were, having to ask a random girl to take a photograph with you

But I think there's something beautiful about being able to look back at a moment and remember not just what happened, but the exact expressions, the nervousness, and the ridiculous little things that came with it.

I'm especially glad we have that video. Some reactions are just too precious to trust to memory alone.`,
      },
    },
    palace: {
      marker: "04",
      title: "Hari Niwas Palace",
      bluePainting: { label: "Blue painting", shape: "tall", src: "", caption: "" },
      blueSkyPhoto: { label: "Blue sky photo", shape: "square", src: "", caption: "" },
      blueSky: {
        label: "Blue sky and her dad",
        lines: 4,
        text: `I think I'll always associate Hari Niwas Palace with two very different memories.

One is a particular shade of blue.

I remember you looking at that painting in the museum and telling me about the morning you spent with your dad. How you woke up, stepped outside, and saw the sky in that exact shade.

It reminded you of him.

I don't think I'll ever look at that particular shade of blue quite the same way again. It's interesting how something so simple can hold an entire memory for someone. I can't explain what it feels like to hear someone tell you about a person they miss.`,
      },
      drunkUncle: {
        label: "The drunk uncle story",
        lines: 3,
        text: `And then there's the other memory from that palace. The drunk uncle. 

I don't think we could have predicted how that entire situation would unfold. From the compliments to the car keys, to both of us confused looking at each other and telling him we couldn't drive, and eventually hiding somewhere randomly

I still laugh when I think about that video of us hiding from him.

I suppose that's what I like about remembering that day. It has a little bit of everything. A conversation I'll always remember, and an incident that will probably never stop being funny.`,
      },
      hidingVideo: { label: "Hiding video", featured: false, src: "" },
    },
    temple: {
      marker: "05",
      title: "The Temple",
      story: {
        label: "The Temple story",
        lines: 4,
        text: `I remember our time at Bawe Maa Ka Mandir and Har Ki Pauri with a certain kind of fondness.

I remember walking through the temple, me walking behind you, and the two of us praying together.

And I remember feeling peaceful. I don't know if it was the place, the prayers, or just the moment itself. But I felt good.

I think we spend so much of our time thinking about what's next, where we're going, what we need to do, and everything that's happening around us.

But that day, I remember simply being present.

Walking with you. Praying with you.

And sometimes, I think that's all a person really needs. A moment where nothing feels heavy.

I hope you remember that day, too.`,
      },
      photo: { label: "Temple photo", shape: "wide", src: "", caption: "" },
    },
    train: {
      marker: "06",
      title: "The Missed Train",
      story: {
        label: "The Missed Train story",
        lines: 5,
        text: `After meeting you in Jammu, I was on my way back to Bombay when I missed my train in Delhi.

You know, when I think about that journey, I remember going all the way to Jammu just to see you.

But I also remember coming back.

And somewhere in Delhi, after missing a train, there was someone making sure I was okay.

I think that's what I want to remember.

Not the train I missed.

Not the inconvenience.

Just that call.

I remember being there, trying to figure things out, and you staying on call with me throughout the whole situation. You even got me so much foooooooood.

And the fact that even though you weren't physically there, I didn't feel like I was dealing with everything on my own.

We often remember the big things people do for us. The journeys, the surprises, the plans. But sometimes, it's the smaller gestures that tell us just as much.

I had travelled all the way to see you, but somehow, one of the memories I carried back with me was of you looking after me from miles away.`,
      },
    },
  },
  momentToRemember: {
    title: "A Moment to Remember",
    text: {
      label: "A Moment to Remember text",
      lines: 4,
      text: `And here we are...

A collection of moments that became memories.

Some we planned. Some we stumbled upon. Some we probably didn't realise we'd remember for this long.

But every now and then, I find myself going back to them.

And I'm glad I have them.`,
    },
    reflection: {
      label: "A Moment to Remember reflection",
      lines: 4,
      text: `Before you go any further, I want you to take a little moment for yourself.

Close your eyes for a while.

Think about all these little moments. The conversations, the laughter, the places, the unexpected turns, and all the things that perhaps seemed ordinary when they happened.

Take yourself back to those days. Remember how they felt, the little details, the things we laughed about, and the things i might have forgotten to mention here.

I wonder which of these memories came back to you first.

And I wonder if, somewhere along the way, you smiled without even realising it.`,
    },
  },
  personalNote: {
    title: "A Personal Note",
    crossedName: "Ravleen,",
    boldName: "Revleen,",
    opening: {
      label: "Personal note — opening",
      lines: 3,
      text: `You know, I sometimes wonder if you realise how much of yourself you reveal in the smallest things. In the way you ask me question after question, because one answer is never quite enough. In the way your voice changes when you speak to your mom, becoming this tiny little voice, and sometimes you do the same with me. In those little *turururu* sounds you make, or how your American accent suddenly appears when you're telling me about something unbelievable that happened to you.

I think I enjoy these things because they remind me that there is so much more to a person than what we usually see. There are all these little expressions, habits, thoughts and ways of looking at things that slowly make someone familiar to us. I love hearing your stories, even when I am left completely speechless by whatever has happened this time. I love the random pictures you take of us, and the ones you send me when you're feeling pretty. I don't think you need a reason to share those little moments with me. I hope you never feel that you do.

You know, one of the things I admire most about you is the way you look at the world. You don't just visit places; you want to know their stories, the meaning behind them, and what makes them special. You find things in the smallest details that I might have otherwise walked right past. And I think that's a beautiful way to experience life. I hope you never lose that curiosity, that depth, or that little part of you that wants to know more.

If there's one thing I could wish for you, it would be that you never have to become a little less of yourself to feel comfortable beside me.`,
    },
    middle: {
      label: "Personal note — middle (keep full approved wording)",
      lines: 7,
      text: `I hope you blossom when you're with me. I hope you feel free to be every version of yourself. Silly, serious, confused, excited, quiet, loud. I hope you never feel like you have to hold back or worry about being too much.

I want you to have the kind of freedom where you don't have to rehearse what you're going to say before saying it. Where you can tell me the things that make you happy, the things that frighten you, the thoughts you haven't quite figured out yourself. Where you can cry without feeling embarrassed, be vulnerable without feeling weak, and be unapologetically yourself without wondering how it will be received.

I hope you never look at the world and feel that you need permission to experience it. Go wherever your curiosity takes you. Be a little reckless with your dreams. Take the long way home. Try the things that scare you. Make mistakes and laugh about them later. There is so much of life waiting for you, and I hope you never feel that you have to approach it with fear.

And when the world feels a little too heavy, I hope being around me makes it feel lighter. Not because I'll always have the answers, but because you won't have to carry everything by yourself.`,
    },
    ending: {
      label: "Personal note — ending leading into the song",
      lines: 3,
      text: `I want to see you grow, change, surprise yourself and become someone even you haven't imagined yet. And I hope that through all those versions of you, you never once feel that you have to earn your place beside me.

Because I don't just want to see you happy in the moments we share. I want to see you happy in the life you build, in the places you go, in the things you discover, and in the person you become.

And I hope you see yourself a little more kindly along the way. I wish you could borrow my eyes for a moment, just to understand how much beauty you carry without even trying.

I don't think a note can quite hold everything I wish for you. So, instead, I'll leave you with a song. Maybe it can say a little of what I haven't managed to.`,
    },
    song: {
      label: "[ song details and selected lyrics — to be provided ]",
      title: "Best Part",
      artist: "Daniel Caesar ft. H.E.R.",
      lyrics: `You're my water when I'm stuck in the desert
You're the Tylenol I take when my head hurts
You're the sunshine on my lifeeeeee

I just wanna see how beautiful you are
You know that I see it, I know you're a star
Where you go, I'll follow, no matter how far
If life is a movie, then you're the best part, oh
You're the best part, ooh
Best paaaartt`,
    },
  },
  lightbox: {
    photoLabel: "— full-size photo to be provided",
  },
};
