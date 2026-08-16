/**
 * Real Google reviews for Union Park Landscaping (Wilmington, DE).
 * Sourced from the business's public Google ratings feed / review aggregators.
 * When GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID are set, live Places API
 * reviews replace this cache at request time.
 */

export type GoogleReview = {
  author: string;
  rating: number;
  text: string;
  relativeTime?: string;
  source: "Google";
};

export type GoogleReviewsPayload = {
  rating: number;
  count: number;
  url: string;
  reviews: GoogleReview[];
  live: boolean;
};

/** Curated 5★ Google reviews shown on the site (real customer wording). */
export const CACHED_GOOGLE_REVIEWS: GoogleReviewsPayload = {
  rating: 5.0,
  count: 47,
  url: "https://www.google.com/search?q=Union+Park+Landscaping+Wilmington+DE+reviews",
  live: false,
  reviews: [
    {
      author: "Scott",
      rating: 5,
      text: "I sent a text and received an immediate response with a quote to have new mulch put down in my beds as well as weeding and cleanup. The price quoted was reasonable and the work was done the very next day. My property looked great! I would definitely recommend Union Park Landscaping and will consider them as needed in the future.",
      relativeTime: "Google review",
      source: "Google",
    },
    {
      author: "Daulton",
      rating: 5,
      text: "Best service around. I have known Pat for over 10 years and he has always respected everyone. He is hard working and honest. His work is amazing. 10/10.",
      relativeTime: "Google review",
      source: "Google",
    },
    {
      author: "Google reviewer",
      rating: 5,
      text: "These guys keep going until the job is DONE! No nonsense, no hassle, great communication, professional, they provide reasonable quotes, and they're punctual. They have easily earned landscape business and referrals from me going forward.",
      relativeTime: "Aug 2024",
      source: "Google",
    },
    {
      author: "Google reviewer",
      rating: 5,
      text: "We loved our experience with Union Park Landscaping! Pat was prompt, personal, and knowledgeable. Communication was easy and he and his workers did an amazing job. They even found a wasp nest and took care of it, then knocked on the neighbor's door to make sure they knew. Truly the nicest guys and an excellent job on our retaining wall.",
      relativeTime: "Aug 2024",
      source: "Google",
    },
    {
      author: "Google reviewer",
      rating: 5,
      text: "We've used Union Park Landscaping for the last three years for annual mulch installation and flower bed maintenance. Patrick's always responsive and professional, the work always looks great, and their rates are very reasonable compared to other services in the area.",
      relativeTime: "May 2024",
      source: "Google",
    },
    {
      author: "Google reviewer",
      rating: 5,
      text: "Had some drainage done. Very good pricing. Well explained before the quote and went above and beyond what was originally discussed.",
      relativeTime: "May 2024",
      source: "Google",
    },
  ],
};

type PlacesReview = {
  rating?: number;
  text?: { text?: string } | string;
  authorAttribution?: { displayName?: string };
  relativePublishTimeDescription?: string;
};

type PlacesDetails = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesReview[];
};

function reviewText(text: PlacesReview["text"]): string {
  if (!text) return "";
  if (typeof text === "string") return text.trim();
  return (text.text || "").trim();
}

/** Fetch live reviews from Google Places API (New). Falls back to cache. */
export async function getGoogleReviews(): Promise<GoogleReviewsPayload> {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();

  if (!key || !placeId) {
    return CACHED_GOOGLE_REVIEWS;
  }

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "rating,userRatingCount,googleMapsUri,reviews.rating,reviews.text,reviews.authorAttribution,reviews.relativePublishTimeDescription",
      },
      next: { revalidate: 60 * 60 * 12 }, // 12h
    });

    if (!res.ok) {
      console.error("Google Places reviews fetch failed", res.status);
      return CACHED_GOOGLE_REVIEWS;
    }

    const data = (await res.json()) as PlacesDetails;
    const reviews: GoogleReview[] = (data.reviews || [])
      .map((r) => ({
        author: r.authorAttribution?.displayName?.trim() || "Google reviewer",
        rating: r.rating ?? 5,
        text: reviewText(r.text),
        relativeTime: r.relativePublishTimeDescription,
        source: "Google" as const,
      }))
      .filter((r) => r.text.length > 40)
      .slice(0, 6);

    if (reviews.length === 0) {
      return {
        ...CACHED_GOOGLE_REVIEWS,
        rating: data.rating ?? CACHED_GOOGLE_REVIEWS.rating,
        count: data.userRatingCount ?? CACHED_GOOGLE_REVIEWS.count,
        url: data.googleMapsUri ?? CACHED_GOOGLE_REVIEWS.url,
        live: Boolean(data.rating),
      };
    }

    return {
      rating: data.rating ?? CACHED_GOOGLE_REVIEWS.rating,
      count: data.userRatingCount ?? CACHED_GOOGLE_REVIEWS.count,
      url: data.googleMapsUri ?? CACHED_GOOGLE_REVIEWS.url,
      reviews,
      live: true,
    };
  } catch (err) {
    console.error("Google Places reviews error", err);
    return CACHED_GOOGLE_REVIEWS;
  }
}
