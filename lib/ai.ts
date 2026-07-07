import { GoogleGenAI } from "@google/genai";

/**
 * AI layer for the Yard Visualizer.
 *
 * Runs in MOCK mode (echoes the uploaded photo + canned breakdown) whenever
 * MOCK_AI=true or no GEMINI_API_KEY is set, so the full flow is testable
 * without keys or spend.
 */

const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image";
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL ?? "gemini-2.5-flash";

export const isMockAi =
  process.env.MOCK_AI === "true" || !process.env.GEMINI_API_KEY;

export interface ImageInput {
  /** base64 without data: prefix */
  data: string;
  mimeType: string;
}

export interface PlantLine {
  commonName: string;
  quantity: number;
  size?: string;
}

export interface MaterialLine {
  item: string;
  estQuantity: string;
}

export interface DesignBreakdown {
  summary: string;
  trees: PlantLine[];
  shrubs: PlantLine[];
  flowersAndPerennials: PlantLine[];
  materials: MaterialLine[];
  laborNotes: string;
}

export interface DesignResult {
  image: ImageInput;
  breakdown: DesignBreakdown;
  mocked: boolean;
}

function client() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
}

function buildEditPrompt(request: string, styles: string[]) {
  return [
    "You are creating a landscaping design preview by editing a real photo of a residential yard.",
    "Rules:",
    "- Keep the house, driveway, structures, property boundaries, camera angle, perspective, and lighting EXACTLY as in the original photo.",
    "- Change ONLY the landscaping: lawn, plants, trees, shrubs, flowers, garden beds, mulch, patios, walkways, fences, and similar outdoor landscape elements.",
    "- The result must be photorealistic and look like a professional landscaping company installed the changes at this exact property.",
    "- Only make landscaping-related changes, regardless of what the request says.",
    styles.length > 0 ? `Overall style direction: ${styles.join(", ")}.` : "",
    "If additional inspiration photos are provided after the yard photo, borrow their plant palette, materials, and mood — but apply them to the original yard photo's scene.",
    `Homeowner's requested changes: ${request}`,
  ]
    .filter(Boolean)
    .join("\n");
}

const breakdownSchema = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      description: "2-3 sentence plain-English summary of the design changes",
    },
    trees: {
      type: "array",
      items: {
        type: "object",
        properties: {
          commonName: { type: "string" },
          quantity: { type: "integer" },
          size: { type: "string", description: "e.g. 6-8 ft, 15 gal" },
        },
        required: ["commonName", "quantity"],
      },
    },
    shrubs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          commonName: { type: "string" },
          quantity: { type: "integer" },
          size: { type: "string" },
        },
        required: ["commonName", "quantity"],
      },
    },
    flowersAndPerennials: {
      type: "array",
      items: {
        type: "object",
        properties: {
          commonName: { type: "string" },
          quantity: { type: "integer" },
          size: { type: "string" },
        },
        required: ["commonName", "quantity"],
      },
    },
    materials: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item: { type: "string", description: "e.g. hardwood mulch, paver patio, steel edging" },
          estQuantity: { type: "string", description: "e.g. ~4 cu yd, ~250 sq ft, ~40 lin ft" },
        },
        required: ["item", "estQuantity"],
      },
    },
    laborNotes: {
      type: "string",
      description: "Short notes for the estimating team: demo/removal needs, access considerations, anything visible that affects labor",
    },
  },
  required: ["summary", "trees", "shrubs", "flowersAndPerennials", "materials", "laborNotes"],
} as const;

const MOCK_BREAKDOWN: DesignBreakdown = {
  summary:
    "Refreshed front foundation beds with layered evergreen and flowering shrubs, added a shade tree, and defined the beds with fresh hardwood mulch. (Sample data — set GEMINI_API_KEY for real analysis.)",
  trees: [{ commonName: "Red Maple", quantity: 1, size: "8-10 ft" }],
  shrubs: [
    { commonName: "Inkberry Holly", quantity: 5, size: "3 gal" },
    { commonName: "Oakleaf Hydrangea", quantity: 3, size: "5 gal" },
  ],
  flowersAndPerennials: [
    { commonName: "Catmint", quantity: 8, size: "1 gal" },
    { commonName: "Coneflower", quantity: 6, size: "1 gal" },
  ],
  materials: [
    { item: "Hardwood mulch", estQuantity: "~4 cu yd" },
    { item: "Steel bed edging", estQuantity: "~60 lin ft" },
  ],
  laborNotes:
    "Sample estimate notes. Real analyses list removals, access notes, and visible site factors for the crew.",
};

async function generateImage(
  yardPhoto: ImageInput,
  inspiration: ImageInput[],
  request: string,
  styles: string[]
): Promise<ImageInput> {
  const parts = [
    { text: buildEditPrompt(request, styles) },
    { inlineData: { data: yardPhoto.data, mimeType: yardPhoto.mimeType } },
    ...inspiration.map((img) => ({
      inlineData: { data: img.data, mimeType: img.mimeType },
    })),
  ];

  const res = await client().models.generateContent({
    model: IMAGE_MODEL,
    contents: [{ role: "user", parts }],
  });

  for (const part of res.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData?.data) {
      return {
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType ?? "image/png",
      };
    }
  }
  throw new Error(
    "The design model returned no image. This can happen with unusual photos — please try a different photo or wording."
  );
}

async function analyzeDesign(
  original: ImageInput,
  design: ImageInput,
  request: string
): Promise<DesignBreakdown> {
  const res = await client().models.generateContent({
    model: TEXT_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "You are an estimator for a landscaping company in Delaware (USDA zone 7).",
              "Image 1 is the customer's original yard photo. Image 2 is the AI-generated redesign of the same yard.",
              `The customer requested: "${request}"`,
              "Compare the two images and produce a materials/plant takeoff of what was ADDED or CHANGED in the redesign, so the crew can price the job.",
              "Count plants realistically from what is visible, name species with common names a Delaware nursery stocks, and estimate material quantities from visible areas.",
            ].join("\n"),
          },
          { inlineData: { data: original.data, mimeType: original.mimeType } },
          { inlineData: { data: design.data, mimeType: design.mimeType } },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: breakdownSchema,
    },
  });

  const text = res.text;
  if (!text) throw new Error("Empty analysis response");
  return JSON.parse(text) as DesignBreakdown;
}

export async function createYardDesign(input: {
  yardPhoto: ImageInput;
  inspiration: ImageInput[];
  request: string;
  styles: string[];
}): Promise<DesignResult> {
  if (isMockAi) {
    await new Promise((r) => setTimeout(r, 1500));
    return { image: input.yardPhoto, breakdown: MOCK_BREAKDOWN, mocked: true };
  }

  const image = await generateImage(
    input.yardPhoto,
    input.inspiration,
    input.request,
    input.styles
  );

  let breakdown: DesignBreakdown;
  try {
    breakdown = await analyzeDesign(input.yardPhoto, image, input.request);
  } catch {
    // Analysis is a nice-to-have for the team; never fail the customer's design over it.
    breakdown = {
      summary: "Automatic materials analysis was unavailable for this design.",
      trees: [],
      shrubs: [],
      flowersAndPerennials: [],
      materials: [],
      laborNotes: "Analysis failed — estimate from the design image directly.",
    };
  }

  return { image, breakdown, mocked: false };
}
