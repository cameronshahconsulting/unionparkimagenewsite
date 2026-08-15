/**
 * AI Yard Designer, Delivery & Plant Care Terms — Version 1.0.
 *
 * Drafted from scratch (no source markdown was ever provided for this one —
 * only Terms of Service and Privacy Policy were). Deliberately cross-references
 * ToS/Privacy rather than restating them, so there's exactly one place each
 * rule lives — two liability caps or two dispute clauses in two documents is
 * exactly the kind of thing that creates ambiguity a court has to resolve
 * against the drafter.
 */

import Link from "next/link";

export const DESIGNER_TERMS_VERSION_INFO = { version: "1.0", effectiveDate: "2026-08-03" };

export const designerTermsIntro = (
  <>
    <strong>PLEASE READ.</strong> This document has three parts. <strong>Part A</strong> covers
    the AI Yard Designer — an idea tool, not a professional design service. <strong>Part
    B</strong> covers delivery of plants you buy through the Site. <strong>Part C</strong> covers
    your responsibilities after delivery and our Arrival Inspection and Return Policy — the only
    remedy we offer, and it is not a warranty. Section A10 limits our liability for Designer
    output; Section C1 disclaims warranties on delivered plants. Together with the{" "}
    <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>,
    this is the entire agreement about designing, buying, and receiving plants from us.
  </>
);

