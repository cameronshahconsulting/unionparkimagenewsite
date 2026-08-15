/**
 * Terms of Service — Version 2.0.
 *
 * Reconstructed from the source markdown the owner pasted in chat, which had
 * scattered dropped words/characters (typical of a lossy copy-paste). Fixes
 * applied are noted inline below each one; nothing else was altered from the
 * original text. One deliberate omission: the internal drafting note under
 * § 19 ("delete before publishing") — that's instructions to the owner, not
 * customer-facing terms, so it's excluded from the published page.
 */

import Link from "next/link";
import { COMPANY_ADDRESS, NURSERY_LICENSE } from "@/lib/site-config";

export const TERMS_VERSION_INFO = { version: "2.1", effectiveDate: "2026-08-11" };

export const termsIntro = (
  <>
    <strong>PLEASE READ.</strong> Section 15 disclaims warranties. Section 16 limits our
    liability. Section 19 governs disputes and includes a jury trial waiver and a class action
    waiver. Section 5 explains that plants are living goods and that images on this site are
    illustrations, not promises.
  </>
);

export const termsSections = [
  {
    id: "s1",
    level: 2,
    heading: "1. Agreement",
    body: (
      <>
        <p>
          These Terms are a binding agreement between you and <strong>Annie&rsquo;s Online
          Nursery, LLC</strong>, a Delaware limited liability company (&ldquo;Annie&rsquo;s,&rdquo;
          &ldquo;we,&rdquo; &ldquo;us&rdquo;), governing anniesonlinenursery.com (the
          &ldquo;Site&rdquo;) and everything we sell or offer through it.
        </p>
        <p>Incorporated by reference and equally binding:</p>
        <ul>
          <li><Link href="/privacy">Privacy Policy</Link></li>
          <li><Link href="/designer-terms">AI Yard Designer, Delivery &amp; Plant Care Terms</Link></li>
        </ul>
        <p>If you don&rsquo;t agree to all three, don&rsquo;t use the Site.</p>
      </>
    ),
  },
  {
    id: "s2",
    level: 2,
    heading: "2. Who we are, and what we are not",
    body: (
      <>
        <p>
          Annie&rsquo;s is a licensed Delaware nursery. Our nursery license number
          (<strong>Delaware Nursery License No. {NURSERY_LICENSE}</strong>) appears in the
          footer of every page and on this document, as required by <strong>3 Del. C. §
          1308(c)</strong>. Our corporate address is <strong>{COMPANY_ADDRESS}</strong>.
        </p>
        <p>
          <strong>We are not landscape architects.</strong> No one at Annie&rsquo;s is a licensed
          landscape architect, and nothing we provide — including anything produced by the AI Yard
          Designer — is landscape architecture, architecture, engineering, surveying, or
          professional design services of any kind. We do not hold ourselves out as licensed in
          any such profession.
        </p>
        <p>
          <strong>We are a plant seller.</strong> We select and grow plants, we deliver them, and
          we offer free tools to help you imagine what plants might look like in your yard. That is
          the entire scope of what we do.
        </p>
      </>
    ),
  },
  {
    id: "s3",
    level: 2,
    heading: "3. Eligibility",
    body: (
      <p>
        You must be 18 or older and able to form a binding contract. If you order for a business,
        HOA or other organization, you represent that you can bind it.
      </p>
    ),
  },
  {
    id: "s4",
    level: 2,
    heading: "4. Service area — we deliver, we do not ship",
    body: (
      <>
        <ul>
          <li><strong>Plants:</strong> delivered in Delaware, New Jersey, Pennsylvania and Maryland, within approximately 60 miles of Wilmington, Delaware.</li>
          <li><strong>Installation:</strong> through our independent partner, within approximately 30 miles of our Wilmington shop.</li>
          <li><strong>We do not ship by mail or common carrier, and we do not deliver outside those four states.</strong></li>
        </ul>
        <p>
          The town list in your cart is our current service area and may change. If you order to
          an address we can&rsquo;t serve, we&rsquo;ll contact you and refund in full.
        </p>
      </>
    ),
  },
  {
    id: "s5",
    level: 2,
    heading: "5. Plants are living goods — what we do and don't represent",
    body: null,
  },
  {
    id: "s5-1",
    level: 3,
    heading: "5.1 Natural variation",
    body: (
      <p>
        Every plant is a living organism. <strong>Size, form, branching, foliage colour, bloom
        timing and overall appearance vary naturally between individual plants of the same
        variety</strong>, and vary with season, weather and growing conditions.
      </p>
    ),
  },
  {
    id: "s5-2",
    level: 3,
    heading: "5.2 Images are illustrations",
    body: (
      <>
        <p>
          <strong>Photographs, renderings and illustrations on this Site — including catalog
          images, garden plan images, planting blueprints, and every image produced by the AI Yard
          Designer — are illustrations of how a variety or arrangement can look. They are not
          photographs of the specific plants you will receive, they are not a sample or model of
          the goods, and they are not a representation of the condition, size or appearance of
          anything at delivery.</strong>
        </p>
        <p>
          <strong>No image on this Site is made part of the basis of any bargain, and no image
          creates any express warranty.</strong>
        </p>
      </>
    ),
  },
  {
    id: "s5-3",
    level: 3,
    heading: "5.3 What we do affirm",
    body: (
      <>
        <p>We affirm only this, and it is the complete set of representations we make about any plant:</p>
        <ol>
          <li>The <strong>container size</strong> stated in the listing (this describes the pot, not the plant)</li>
          <li>Any <strong>height range at delivery</strong> expressly stated in the listing</li>
          <li>The <strong>botanical name and variety</strong></li>
          <li>That the plant is <strong>alive and free from visible dangerously injurious plant pests at the time we hand it to you</strong></li>
        </ol>
        <p>
          &ldquo;Matures to&rdquo; figures, bloom months, colour descriptions, growth rates and
          bloom calendars are <strong>general horticultural information about the variety</strong>,
          not affirmations about your plant or your site.
        </p>
      </>
    ),
  },
  {
    id: "s5-4",
    level: 3,
    heading: "5.4 Sourcing and origin",
    body: (
      <p>
        We are a Delaware nursery. Some of what we sell we grow ourselves; <strong>some we
        purchase from other growers, primarily in the Delaware Valley region, and finish or hold at
        our facility.</strong> Where a listing states a place of origin, we intend it accurately.
        If you need to know the origin of a specific plant before you buy, ask us and we will tell
        you.
      </p>
    ),
  },
  {
    id: "s5-5",
    level: 3,
    heading: "5.5 Availability and substitution",
    body: (
      <>
        <p>
          Inventory changes. If we sell out after you order, we&rsquo;ll contact you and offer a
          comparable substitute of equal or greater value, a partial refund, or cancellation with a
          full refund.
        </p>
        <p>
          For <strong>garden plans and kits</strong>, we may substitute a comparable variety of
          equal or greater value where it doesn&rsquo;t materially change the character of the
          plan. Substitutions are noted on your delivery paperwork.
        </p>
      </>
    ),
  },
  {
    id: "s5-6",
    level: 3,
    heading: "5.6 Plant safety is your assessment",
    body: (
      <>
        <p>
          <strong>Many ornamental plants are toxic if eaten; some cause skin irritation; some bear
          thorns.</strong> We do not screen orders for toxicity, allergens or thorns, and we do not
          know your household.
        </p>
        <p>
          We also do not evaluate whether a plant suits your soil, drainage, grade, utility
          easements, setbacks, deed restrictions or HOA rules. <strong>Those assessments are
          yours.</strong> See the <Link href="/designer-terms">Delivery &amp; Plant Care
          Terms</Link>.
        </p>
      </>
    ),
  },
  {
    id: "s6",
    level: 2,
    heading: "6. Regulated and restricted plants",
    body: (
      <>
        <p>Plant sale restrictions differ by state and change.</p>
        <ul>
          <li><strong>We do not sell any plant into a state where its sale is prohibited.</strong> Restricted varieties are unavailable at checkout for affected delivery addresses.</li>
          <li>Some plants are lawful to sell but carry <strong>state-mandated invasive species notices</strong>. Where one applies to your order, that notice appears on the product listing and on your delivery paperwork.</li>
          <li><strong>You remain responsible for restrictions that apply to you rather than to us</strong> — local ordinances, HOA covenants, deed restrictions.</li>
          <li>If a plant becomes prohibited in your state between order and delivery, we substitute or refund under § 5.5.</li>
        </ul>
      </>
    ),
  },
  {
    id: "s7",
    level: 2,
    heading: "7. Pricing and quantity discounts",
    body: (
      <>
        <p>
          Prices are in U.S. dollars, subject to change, and the price at checkout controls. Sales
          tax is added where applicable.
        </p>
        <table>
          <thead>
            <tr><th>Quantity of one variety</th><th>Discount</th></tr>
          </thead>
          <tbody>
            <tr><td>1–4</td><td>List price</td></tr>
            <tr><td>5–9</td><td>5% off</td></tr>
            <tr><td>10–24</td><td>10% off</td></tr>
            <tr><td>25+</td><td>15% off</td></tr>
          </tbody>
        </table>
        <p>
          Quantity discounts apply automatically and do not stack with promotional codes unless
          stated.
        </p>
        <p>
          <strong>Errors.</strong> We may correct pricing, description or availability errors and
          cancel or refuse any order placed at an incorrect price, even after confirmation and
          payment, with a full refund. We will contact you first and offer the corrected price.
        </p>
      </>
    ),
  },
  {
    id: "s8",
    level: 2,
    heading: "8. Orders and payment",
    body: (
      <>
        <p>
          <strong>Formation.</strong> Your cart is not an order. Checkout is an <strong>offer to
          buy</strong>. We accept when we send an order confirmation. Until then we may decline or
          limit any order for any lawful reason.
        </p>
        <p>
          <strong>Shopify.</strong> Payment is processed on Shopify&rsquo;s hosted checkout, not on
          our Site. <strong>We never receive or store your card number.</strong> Shopify&rsquo;s
          terms and privacy policy apply to that portion of the transaction.
        </p>
        <p>
          <strong>Minimums and delivery.</strong> $299 minimum order (plants plus delivery). Flat
          delivery fee by town, shown once you select a location. <strong>Free delivery at $699 or
          more.</strong>
        </p>
      </>
    ),
  },
  {
    id: "s9",
    level: 2,
    heading: "9. Christmas tree reservations",
    body: (
      <>
        <p><strong>9.1</strong> You reserve a <strong>height class</strong>, not an identified tree. You choose the actual tree in person when our trailer arrives, from those we have in your class that day.</p>
        <p><strong>9.2</strong> We schedule a <strong>delivery week</strong> and confirm the day by email. Weather, harvest timing and routing can shift a week. <strong>Dates are estimates; time is not of the essence.</strong></p>
        <p><strong>9.3</strong> <strong>Doorstep only.</strong> We do not carry the tree inside, set it in a stand, or remove packaging. If no one is available, we may leave a tree of your reserved class at the door.</p>
        <p><strong>9.4</strong> <strong>Neighborhood truck.</strong> We email when we&rsquo;re working your area. We cannot guarantee a time. Trees bought off the trailer are sold as-is with no delivery fee.</p>
        <p><strong>9.5</strong> <strong>Cancellation.</strong> Full refund up to <strong>7 days before your confirmed delivery week</strong>; non-refundable after, because we harvest to order. If we cannot supply your class, we upgrade free or refund in full.</p>
      </>
    ),
  },
  {
    id: "s10",
    level: 2,
    heading: "10. Installation referrals — Union Park Landscaping",
    body: (
      <>
        <p>We do not install. We refer installation to <strong>Union Park Landscaping</strong>, an independent company.</p>
        <ul>
          <li>Union Park is <strong>not</strong> owned, controlled or employed by Annie&rsquo;s and is <strong>not our agent</strong>.</li>
          <li>Any installation is a <strong>separate contract between you and Union Park</strong>, on their terms and prices.</li>
          <li><strong>Annie&rsquo;s is not responsible for Union Park&rsquo;s pricing, scheduling, workmanship, licensing, insurance, property damage, injury, or any act or omission.</strong> Direct installation claims to them.</li>
          <li>Requesting an estimate is not a purchase; installation is not charged on your Annie&rsquo;s checkout.</li>
        </ul>
      </>
    ),
  },
  {
    id: "s10-1",
    level: 3,
    heading: "10.1 The 25% in-store credit",
    body: (
      <>
        <p>
          When Union Park installs an order purchased from Annie&rsquo;s, you earn in-store credit
          equal to <strong>25% of your Annie&rsquo;s plant subtotal</strong>, toward a
          <strong> future</strong> Annie&rsquo;s order.
        </p>
        <ul>
          <li>Not a discount on the installed order.</li>
          <li>Issued after Union Park confirms completion.</li>
          <li>A <strong>promotional loyalty benefit issued at no cost.</strong> You give no consideration for it. It is <strong>not a gift card, gift certificate or stored-value card</strong> and is not redeemable for cash.</li>
          <li><strong>No cash value, non-transferable</strong>, not applicable to delivery fees or sales tax.</li>
          <li>Calculated on plant subtotal only.</li>
          <li><strong>Expires 12 months from issuance</strong>, except where a shorter period is prohibited by your state&rsquo;s law, in which case the minimum required period applies.</li>
          <li>We may modify or end the program prospectively; issued credits are honored through expiration.</li>
        </ul>
      </>
    ),
  },
  {
    id: "s11",
    level: 2,
    heading: "11. Our charitable giving",
    body: (
      <>
        <p><strong>In memory of Annie, Annie&rsquo;s Online Nursery allocates 1–3% of revenue to cancer research.</strong></p>
        <p>
          This is a <strong>voluntary commitment by the company</strong>, made from company revenue.
          We currently direct that giving to the{" "}
          <a href="https://www.ecaware.org/" target="_blank" rel="noopener noreferrer">
            Esophageal Cancer Awareness Association (EC Aware)
          </a>
          , with a company fundraising goal of $25,000. Details:{" "}
          <Link href="/cancer-research">anniesonlinenursery.com/cancer-research</Link>.
        </p>
        <p>
          <strong>It is not a per-purchase donation. No portion of your payment is a charitable
          contribution, nothing is tax-deductible to you, and we do not issue donation
          receipts.</strong> We select recipient organizations at our discretion and may change or
          end this commitment at any time.
        </p>
      </>
    ),
  },
  {
    id: "s12",
    level: 2,
    heading: "12. Changes, cancellations and returns",
    body: (
      <>
        <p><strong>12.1 Before delivery.</strong> Cancel or change for a <strong>full refund any time before your order is loaded for delivery</strong> — email or call. Christmas trees are governed by § 9.5.</p>
        <p><strong>12.2 At and after delivery.</strong> Plants are perishable living goods. Returns and arrival claims are governed by the <strong>Arrival Inspection and Return Policy</strong> in our <Link href="/designer-terms">Delivery &amp; Plant Care Terms</Link>. In summary: inspect on arrival, report problems <strong>within 48 hours with photographs</strong>, and we will replace, credit or refund that plant. <strong>After delivery, all watering, planting, siting and care is your responsibility.</strong></p>
        <p><strong>12.3 Failed delivery.</strong> If we can&rsquo;t deliver because the address was wrong, access was blocked, or delivery was refused, we may charge a <strong>re-delivery fee equal to the original delivery fee</strong>.</p>
        <p><strong>12.4 Refunds</strong> are issued to the original payment method through Shopify, typically posting in 5–10 business days.</p>
      </>
    ),
  },
  {
    id: "s13",
    level: 2,
    heading: "13. Intellectual property",
    body: (
      <>
        <p>
          The Site and its contents — text, photographs, garden plans, planting blueprints, catalog
          copy, the Annie&rsquo;s name and logo, the site design, and the Designer software — are
          owned by Annie&rsquo;s or our licensors.
        </p>
        <p>
          You may view pages for personal, non-commercial use, including printing a planting
          blueprint for your own garden. You may not: republish or redistribute our content
          commercially; scrape, crawl or bulk-download the Site or catalog; use our images or plan
          drawings in your own products or marketing; reverse engineer the Designer or use it to
          build a competing service; or use our name or logo without written permission.
        </p>
        <p>
          <strong>Your content.</strong> You keep ownership of what you upload. You grant us the
          license described in the <Link href="/privacy">Privacy Policy</Link> § 5. You represent
          that you own or have permission to upload everything you submit.
        </p>
      </>
    ),
  },
  {
    id: "s14",
    level: 2,
    heading: "14. Acceptable use",
    body: (
      <p>
        Do not: break the law or infringe rights; upload malicious code or probe our systems;
        circumvent Designer usage limits or verification, including by using multiple email
        addresses; automate access without written permission; impersonate anyone; harvest other
        users&rsquo; information; upload photographs of people without consent or of property you
        don&rsquo;t own or occupy; or submit false claims or fraudulent payment information.
      </p>
    ),
  },
  {
    id: "s15",
    level: 2,
    heading: "15. Disclaimer of warranties",
    blockquote: true,
    body: (
      <>
        <p>THE SITE, THE YARD DESIGNER, AND ALL CONTENT AND SERVICES ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE,&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.</p>
        <p>TO THE FULLEST EXTENT PERMITTED BY LAW, ANNIE&rsquo;S DISCLAIMS ALL WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF <strong>MERCHANTABILITY</strong>, <strong>FITNESS FOR A PARTICULAR PURPOSE</strong>, TITLE AND NON-INFRINGEMENT.</p>
        <p>WE DO NOT WARRANT THAT: THE SITE WILL BE UNINTERRUPTED, SECURE OR ERROR-FREE; THAT CONTENT, PRICES, AVAILABILITY OR PLANT INFORMATION IS ACCURATE, COMPLETE OR CURRENT; THAT ANY DESIGNER OUTPUT IS ACCURATE, REALISTIC OR ACHIEVABLE; OR THAT ANY PLANT WILL SURVIVE, THRIVE, GROW TO ANY SIZE, BLOOM AT ANY TIME, OR PERFORM IN YOUR CONDITIONS.</p>
        <p><strong>ANNIE&rsquo;S GIVES NO WRITTEN WARRANTY ON ANY PLANT.</strong> THE ARRIVAL INSPECTION AND RETURN POLICY IN OUR DELIVERY TERMS IS A RETURN AND REFUND POLICY, NOT A WARRANTY, AND DOES NOT WARRANT THAT ANY PLANT WILL SURVIVE OR PERFORM FOR ANY PERIOD.</p>
        <p>PLANTS ARE SOLD WITHOUT ANY GUARANTEE OF SURVIVAL OR PERFORMANCE.</p>
        <p style={{ fontWeight: 400, textTransform: "none" }}>
          Some states do not allow exclusion of certain implied warranties, so parts of this
          section may not apply to you. Nothing here limits any non-waivable right you have under
          applicable consumer protection law.
        </p>
      </>
    ),
  },
  {
    id: "s16",
    level: 2,
    heading: "16. Limitation of liability",
    blockquote: true,
    body: (
      <>
        <p>TO THE FULLEST EXTENT PERMITTED BY LAW:</p>
        <p><strong>(a)</strong> ANNIE&rsquo;S AND ITS MEMBERS, MANAGERS, EMPLOYEES, CONTRACTORS AND SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY OR PUNITIVE DAMAGES — INCLUDING LOST PROFITS, LOST DATA, LOSS OF GOODWILL, COST OF SUBSTITUTE GOODS, PROPERTY DAMAGE, DIMINUTION IN PROPERTY VALUE, LANDSCAPING OR HARDSCAPING COSTS, REMEDIATION COSTS, OR PERSONAL INJURY — ARISING OUT OF THE SITE, THE DESIGNER, ANY DESIGN OUTPUT, ANY PLANT, OR THESE TERMS, ON ANY THEORY, EVEN IF ADVISED OF THE POSSIBILITY.</p>
        <p><strong>(b)</strong> OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO AN ORDER WILL NOT EXCEED THE AMOUNT YOU PAID ANNIE&rsquo;S FOR THAT ORDER. FOR CLAIMS NOT RELATING TO A SPECIFIC ORDER, OUR TOTAL AGGREGATE LIABILITY WILL NOT EXCEED <strong>ONE HUNDRED DOLLARS ($100.00)</strong>.</p>
        <p><strong>(c)</strong> WE HAVE NO LIABILITY FOR ANY LOSS ARISING FROM YOUR USE OF, OR RELIANCE ON, OUTPUT GENERATED BY THE AI YARD DESIGNER.</p>
        <p><strong>(d)</strong> THESE LIMITATIONS APPLY EVEN IF A LIMITED REMEDY FAILS OF ITS ESSENTIAL PURPOSE.</p>
        <p style={{ fontWeight: 400, textTransform: "none" }}>
          Some states do not allow these exclusions, so parts may not apply to you.
          <strong> Nothing in these Terms excludes liability for death or personal injury caused by
          our negligence, for fraud, or for any other liability that cannot lawfully be
          excluded.</strong>
        </p>
      </>
    ),
  },
  {
    id: "s17",
    level: 2,
    heading: "17. Indemnification",
    body: (
      <p>
        You agree to defend, indemnify and hold harmless Annie&rsquo;s and its members, managers,
        employees and contractors from any claim, loss, liability, damage, cost or expense
        (including reasonable attorneys&rsquo; fees) arising from: your breach of these Terms; your
        violation of any law or third-party right; content you upload; your use of Designer output;
        your planting, siting or maintenance of plants you buy from us; and any injury or damage on
        your property in connection with delivery — <strong>except to the extent caused by our own
        negligence or willful misconduct.</strong>
      </p>
    ),
  },
  {
    id: "s18",
    level: 2,
    heading: "18. Force majeure",
    body: (
      <p>
        We are not liable for delay or failure caused by events beyond our reasonable control,
        including weather, drought, freeze, flood, fire, crop failure, disease or pest outbreak,
        quarantine or regulatory action, labor shortage, supply disruption, utility or network
        failure, or public health emergency. If such an event prevents delivery, we reschedule or
        refund.
      </p>
    ),
  },
  {
    id: "s19",
    level: 2,
    heading: "19. Governing law and disputes",
    body: (
      <>
        <p><strong>19.1 Governing law.</strong> Delaware law governs, without regard to conflict-of-laws principles. The CISG does not apply. <strong>Nothing in this Section deprives you of the protection of any mandatory consumer protection law of your state of residence.</strong></p>
        <p><strong>19.2 Talk to us first — required.</strong> Before filing, send a written <strong>Notice of Dispute</strong> to anniesonlinenursery@gmail.com (subject: &ldquo;Notice of Dispute&rdquo;) describing the problem, your order number, and what you want. We&rsquo;ll do the same before bringing a claim against you. <strong>Both parties agree to attempt good-faith resolution for 30 days.</strong> This is a condition precedent to suit, and the limitations period is tolled while it runs.</p>
        <p><strong>19.3 Small claims.</strong> Either party may bring an individual claim in small claims court in a county where you reside or in New Castle County, Delaware.</p>
        <p><strong>19.4 Venue and jury waiver.</strong> Otherwise, both parties consent to exclusive jurisdiction and venue in the <strong>state or federal courts in New Castle County, Delaware</strong>, and <strong>each party waives any right to trial by jury</strong> to the extent permitted by law.</p>
        <p><strong>19.6 Time limit.</strong> Any claim must be brought <strong>within one (1) year</strong> after it arose, or it is barred — except where a longer period is required by law and cannot be shortened by agreement.</p>
      </>
    ),
  },
  {
    id: "s19-5",
    level: 3,
    heading: "19.5 Class action waiver",
    blockquote: true,
    body: (
      <>
        <p>YOU AND ANNIE&rsquo;S AGREE THAT EACH MAY BRING CLAIMS ONLY IN AN INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS, COLLECTIVE, CONSOLIDATED OR REPRESENTATIVE PROCEEDING.</p>
        <p style={{ fontWeight: 400, textTransform: "none" }}>
          If this waiver is held unenforceable as to a particular claim, that claim is severed and
          proceeds individually in court; the remainder of this Section survives.
        </p>
      </>
    ),
  },
  {
    id: "s20",
    level: 2,
    heading: "20. New Jersey residents",
    body: (
      <>
        <p><strong>This Section applies only to New Jersey consumers and, as to them, overrides any conflicting provision.</strong></p>
        <p>
          New Jersey law — including the Truth-in-Consumer Contract, Warranty and Notice Act,
          N.J.S.A. 56:12-14 <em>et seq.</em> — limits the extent to which a seller may disclaim
          liability or waive consumer rights. Accordingly, for New Jersey consumers:
        </p>
        <ol>
          <li><strong>No provision of these Terms limits or waives any right or remedy New Jersey law makes non-waivable</strong>, and any provision that would do so is void <strong>as to New Jersey consumers only</strong>.</li>
          <li><strong>Sections 15 and 16 do not apply</strong> to the extent New Jersey law prohibits them, including as to claims for personal injury, death, or damages from negligent or intentional acts.</li>
          <li><strong>Section 17 does not apply</strong> to New Jersey consumers to the extent prohibited.</li>
          <li><strong>The one-year limitation in § 19.6 does not apply</strong> where New Jersey law provides a longer non-waivable period.</li>
          <li>Nothing limits your rights under the <strong>New Jersey Consumer Fraud Act</strong>, N.J.S.A. 56:8-1 <em>et seq.</em></li>
        </ol>
        <p>
          Where a provision is valid in some states but not New Jersey, <strong>it remains fully
          enforceable as to consumers in every other state.</strong> Similar carve-outs apply in
          any other state whose law makes a provision non-waivable, to the same limited extent.
        </p>
      </>
    ),
  },
  {
    id: "s21",
    level: 2,
    heading: "21. Acceptance",
    body: (
      <>
        <p>You accept these Terms by <strong>checking the acceptance box at checkout</strong>. The box is not pre-checked, and the text beside it states that checking it constitutes your agreement.</p>
        <p>
          <strong>We record the date, time, IP address and document version you accepted, and will
          provide that record on request.</strong> Superseded versions remain available at{" "}
          <Link href="/terms/v">/terms/v/[date]</Link>. <strong>The version in effect when you
          place an order governs that order.</strong>
        </p>
      </>
    ),
  },
  {
    id: "s22",
    level: 2,
    heading: "22. Copyright complaints (DMCA)",
    body: (
      <>
        <p>Notices under 17 U.S.C. § 512(c) to our designated agent:</p>
        <p>
          <strong>DMCA Agent, Annie&rsquo;s Online Nursery, LLC</strong>
          <br />
          {COMPANY_ADDRESS} · anniesonlinenursery@gmail.com
        </p>
        <p>
          Include: your signature; identification of the work; identification of the material and
          its location; your contact information; a good-faith belief statement; and a statement
          under penalty of perjury that the notice is accurate and you are authorized to act. We
          will respond, may remove material, and will terminate repeat infringers.
        </p>
      </>
    ),
  },
  {
    id: "s23",
    level: 2,
    heading: "23. Accessibility",
    body: (
      <p>
        We work toward conformance with <strong>WCAG 2.1 Level AA</strong>. If you have difficulty
        using any part of the Site, <strong>call (302) 757-5496 or email us and we will assist you
        directly and take your order by phone.</strong> We welcome reports of accessibility
        barriers. See our full <Link href="/accessibility">Accessibility statement</Link>.
      </p>
    ),
  },
  {
    id: "s24",
    level: 2,
    heading: "24. General",
    body: (
      <>
        <p><strong>Entire agreement.</strong> These Terms, the Privacy Policy and the Designer/Delivery Terms are the entire agreement regarding the Site.</p>
        <p><strong>Savings clause.</strong> Every limitation, disclaimer and waiver applies <strong>only to the fullest extent permitted by the law applicable to you.</strong> If a provision would be void under your state&rsquo;s law, it is limited to the maximum extent that law permits rather than struck, and remains fully enforceable as to consumers in every other state.</p>
        <p><strong>Severability.</strong> If any provision is unenforceable, it is modified minimally and the rest survives.</p>
        <p><strong>No waiver.</strong> Our failure to enforce is not a waiver.</p>
        <p><strong>Assignment.</strong> You may not assign. We may, in a merger, acquisition or asset sale.</p>
        <p><strong>Survival.</strong> Sections 13, 15, 16, 17, 19, 20, 22 and 24 survive termination.</p>
        <p><strong>Notices.</strong> We may give notice by email to the address on your order or by posting to the Site.</p>
      </>
    ),
  },
  {
    id: "s25",
    level: 2,
    heading: "25. Changes",
    body: (
      <p>
        We may revise these Terms. Changes take effect when posted with an updated date.
        <strong> Material changes will be announced on the Site and by email where we have your
        address.</strong>
      </p>
    ),
  },
  {
    id: "s26",
    level: 2,
    heading: "26. Contact",
    body: (
      <p>
        <strong>Annie&rsquo;s Online Nursery, LLC</strong>
        <br />
        anniesonlinenursery@gmail.com · (302) 757-5496
      </p>
    ),
  },
];
