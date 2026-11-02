/** Client-selected photography from the Union Park collection in Annie’s Drive. */
type ProjectPhoto = { src: string; title: string; alt: string };

export const projectPhotos: Record<string, ProjectPhoto[]> = {
  "landscape-design": [
    {
      "src": "/images/projects/lit-foundation-planting.webp",
      "title": "Foundation planting at dusk",
      "alt": "Warm lights pick out clipped shrubs along the front of a two-story home."
    },
    {
      "src": "/images/projects/curving-foundation-bed.webp",
      "title": "A curved planting border",
      "alt": "Rounded shrubs sit in a mulched bed with a pale stone edge along the house."
    },
    {
      "src": "/images/projects/blossoming-side-garden.webp",
      "title": "A path beneath spring blossoms",
      "alt": "Pink blossoms hang over a narrow strip of grass between curved mulched beds."
    },
    {
      "src": "/images/projects/brick-home-foundation-border.webp",
      "title": "A border along the brick facade",
      "alt": "Small shrubs and pale rocks line a dark mulched bed outside a brick home."
    }
  ],
  "hardscaping": [
    {
      "src": "/images/projects/backyard-paver-patio.webp",
      "title": "A patio off the back deck",
      "alt": "A rectangular paver patio runs beneath a white deck and opens onto the lawn."
    },
    {
      "src": "/images/projects/gray-paver-walk.webp",
      "title": "A path around the house",
      "alt": "Gray pavers follow the side of the house, with a darker border along the path."
    },
    {
      "src": "/images/projects/brick-entry-walk.webp",
      "title": "Brick at the front door",
      "alt": "A curved brick walkway wraps around the shrubs at a covered front entrance."
    },
    {
      "src": "/images/projects/brick-and-stone-steps.webp",
      "title": "Brick and stone entry steps",
      "alt": "Stone treads cap the brick steps leading to a white front door."
    }
  ],
  "drainage": [
    {
      "src": "/images/projects/stone-drainage-bed.webp",
      "title": "A stone bed beside the porch",
      "alt": "A drain grate sits in a crescent of river stone beside a white screened porch."
    },
    {
      "src": "/images/projects/drain-trench.webp",
      "title": "Opening the trench",
      "alt": "A crew member works beside a narrow drainage trench along the lawn."
    },
    {
      "src": "/images/projects/buried-drain-line.webp",
      "title": "Pipe before backfill",
      "alt": "A white drainage pipe runs through an open trench."
    },
    {
      "src": "/images/projects/downspout-connection.webp",
      "title": "Connecting the downspout",
      "alt": "A downspout connects to a white drain line beside brickwork and a paver path."
    }
  ],
  "fencing": [
    {
      "src": "/images/projects/fenced-paver-court.webp",
      "title": "A private backyard patio",
      "alt": "Wood privacy fencing encloses a gray paver patio and mulched beds."
    },
    {
      "src": "/images/projects/fenced-shade-garden.webp",
      "title": "A fence around a shade tree",
      "alt": "Wood fencing frames a shaded lawn and brick path beneath a mature tree."
    },
    {
      "src": "/images/projects/wood-gate.webp",
      "title": "A gated side entrance",
      "alt": "A wooden picket gate closes off the space beside a driveway."
    },
    {
      "src": "/images/projects/fenced-side-path.webp",
      "title": "A sheltered side path",
      "alt": "A paver path runs between two wood fences with planting along its edges."
    }
  ],
  "yard-cleanups": [
    {
      "src": "/images/projects/autumn-front-yard.webp",
      "title": "An autumn front yard",
      "alt": "A tidy striped lawn and planting beds sit under trees with red and gold foliage."
    },
    {
      "src": "/images/projects/leaf-collection-crew.webp",
      "title": "Leaf collection at the curb",
      "alt": "A crew member guides a leaf collection hose beside the pink work truck."
    },
    {
      "src": "/images/projects/autumn-leaf-cover.webp",
      "title": "Before leaf collection",
      "alt": "Fallen leaves cover a lawn beneath mature autumn trees."
    },
    {
      "src": "/images/projects/brush-collection.webp",
      "title": "Brush ready for removal",
      "alt": "A pile of cut branches sits beside an outbuilding on a leaf-covered lawn."
    }
  ],
  "lawn-care": [
    {
      "src": "/images/projects/striped-front-lawn.webp",
      "title": "A freshly cut front lawn",
      "alt": "Alternating mowing stripes lead across a wide lawn from the sidewalk to the house."
    },
    {
      "src": "/images/projects/brick-ranch-lawn.webp",
      "title": "Stripes along the front beds",
      "alt": "A striped lawn follows the edge of a planting bed at a red brick home."
    },
    {
      "src": "/images/projects/open-striped-lawn.webp",
      "title": "An open stretch of lawn",
      "alt": "Sunlit mowing stripes stretch toward a row of trees beneath a blue sky."
    },
    {
      "src": "/images/projects/tree-lined-lawn.webp",
      "title": "Mowing around established trees",
      "alt": "Alternating strips of mown grass curve around a row of trees."
    }
  ]
};

export const photos = {
  heroHome: "/images/projects/front-lawn-and-tree-bed.webp",
  townHero: projectPhotos["lawn-care"][1].src,
  aboutCrew: projectPhotos["yard-cleanups"][1].src,
  aboutGarden: projectPhotos["landscape-design"][1].src,
} as const;