export const designerTermsSections = [
  {
    id: "scope",
    level: 2,
    heading: "Scope and how this fits with our other terms",
    body: (
      <>
        <p>
          This document supplements, and is incorporated into, the{" "}
          <Link href="/terms">Terms of Service</Link> (&ldquo;ToS&rdquo;). Defined terms used there
          — Annie&rsquo;s, the Site, the Designer — carry the same meaning here. Where this
          document doesn&rsquo;t address something, the ToS controls; where both address the same
          subject, <strong>this document controls as the more specific term.</strong>
        </p>
        <p>
          <strong>Christmas tree reservations and delivery are governed entirely by ToS §
          9</strong>, not by Part B below. <strong>Third-party installation by Union Park
          Landscaping is governed entirely by ToS § 10</strong>, not by this document — Annie&rsquo;s
          plant-care disclaimers in Part C still apply to the plants themselves regardless of who
          plants them.
        </p>
      </>
    ),
  },
  {
    id: "parta",
    level: 2,
    heading: "Part A — AI Yard Designer",
    body: null,
  },
  {
    id: "a1",
    level: 3,
    heading: "A1. What the Designer is — and is not",
    blockquote: true,
    body: (
      <>
        <p>
          THE AI YARD DESIGNER PRODUCES AN ILLUSTRATION OF ONE WAY YOUR YARD COULD LOOK. IT IS NOT
          LANDSCAPE ARCHITECTURE, ARCHITECTURE, ENGINEERING, SURVEYING, ARBORICULTURE, SOIL
          SCIENCE, OR ANY OTHER LICENSED PROFESSIONAL SERVICE, AND USING IT DOES NOT CREATE A
          PROFESSIONAL RELATIONSHIP OF ANY KIND BETWEEN YOU AND ANNIE&rsquo;S.
        </p>
        <p>
          NO ONE AT ANNIE&rsquo;S IS A LICENSED LANDSCAPE ARCHITECT. THE DESIGNER DOES NOT KNOW
          YOUR SOIL, DRAINAGE, GRADE, SUN EXPOSURE BEYOND WHAT YOU TELL IT, BURIED UTILITIES,
          PROPERTY LINES, EASEMENTS, SETBACKS, LOCAL CODE, OR HOA RULES. ITS OUTPUT IS AN IDEA, NOT
          A PLAN.
        </p>
      </>
    ),
  },
  {
    id: "a2",
    level: 3,
    heading: "A2. How it works",
    body: (
      <>
        <p>
          You upload a photo of your yard and answer a few questions (style, sun, budget, and
          similar). We send your photo and answers to a third-party AI provider, which returns
          rendered images and a suggested plant list drawn only from plants we currently stock. See{" "}
          <Link href="/privacy">Privacy Policy</Link> § 3 for what happens to your photograph.
        </p>
        <p>
          The Designer is a <strong>free tool with usage limits</strong> (currently five designs
          per email address per week) to prevent abuse. We may change, limit, or discontinue it at
          any time without notice.
        </p>
      </>
    ),
  },
  {
    id: "a3",
    level: 3,
    heading: "A3. We are not landscape architects",
    body: (
      <p>
        <strong>We are not landscape architects</strong>, and nothing on this Site holds Annie&rsquo;s
        or anyone at it out as one. &ldquo;Landscape-style blueprint&rdquo; and similar phrases
        used elsewhere on the Site describe the look of a garden plan graphic, not a professional
        landscape-architecture deliverable. If your project needs a licensed landscape architect,
        engineer, or surveyor, that is a separate professional you will need to retain yourself.
      </p>
    ),
  },
  {
    id: "a4",
    level: 3,
    heading: "A4. Call 811 before you dig",
    blockquote: true,
    body: (
      <>
        <p>
          BEFORE YOU OR ANYONE ELSE DIGS, PLANTS, OR INSTALLS ANYTHING BASED ON A DESIGNER OUTPUT,
          CALL 811 (OR YOUR STATE&rsquo;S ONE-CALL SERVICE) TO HAVE BURIED UTILITY LINES MARKED. IT
          IS FREE AND REQUIRED BY LAW IN DELAWARE, NEW JERSEY, PENNSYLVANIA, AND MARYLAND BEFORE
          ANY EXCAVATION.
        </p>
        <p>
          THE DESIGNER HAS NO KNOWLEDGE OF BURIED GAS, ELECTRIC, WATER, SEWER, OR
          COMMUNICATIONS LINES, SEPTIC FIELDS, PROPERTY BOUNDARIES, EASEMENTS, OR ANY LOCAL
          PERMIT REQUIREMENT. <strong>YOU ARE SOLELY RESPONSIBLE FOR CALLING 811, VERIFYING
          PROPERTY LINES AND SETBACKS, OBTAINING ANY REQUIRED PERMIT, AND CONFIRMING HOA OR DEED
          RESTRICTIONS BEFORE ACTING ON ANY DESIGNER OUTPUT.</strong>
        </p>
      </>
    ),
  },
  {
    id: "a5",
    level: 3,
    heading: "A5. Accuracy",
    body: (
      <p>
        Plant selections assume general Delaware Zone 7 growing conditions. Your yard&rsquo;s
        actual sun, soil, drainage, and microclimate may differ from what the Designer assumed, and
        may call for a different plant than the one shown. Rendered images are illustrations, not
        photographs of the specific plants you will receive — see ToS § 5.2, which applies in full
        to every Designer image.
      </p>
    ),
  },
  {
    id: "a6",
    level: 3,
    heading: "A6. Your photograph and content",
    body: (
      <p>
        By uploading a photo you represent that you own or occupy the property shown, or have
        permission to photograph it, and that it does not show any other identifiable person
        without their consent — see ToS § 14. Our use of your photo, including in our own
        marketing, is governed by <Link href="/privacy">Privacy Policy</Link> §§ 3 and 6.4,
        including how to opt out.
      </p>
    ),
  },
  {
    id: "a7",
    level: 3,
    heading: "A7. Saved designs, sharing, and deletion",
    body: (
      <p>
        A saved design&rsquo;s link is <strong>unlisted, not private</strong> — anyone who has the
        link can view it, per <Link href="/privacy">Privacy Policy</Link> § 3. You can view every
        design tied to your email and permanently delete a design and its source photograph at any
        time from <Link href="/designer/mine">Your designs</Link>; deletion is immediate on our
        end and removes the underlying files, not just the listing.
      </p>
    ),
  },
  {
    id: "a8",
    level: 3,
    heading: "A8. No automated decisions with legal effect",
    body: (
      <p>
        The Designer suggests plants; it does not price differently by person, evaluate
        creditworthiness, or decide whether we will serve you. It does not make any decision about
        you that produces a legal or similarly significant effect.
      </p>
    ),
  },
  {
    id: "a9",
    level: 3,
    heading: "A9. No obligation to purchase",
    body: (
      <p>
        Generating a design is free and creates no obligation to buy anything. A price shown next
        to a plant in the Designer is an estimate as of that moment; the price and any quantity
        discount at checkout control, per ToS § 7.
      </p>
    ),
  },
  {
    id: "a10",
    level: 3,
    heading: "A10. Limitation of liability for Designer output",
    blockquote: true,
    body: (
      <>
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, ANNIE&rsquo;S HAS NO LIABILITY FOR ANY LOSS,
          DAMAGE, INJURY, FINE, OR PENALTY ARISING FROM YOUR USE OF, OR RELIANCE ON, ANY OUTPUT
          GENERATED BY THE AI YARD DESIGNER — INCLUDING, WITHOUT LIMITATION, DAMAGE FROM STRIKING A
          BURIED UTILITY LINE, A DISPUTE OVER A PROPERTY LINE OR EASEMENT, A VIOLATION OF AN HOA
          RULE OR DEED RESTRICTION, OR A VIOLATION OF LOCAL CODE OR PERMIT REQUIREMENTS.
        </p>
        <p style={{ fontWeight: 400, textTransform: "none" }}>
          This limitation is in addition to, and does not replace, the disclaimers and liability
          cap in ToS §§ 15 and 16, which apply in full to the Designer. Nothing in this Section
          excludes liability for death or personal injury caused by our negligence, for fraud, or
          for any other liability that cannot lawfully be excluded — see ToS § 16.
        </p>
      </>
    ),
  },
  {
    id: "partb",
    level: 2,
    heading: "Part B — Delivery",
    body: (
      <p>
        This Part covers delivery of <strong>plants</strong>. Christmas tree delivery is governed
        by ToS § 9; installation by Union Park Landscaping is governed by ToS § 10.
      </p>
    ),
  },
  {
    id: "b1",
    level: 3,
    heading: "B1. Delivery window",
    body: (
      <p>
        We&rsquo;ll give you an estimated delivery day or window by email. <strong>Dates and times
        are estimates; time is not of the essence.</strong> Weather, route, and vehicle
        availability can shift a delivery — see ToS § 18 (force majeure).
      </p>
    ),
  },
  {
    id: "b2",
    level: 3,
    heading: "B2. Access and site conditions",
    body: (
      <>
        <p>
          You&rsquo;re responsible for a clear, safe path to the drop location — gates unlocked,
          pets secured, vehicles and obstructions cleared. If access is blocked or unsafe in our
          driver&rsquo;s reasonable judgment, we may leave your order at the nearest safe location
          (such as a driveway or curb) or reschedule.
        </p>
        <p>
          If we can&rsquo;t deliver because the address was wrong, access was blocked, or delivery
          was refused, a re-delivery fee applies under ToS § 12.3.
        </p>
      </>
    ),
  },
  {
    id: "b3",
    level: 3,
    heading: "B3. Delivery only — not planting",
    body: (
      <p>
        <strong>We deliver and unload; we do not dig, plant, grade, or install</strong> unless
        you&rsquo;ve separately contracted Union Park Landscaping under ToS § 10. Where you
        requested placement in a specific spot, we&rsquo;ll place containers there if it&rsquo;s
        reasonably accessible, but exact placement is a courtesy, not a contractual obligation.
      </p>
    ),
  },
  {
    id: "b4",
    level: 3,
    heading: "B4. Risk of loss",
    body: (
      <p>
        Risk of loss for each plant passes to you when we deliver it to the agreed location (or
        when you or your agent accepts it, if earlier). Inspect promptly — see Part C.
      </p>
    ),
  },
  {
    id: "b5",
    level: 3,
    heading: "B5. Delivery photographs",
    body: (
      <p>
        Our driver may photograph your order at handoff as a record of its condition on delivery.
        We keep these for 24 months — see <Link href="/privacy">Privacy Policy</Link> § 9.
      </p>
    ),
  },
  {
    id: "partc",
    level: 2,
    heading: "Part C — Plant Care, Arrival Inspection & Return Policy",
    body: null,
  },
  {
    id: "c1",
    level: 3,
    heading: "C1. No warranty on plant survival",
    blockquote: true,
    body: (
      <>
        <p>
          PLANTS ARE LIVING GOODS. ANNIE&rsquo;S GIVES NO WARRANTY, WRITTEN OR ORAL, THAT ANY PLANT
          WILL SURVIVE, THRIVE, GROW TO ANY SIZE, OR BLOOM AT ANY TIME AFTER DELIVERY.
        </p>
        <p>
          THE ARRIVAL INSPECTION AND RETURN POLICY BELOW IS A RETURN AND REFUND POLICY — <strong>IT
          IS NOT A WARRANTY</strong>, AND IT DOES NOT COVER A PLANT&rsquo;S PERFORMANCE AFTER YOU
          HAVE ACCEPTED, PLANTED, OR CARED FOR IT. THIS SECTION RESTATES, AND DOES NOT REPLACE, THE
          DISCLAIMER OF WARRANTIES IN TOS § 15.
        </p>
      </>
    ),
  },
  {
    id: "c2",
    level: 3,
    heading: "C2. Arrival inspection — 48 hours",
    body: (
      <p>
        <strong>Inspect your plants as soon as they arrive.</strong> If a plant is dead on
        arrival, damaged in transit, the wrong variety, the wrong quantity, or visibly infested
        with plant pests, <strong>report it within 48 hours of delivery</strong>, with photographs,
        to anniesonlinenursery@gmail.com or (302) 757-5496. <strong>Claims reported after 48 hours
        are waived</strong>, except where a longer period is required by law and cannot be
        shortened by agreement.
      </p>
    ),
  },
  {
    id: "c3",
    level: 3,
    heading: "C3. What's covered",
    body: (
      <p>
        For a timely, photographed report of a plant that was <strong>dead on arrival, damaged in
        transit, mislabeled, or shipped in the wrong variety or quantity</strong>, we will replace,
        credit, or refund that plant, at our discretion.
      </p>
    ),
  },
  {
    id: "c4",
    level: 3,
    heading: "C4. What's not covered",
    body: (
      <>
        <p>The Arrival Inspection and Return Policy does not cover, and we have no liability for:</p>
        <ul>
          <li>Failure to water, plant, or otherwise establish the plant after delivery;</li>
          <li>Transplant shock, or ordinary stress from being moved and replanted;</li>
          <li>Frost, freeze, drought, heat, storm, or other weather occurring after delivery;</li>
          <li>Deer, rabbit, insect, disease, or other damage occurring after you&rsquo;ve accepted the plant;</li>
          <li>A plant sited in soil, drainage, or sun/shade conditions it isn&rsquo;t suited for, where you chose the location;</li>
          <li>Damage from installation — by you, by Union Park, or by anyone else;</li>
          <li>Issues first reported more than 48 hours after delivery; or</li>
          <li>Any plant that has already been planted, watered, or fertilized (planting is treated as acceptance of its condition).</li>
        </ul>
      </>
    ),
  },
  {
    id: "c5",
    level: 3,
    heading: "C5. Your responsibility after delivery",
    body: (
      <p>
        <strong>After delivery, all watering, planting timing, siting, and ongoing care is your
        responsibility.</strong> Planting-window guidance, bloom calendars, and care notes on the
        Site or in the Designer are <strong>general horticultural information about the variety,
        not a maintenance warranty or professional agronomic advice</strong> — see ToS § 5.3.
      </p>
    ),
  },
  {
    id: "c6",
    level: 3,
    heading: "C6. Limitation of liability",
    body: (
      <p>
        The limitation of liability and damages cap in ToS § 16 apply in full to plants delivered
        under this document, including to any claim about a plant&rsquo;s survival, condition, or
        performance after delivery.
      </p>
    ),
  },
  {
    id: "c7",
    level: 3,
    heading: "C7. Toxicity, thorns, children and pets",
    body: (
      <p>
        <strong>Many ornamental plants are toxic if eaten; some irritate skin; some bear
        thorns.</strong> Where we know a variety carries one of these traits we flag it on the
        product listing, the Designer plant list, and your cart — but{" "}
        <strong>we do not screen your order for your household&rsquo;s specific risks, and we
        don&rsquo;t know who or what lives at your address.</strong> Checking each variety before
        planting is your responsibility — see ToS § 5.6.
      </p>
    ),
  },
  {
    id: "c8",
    level: 3,
    heading: "C8. Regulated and invasive plants",
    body: (
      <p>
        We do not sell a plant into a state where its sale is prohibited, and we flag state-mandated
        invasive-species notices on affected listings — see ToS § 6. You remain responsible for
        restrictions that apply to you rather than to us, including local ordinances, HOA
        covenants, and deed restrictions.
      </p>
    ),
  },
  {
    id: "c9",
    level: 3,
    heading: "C9. If Union Park installs your order",
    body: (
      <p>
        Installation by Union Park Landscaping is a separate contract between you and Union Park,
        governed by ToS § 10 — Annie&rsquo;s is not responsible for their workmanship, scheduling,
        or any warranty they may or may not give. This Part C — including the 48-hour arrival
        window and what&rsquo;s covered — applies to the plants themselves regardless of who plants
        them.
      </p>
    ),
  },
  {
    id: "partd",
    level: 2,
    heading: "Part D — General",
    body: null,
  },
  {
    id: "d1",
    level: 3,
    heading: "D1. New Jersey residents",
    body: (
      <p>
        The protections in ToS § 20 for New Jersey consumers apply equally to this document — no
        provision here limits or waives a right New Jersey law makes non-waivable.
      </p>
    ),
  },
  {
    id: "d2",
    level: 3,
    heading: "D2. Governing law and disputes",
    body: (
      <p>
        ToS § 19 — Delaware governing law, the requirement to send a Notice of Dispute before
        filing, the small-claims option, the venue and jury-trial waiver, and the class-action
        waiver — governs any dispute arising under this document, exactly as it governs the ToS
        itself.
      </p>
    ),
  },
  {
    id: "d3",
    level: 3,
    heading: "D3. Acceptance and versioning",
    body: (
      <p>
        You accept this document by checking the acceptance box in the Designer or at checkout,
        each of which links here. We record the date, time, and version you accepted — see ToS §
        21. Superseded versions remain available permanently at{" "}
        <Link href="/designer-terms/v/1.0">/designer-terms/v/[date]</Link>.
      </p>
    ),
  },
  {
    id: "d4",
    level: 3,
    heading: "D4. Changes",
    body: (
      <p>
        We may revise this document; changes take effect when posted with an updated date.
        Material changes will be announced on the Site and by email where we have your address.
      </p>
    ),
  },
  {
    id: "d5",
    level: 3,
    heading: "D5. Contact",
    body: (
      <p>
        <strong>Annie&rsquo;s Online Nursery, LLC</strong>
        <br />
        anniesonlinenursery@gmail.com · (302) 757-5496
      </p>
    ),
  },
];
