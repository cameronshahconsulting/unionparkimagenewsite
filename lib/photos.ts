/** Central photo paths for Scene `photo` props. */

export const photos = {
  heroHome: "/images/hero-home-yard.jpg",
  serviceArea: "/images/service-area-garden.jpg",
  aboutCrew: "/images/about-crew-truck.jpg",
  aboutGarden: "/images/about-garden-work.jpg",
  townHero: "/images/hero-home-yard.jpg",
} as const;

export const servicePhotos: Record<string, string> = {
  "landscape-design": "/images/service-landscape-design.jpg",
  hardscaping: "/images/service-hardscaping.jpg",
  drainage: "/images/service-drainage.jpg",
  fencing: "/images/service-fencing.jpg",
  "yard-cleanups": "/images/service-yard-cleanups.jpg",
  "lawn-care": "/images/service-lawn-care.jpg",
};

export const galleryPhotos = [
  {
    photo: "/images/gallery-patio-hockessin.jpg",
    variant: "patio" as const,
    title: "Paver patio with fire pit",
    town: "Hockessin, DE",
  },
  {
    photo: "/images/gallery-foundation-wilmington.jpg",
    variant: "garden" as const,
    title: "Front foundation replanting",
    town: "Wilmington, DE",
  },
  {
    photo: "/images/gallery-drainage-newark.jpg",
    variant: "drainage" as const,
    title: "French drain + dry creek bed",
    town: "Newark, DE",
  },
  {
    photo: "/images/gallery-fence-pike-creek.jpg",
    variant: "fence" as const,
    title: "Cedar privacy fence",
    town: "Pike Creek, DE",
  },
  {
    photo: "/images/gallery-cleanup-greenville.jpg",
    variant: "cleanup" as const,
    title: "Full fall cleanup & mulch",
    town: "Greenville, DE",
  },
  {
    photo: "/images/gallery-lawn-bear.jpg",
    variant: "lawn" as const,
    title: "Lawn renovation & overseed",
    town: "Bear, DE",
  },
  {
    photo: "/images/gallery-frontyard-middletown.jpg",
    variant: "home" as const,
    title: "Complete front yard redesign",
    town: "Middletown, DE",
  },
  {
    photo: "/images/gallery-walkway-wilmington.jpg",
    variant: "patio" as const,
    title: "Walkway & entry landing",
    town: "Wilmington, DE",
  },
  {
    photo: "/images/gallery-pollinator-newark.jpg",
    variant: "garden" as const,
    title: "Native pollinator beds",
    town: "Newark, DE",
  },
];
