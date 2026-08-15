/**
 * Privacy Policy — Version 3.0.
 *
 * Reconstructed from the source markdown the owner pasted in chat, which had
 * scattered dropped words/characters. Fixes are limited to restoring the
 * obviously-intended word (e.g. "anniesosery.com" → "anniesonlinenursery.com",
 * "buet" → "budget") — nothing substantive was added or removed.
 */

import Link from "next/link";
import { COMPANY_ADDRESS, NURSERY_LICENSE_LINE } from "@/lib/site-config";

export const PRIVACY_VERSION_INFO = { version: "3.0", effectiveDate: "2026-08-03" };

export const privacyIntro = (
  <>
    <strong>Quick links:</strong> Delete my data — email{" "}
    <a href="mailto:privacy@anniesonlinenursery.com">privacy@anniesonlinenursery.com</a> (see §
    11) · California and other US state residents — § 12 · Where we operate — § 13 · Do Not Sell
    or Share My Personal Information — § 6.3 and the footer link on every page.
  </>
);

export const privacySections = [
  {
    id: "p1",
    level: 2,
    heading: "1. Who we are",
    body: (
      <>
        <p>
          Annie&rsquo;s Online Nursery, LLC is a Delaware limited liability company at{" "}
          <strong>{COMPANY_ADDRESS}</strong>. {NURSERY_LICENSE_LINE}. We grow and deliver plants,
          garden kits and Christmas trees across Delaware, New Jersey, Pennsylvania and Maryland,
          and we operate anniesonlinenursery.com (the &ldquo;Site&rdquo;) and the AI Yard Designer
          (the &ldquo;Designer&rdquo;).
        </p>
        <p><strong>We are the controller</strong> of the personal information described in this policy.</p>
      </>
    ),
  },
  {
    id: "p1-1",
    level: 3,
    heading: "1.1 How to reach us about privacy",
    body: (
      <>
        <table>
          <tbody>
            <tr><td><strong>Privacy and data requests</strong></td><td><strong>privacy@anniesonlinenursery.com</strong></td></tr>
            <tr><td><strong>Deletion requests</strong></td><td><strong>privacy@anniesonlinenursery.com</strong> — subject line <strong>&ldquo;Delete My Data&rdquo;</strong></td></tr>
            <tr><td>General enquiries</td><td>anniesonlinenursery@gmail.com</td></tr>
            <tr><td>Phone</td><td>(302) 757-5496</td></tr>
            <tr><td>Post</td><td>Annie&rsquo;s Online Nursery, LLC<br />{COMPANY_ADDRESS}</td></tr>
          </tbody>
        </table>
        <p>
          <strong>privacy@anniesonlinenursery.com is monitored and is the fastest route for any
          request about your data.</strong> You may also phone or write to us; we will treat any
          request the same way regardless of how it reaches us.
        </p>
      </>
    ),
  },
  {
    id: "p2",
    level: 2,
    heading: "2. What we collect",
    body: null,
  },
  {
    id: "p2-1",
    level: 3,
    heading: "2.1 From you",
    body: (
      <table>
        <thead><tr><th>What</th><th>When</th><th>Why</th></tr></thead>
        <tbody>
          <tr><td>Email address</td><td>Designer verification, checkout, marketing signup</td><td>Verification codes, order updates, marketing if you opt in</td></tr>
          <tr><td>Name, delivery address, phone</td><td>Checkout</td><td>Fulfillment and delivery</td></tr>
          <tr><td>Delivery town or ZIP</td><td>Cart</td><td>Delivery fee and service-area check</td></tr>
          <tr><td>Access instructions</td><td>Checkout, scheduling</td><td>Finding your property, placing plants</td></tr>
          <tr><td><strong>Photographs of your property</strong></td><td>Designer upload</td><td>Generating your design</td></tr>
          <tr><td>Design preferences</td><td>Designer questionnaire</td><td>Style, sun, area, budget, free-text notes</td></tr>
          <tr><td>Installation requests</td><td>Cart checkbox</td><td>Passed to Union Park so they can quote</td></tr>
          <tr><td>Correspondence</td><td>Email, phone, text</td><td>Answering questions, resolving issues</td></tr>
        </tbody>
      </table>
    ),
  },
  {
    id: "p2-2",
    level: 3,
    heading: "2.2 Automatically",
    body: (
      <>
        <p>
          IP address and approximate location derived from it; browser, operating system and device
          type; pages viewed and links clicked; referring page; timestamps; error and performance
          diagnostics.
        </p>
        <p>
          <strong>Current status.</strong> As of this version, <strong>the Site runs no
          third-party analytics or advertising trackers and sets no cookies of its own.</strong>{" "}
          Our checkout provider sets its own. We describe advertising practices in § 6.3 because we
          expect to add measurement tools; we will update the date above and give notice before we
          do.
        </p>
      </>
    ),
  },
  {
    id: "p2-3",
    level: 3,
    heading: "2.3 On your device",
    body: (
      <>
        <p>
          The cart and Designer store data in your browser&rsquo;s <strong>local storage</strong>,
          not cookies: cart contents, generated designs and most recent design ID, the email used
          for Designer verification, and a verification flag. This is strictly necessary for those
          features to work.
        </p>
        <p>
          It remains until you clear browser storage. <strong>Because your email is stored
          locally, anyone with access to your device and browser can see it.</strong>
        </p>
      </>
    ),
  },
  {
    id: "p2-4",
    level: 3,
    heading: "2.4 From others",
    body: (
      <p>
        <strong>Shopify</strong> — order details, fulfillment status, limited contact information.{" "}
        <strong>Union Park Landscaping</strong> — whether an installation completed, so we can
        issue your credit. <strong>Payment processors</strong> — confirmation of success or
        failure. We never receive your card number.
      </p>
    ),
  },
  {
    id: "p2-5",
    level: 3,
    heading: "2.5 What we do not collect",
    body: (
      <>
        <p>
          We do not knowingly collect government identifiers, financial account numbers, precise
          geolocation, biometric identifiers, health information, racial or ethnic origin, religious
          or philosophical beliefs, trade union membership, sex life or sexual orientation data, or
          criminal offence data.
        </p>
        <p>
          <strong>We do not use photographs you upload for facial recognition or any biometric
          identification purpose.</strong>
        </p>
      </>
    ),
  },
  {
    id: "p3",
    level: 2,
    heading: "3. Your Designer photographs",
    body: (
      <>
        <p>Because the Designer asks you to photograph your home, we want to be specific.</p>
        <p>
          <strong>What we do with it.</strong> We transmit it to an artificial intelligence
          provider, which processes it to produce rendered images and plant recommendations. We
          store the original photograph, generated images, your answers and the resulting plant
          list on our servers so the design can be retrieved and shared.
        </p>
        <p><strong>How long.</strong> Up to <strong>24 months</strong>, or until you ask us to delete it — whichever comes first.</p>
        <p>
          <strong>Who can see it.</strong> Each design has a randomly generated identifier.{" "}
          <strong>Anyone holding that identifier — someone you sent a link to, or anyone they
          forward it to — can view the design and your photograph. Share links are unlisted, not
          private.</strong> Don&rsquo;t upload anything you wouldn&rsquo;t want a recipient to see:
          visible house numbers, license plates, people, or interiors visible through windows.
        </p>
        <p><strong>Marketing use.</strong> See § 6.4, including how to opt out.</p>
        <p>
          <strong>Please don&rsquo;t upload</strong> photographs of other people without their
          permission, of property you don&rsquo;t own or occupy, or containing sensitive personal
          information.
        </p>
        <p>
          <strong>Automated processing.</strong> The Designer generates suggestions automatically.{" "}
          <strong>It does not make any decision that produces legal or similarly significant
          effects concerning you.</strong> It does not price differently by person, assess
          creditworthiness, or determine whether we will serve you. It suggests plants.
        </p>
      </>
    ),
  },
  {
    id: "p4",
    level: 2,
    heading: "4. Checkout",
    body: (
      <p>
        Checkout runs on <strong>Shopify&rsquo;s</strong> hosted pages, not ours. Shopify collects
        payment details directly; <strong>card numbers, CVV codes and wallet credentials are never
        transmitted to or stored by us.</strong> Shopify sets its own cookies and applies its own
        privacy policy. We receive the order record, not your payment credentials.
      </p>
    ),
  },
  {
    id: "p5",
    level: 2,
    heading: "5. Purposes and legal bases",
    body: (
      <>
        <p>For every processing activity, here is why we do it and what justifies it.</p>
        <table>
          <thead><tr><th>What we do</th><th>Why</th><th>Basis</th></tr></thead>
          <tbody>
            <tr><td>Process and deliver your order</td><td>To perform our contract with you</td><td><strong>Contract</strong></td></tr>
            <tr><td>Calculate delivery fees, verify service area</td><td>To perform our contract</td><td><strong>Contract</strong></td></tr>
            <tr><td>Send order, delivery and service emails</td><td>To perform our contract</td><td><strong>Contract</strong></td></tr>
            <tr><td>Generate your garden design from your photograph</td><td>Because you asked us to</td><td><strong>Your consent</strong></td></tr>
            <tr><td>Verify your email, enforce Designer usage limits</td><td>Preventing abuse of a free service</td><td><strong>Our legitimate interest</strong></td></tr>
            <tr><td>Retain order and tax records</td><td>Legal record-keeping duties</td><td><strong>Legal obligation</strong></td></tr>
            <tr><td>Nursery certification and delivery documentation</td><td>Delaware nursery law (3 Del. C. ch. 13)</td><td><strong>Legal obligation</strong></td></tr>
            <tr><td>Detect fraud, secure the Site</td><td>Protecting our business and customers</td><td><strong>Our legitimate interest</strong></td></tr>
            <tr><td>Pass installation requests to Union Park</td><td>Because you asked us to</td><td><strong>Your consent</strong></td></tr>
            <tr><td>Marketing email and SMS</td><td>Because you opted in</td><td><strong>Your consent</strong></td></tr>
            <tr><td>Targeted advertising and audience matching</td><td>Because you opted in</td><td><strong>Your consent</strong></td></tr>
            <tr><td>Use your photographs in our marketing</td><td>Because you agreed and can opt out</td><td><strong>Your consent</strong></td></tr>
            <tr><td>Defend legal claims</td><td>Establishing or defending legal rights</td><td><strong>Our legitimate interest</strong></td></tr>
          </tbody>
        </table>
        <p>
          <strong>Where we rely on a legitimate interest</strong>, we have considered whether it is
          outweighed by your rights and concluded it is not, because the processing is limited,
          expected and low-risk. <strong>You may object at any time</strong> — email
          privacy@anniesonlinenursery.com.
        </p>
        <p>
          <strong>Where we rely on your consent, you may withdraw it at any time</strong>, and
          withdrawal does not affect processing already carried out.
        </p>
        <p>
          <strong>Providing your delivery details is necessary to form a contract with us.</strong>{" "}
          If you don&rsquo;t provide them we can&rsquo;t deliver. Everything else — Designer
          photographs, marketing consent — is entirely optional.
        </p>
      </>
    ),
  },
  {
    id: "p6",
    level: 2,
    heading: "6. How we use information",
    body: null,
  },
  {
    id: "p6-1",
    level: 3,
    heading: "6.1 Operations",
    body: (
      <p>
        Processing, scheduling and delivering orders; calculating delivery fees; generating
        designs; verifying email and enforcing Designer limits; answering questions and handling
        returns; passing installation requests to Union Park and tracking credits; accounting and
        tax records; nursery inspection and phytosanitary documentation; fraud detection; site
        security.
      </p>
    ),
  },
  {
    id: "p6-2",
    level: 3,
    heading: "6.2 Marketing email",
    body: (
      <>
        <p>
          If you <strong>opt in</strong>, we may send newsletters, seasonal offers, plant care tips,
          restock notices and Christmas tree reminders. We use purchase and browsing history to
          choose what to send.
        </p>
        <p>
          <strong>Every marketing email includes an unsubscribe link and our physical postal
          address, and we honor unsubscribes promptly.</strong> Unsubscribing does not stop
          transactional messages — order confirmations, delivery scheduling, verification codes —
          which you need to complete a purchase.
        </p>
      </>
    ),
  },
  {
    id: "p6-3",
    level: 3,
    heading: "6.3 Advertising",
    body: (
      <>
        <p>
          We may use your information, including a hashed email address, for analytics and
          measurement, custom audiences, retargeting, and lookalike audiences.
        </p>
        <p>
          Under several US state privacy laws some of this is defined as <strong>&ldquo;sharing&rdquo;
          or &ldquo;selling&rdquo; for targeted advertising</strong>, even with no money changing
          hands. <strong>You can opt out at any time:</strong>
        </p>
        <ul>
          <li>The <strong>&ldquo;Do Not Sell or Share My Personal Information&rdquo;</strong> link in the footer of every page</li>
          <li>Enabling <strong>Global Privacy Control</strong> in your browser — we honor it</li>
          <li>Emailing <strong>privacy@anniesonlinenursery.com</strong>, subject &ldquo;Opt Out&rdquo;</li>
        </ul>
        <p>
          <strong>We do not sell personal information for money, and we do not sell or share the
          personal information of anyone we know to be under 16.</strong>
        </p>
      </>
    ),
  },
  {
    id: "p6-4",
    level: 3,
    heading: "6.4 Photographs in marketing",
    body: (
      <>
        <p>
          By uploading a photograph or placing an order, you grant Annie&rsquo;s a non-exclusive,
          worldwide, royalty-free license to use, reproduce, adapt and display the photographs you
          upload, the designs generated from them, and photographs our team takes at delivery,{" "}
          <strong>to promote Annie&rsquo;s Online Nursery.</strong>
        </p>
        <p>
          <strong>We will not publish an image in which your house number, street sign or license
          plate is legible, and we will not identify you by full name or street address without
          asking first.</strong>
        </p>
        <p>
          <strong>To opt out:</strong> email <strong>privacy@anniesonlinenursery.com</strong>,
          subject <strong>&ldquo;Photo opt-out.&rdquo;</strong> We stop using your images going
          forward and remove them from channels we control. We cannot recall material already
          printed, reshared by others, or cached by search engines.
        </p>
      </>
    ),
  },
  {
    id: "p6-5",
    level: 3,
    heading: "6.5 Other",
    body: (
      <p>
        As needed to comply with law, respond to lawful requests, enforce our Terms, protect rights
        and safety, and in connection with a merger, acquisition or asset sale.
      </p>
    ),
  },
  {
    id: "p7",
    level: 2,
    heading: "7. Who we share with",
    body: (
      <>
        <p><strong>We do not sell your personal information for money.</strong></p>
        <table>
          <thead><tr><th>Recipient</th><th>What they get</th><th>Why</th></tr></thead>
          <tbody>
            <tr><td><strong>Shopify</strong></td><td>Order and contact details, payment processing</td><td>Checkout and order management</td></tr>
            <tr><td><strong>Email service provider</strong></td><td>Email address, message content</td><td>Verification codes, order emails, newsletters</td></tr>
            <tr><td><strong>Hosting and cloud storage</strong></td><td>All stored data</td><td>Running the Site</td></tr>
            <tr><td><strong>AI model provider</strong></td><td>Your uploaded photograph, design preferences</td><td>Generating your design</td></tr>
            <tr><td><strong>Union Park Landscaping</strong></td><td>Name, address, phone, email, order contents</td><td>Installation quotes, if you request one</td></tr>
            <tr><td><strong>Advertising platforms</strong></td><td>Hashed email, activity data</td><td>Only if you opt in — § 6.3</td></tr>
          </tbody>
        </table>
        <p>Service providers may use your information <strong>only to perform services for us.</strong></p>
        <p>
          <strong>Union Park is an independent company, not our agent.</strong> Their handling of
          your information is governed by their own practices, not this policy.
        </p>
        <p>
          <strong>Legal and safety</strong> — subpoenas, court orders, legal process; investigating
          fraud or Terms violations; protecting rights, property or safety.
        </p>
        <p>
          <strong>Business transfers</strong> — if Annie&rsquo;s is acquired or sells substantially
          all assets. We&rsquo;ll notify you if your information becomes subject to a materially
          different policy.
        </p>
        <p>
          <strong>At your direction</strong> — sharing a design link discloses that design and its
          photograph to whoever receives it.
        </p>
      </>
    ),
  },
  {
    id: "p8",
    level: 2,
    heading: "8. Cookies and tracking",
    body: (
      <>
        <p>
          <strong>Local storage</strong> (§ 2.3) is strictly necessary for the cart and Designer and
          cannot be disabled without breaking them.
        </p>
        <p>
          <strong>Cookies.</strong> We currently set none. Shopify sets cookies on its checkout
          pages. <strong>If we add analytics or advertising cookies, we will implement a consent
          banner and obtain consent before setting any non-essential cookie where consent is
          required.</strong>
        </p>
        <p>
          <strong>Browser controls.</strong> Blocking or clearing storage will empty your cart and
          remove saved designs from that device.
        </p>
        <p>
          <strong>Global Privacy Control.</strong> We honor GPC as a valid opt-out of sale and
          sharing for targeted advertising. <strong>Do Not Track.</strong> No common standard
          exists; we do not respond to DNT separately from GPC.
        </p>
      </>
    ),
  },
  {
    id: "p9",
    level: 2,
    heading: "9. How long we keep things",
    body: (
      <>
        <table>
          <thead><tr><th>Category</th><th>Retention</th><th>Why</th></tr></thead>
          <tbody>
            <tr><td>Order and transaction records</td><td><strong>7 years</strong></td><td>Tax and accounting obligations</td></tr>
            <tr><td>Nursery certification and delivery records</td><td><strong>3 years</strong></td><td>Delaware nursery law</td></tr>
            <tr><td>Designs, uploaded photographs, generated images</td><td><strong>24 months</strong>, or until you ask us to delete</td><td>Letting you revisit designs</td></tr>
            <tr><td>Delivery photographs</td><td><strong>24 months</strong></td><td>Record of condition at handoff</td></tr>
            <tr><td>Marketing list membership</td><td>Until you unsubscribe, plus a permanent suppression record</td><td>So we never re-add you</td></tr>
            <tr><td>Email verification records and usage counts</td><td><strong>12 months</strong></td><td>Enforcing Designer limits</td></tr>
            <tr><td>Customer service correspondence</td><td><strong>3 years</strong></td><td>Resolving disputes</td></tr>
            <tr><td>Site logs and diagnostics</td><td><strong>12 months</strong></td><td>Security and troubleshooting</td></tr>
          </tbody>
        </table>
        <p>
          We may keep information longer where required by law or needed to resolve an active
          dispute. <strong>When a retention period ends, we delete or irreversibly anonymise the
          data.</strong>
        </p>
      </>
    ),
  },
  {
    id: "p10",
    level: 2,
    heading: "10. Security",
    body: (
      <>
        <p>
          HTTPS across the Site; access limited to what a role requires; reliance on established
          platforms — Shopify for payments, reputable cloud providers for hosting — rather than
          building sensitive systems ourselves. <strong>We do not store payment card numbers.</strong>
        </p>
        <p>
          <strong>No system is perfectly secure</strong>, and we can&rsquo;t guarantee that
          unauthorized parties will never defeat our safeguards. Be thoughtful about what appears in
          photographs you upload.
        </p>
        <p>
          If we become aware of a personal data breach, we will notify affected individuals and any
          required regulators within the timeframes the law requires.
        </p>
      </>
    ),
  },
  {
    id: "p11",
    level: 2,
    heading: "11. Deleting your data — anyone, anywhere",
    blockquote: true,
    body: (
      <p style={{ fontWeight: 700 }}>
        To have your data deleted, email privacy@anniesonlinenursery.com with the subject line
        &ldquo;Delete My Data.&rdquo;
      </p>
    ),
  },
  {
    id: "p11-cont",
    level: 3,
    heading: "What happens next",
    body: (
      <>
        <p>
          <strong>This is available to everyone, regardless of where you live or which law applies
          to you.</strong> You do not need to explain why.
        </p>
        <p>
          <strong>Tell us what to delete.</strong> If you want a specific design removed, include
          the design link or ID. If you want everything, say so.
        </p>
        <table>
          <thead><tr><th>Request</th><th>We respond within</th></tr></thead>
          <tbody>
            <tr><td>Delete a design and its source photograph</td><td><strong>10 business days</strong></td></tr>
            <tr><td>Delete your other personal information</td><td><strong>30 days</strong></td></tr>
            <tr><td>Opt out of photo marketing use</td><td><strong>5 business days</strong></td></tr>
            <tr><td>Access, correct or export your data</td><td><strong>30 days</strong></td></tr>
          </tbody>
        </table>
        <p>
          <strong>What we cannot delete, and why.</strong> Order and transaction records
          we&rsquo;re legally required to keep (§ 9), nursery certification records, and
          information needed to resolve an open dispute or complete a pending delivery.{" "}
          <strong>We will tell you specifically what we retained and the reason.</strong> Everything
          else goes.
        </p>
        <p>
          <strong>How we verify you.</strong> We confirm you control the email address associated
          with your orders or designs — usually by replying to a message sent to it. We will not
          ask for more information than necessary, and we will not create an account or collect new
          data just to verify a deletion request.
        </p>
        <p>
          <strong>No charge</strong>, unless a request is manifestly unfounded or excessive, in
          which case we will tell you before doing anything.
        </p>
        <p>
          <strong>No penalty.</strong> We will not refuse service, charge different prices, or
          provide lower quality service because you exercised a privacy right.
        </p>
      </>
    ),
  },
  {
    id: "p12",
    level: 2,
    heading: "12. California residents",
    body: (
      <p>
        This section supplements the rest of this policy for California residents and uses terms
        defined in the California Consumer Privacy Act as amended by the CPRA.
      </p>
    ),
  },
  {
    id: "p12-1",
    level: 3,
    heading: "12.1 Notice at collection",
    body: (
      <>
        <p>In the preceding 12 months we collected the following categories:</p>
        <table>
          <thead><tr><th>CCPA category</th><th>Collected?</th><th>Source</th><th>Purpose</th><th>Disclosed to</th></tr></thead>
          <tbody>
            <tr><td><strong>Identifiers</strong> (name, email, postal address, phone, IP)</td><td>Yes</td><td>You; automatically</td><td>Orders, delivery, service, marketing</td><td>Shopify, email provider, hosting, Union Park (on request)</td></tr>
            <tr><td><strong>Customer records</strong> (Civ. Code § 1798.80)</td><td>Yes</td><td>You</td><td>Orders and delivery</td><td>Shopify, hosting</td></tr>
            <tr><td><strong>Commercial information</strong> (purchases, carts)</td><td>Yes</td><td>You</td><td>Fulfillment, service, marketing</td><td>Shopify, hosting</td></tr>
            <tr><td><strong>Internet or network activity</strong></td><td>Yes</td><td>Automatically</td><td>Security, troubleshooting, analytics if enabled</td><td>Hosting; ad platforms only if you opt in</td></tr>
            <tr><td><strong>Geolocation</strong> (approximate, from IP or delivery town)</td><td>Yes</td><td>You; automatically</td><td>Service-area and delivery fee</td><td>Hosting</td></tr>
            <tr><td><strong>Visual information</strong> (uploaded and delivery photographs)</td><td>Yes</td><td>You; our drivers</td><td>Generating designs; proof of condition; marketing if not opted out</td><td>AI provider, hosting</td></tr>
            <tr><td><strong>Inferences</strong> (product and style preferences)</td><td>Yes</td><td>Derived</td><td>Selecting products and offers</td><td>Hosting; ad platforms only if you opt in</td></tr>
            <tr><td><strong>Sensitive personal information</strong></td><td><strong>No</strong></td><td>—</td><td>—</td><td>—</td></tr>
          </tbody>
        </table>
        <p>
          <strong>We do not collect sensitive personal information as defined by §
          1798.140(ae).</strong> Because we collect none, the right to limit its use and disclosure
          does not arise.
        </p>
        <p>
          <strong>Retention</strong> is set out in § 9. We do not retain any category longer than
          stated there.
        </p>
      </>
    ),
  },
  {
    id: "p12-2",
    level: 3,
    heading: "12.2 Sale and sharing",
    body: (
      <>
        <p>
          <strong>We have not sold personal information for monetary consideration in the preceding
          12 months.</strong>
        </p>
        <p>
          If and when we enable advertising measurement, disclosing identifiers and internet
          activity to advertising platforms may constitute <strong>&ldquo;sharing&rdquo; for
          cross-context behavioral advertising</strong> under § 1798.140(ah). <strong>You may opt
          out at any time</strong> via the footer link, Global Privacy Control, or{" "}
          <strong>privacy@anniesonlinenursery.com</strong>.
        </p>
        <p>
          <strong>We do not sell or share the personal information of consumers we know to be under
          16</strong> (§ 1798.120(c)).
        </p>
      </>
    ),
  },
  {
    id: "p12-3",
    level: 3,
    heading: "12.3 Your California rights",
    body: (
      <>
        <ul>
          <li><strong>Know / access</strong> what we collected, sources, purposes, and categories of recipients (§§ 1798.100, .110, .115)</li>
          <li><strong>Delete</strong> personal information we hold (§ 1798.105) — see § 11</li>
          <li><strong>Correct</strong> inaccurate personal information (§ 1798.106)</li>
          <li><strong>Portability</strong> — a copy in a readily usable format (§ 1798.100)</li>
          <li><strong>Opt out</strong> of sale or sharing (§ 1798.120)</li>
          <li><strong>Limit</strong> use of sensitive personal information (§ 1798.121) — not applicable; we collect none</li>
          <li><strong>Non-discrimination</strong> (§ 1798.125)</li>
        </ul>
        <p>
          <strong>How.</strong> Email <strong>privacy@anniesonlinenursery.com</strong> or call{" "}
          <strong>(302) 757-5496</strong>. We respond within 45 days, extendable once by a further
          45 days if we tell you why.
        </p>
        <p><strong>Authorized agents</strong> may submit requests with written authorization; we may ask you to verify directly.</p>
        <p>
          <strong>Appeals.</strong> If we deny a request, reply with subject &ldquo;Privacy
          Appeal.&rdquo; We respond within 45 days. You may also contact the California Privacy
          Protection Agency or the California Attorney General.
        </p>
      </>
    ),
  },
  {
    id: "p12-4",
    level: 3,
    heading: "12.4 Other US states",
    body: (
      <p>
        Residents of <strong>Delaware, Virginia, Colorado, Connecticut</strong> and other states
        with comprehensive privacy laws have broadly similar rights — access, deletion, correction,
        portability, opt-out of targeted advertising, and appeal. <strong>We extend all of the
        rights in this section to residents of every US state</strong>, whether or not the relevant
        statute applies to us. Use the same address: <strong>privacy@anniesonlinenursery.com</strong>.
      </p>
    ),
  },
  {
    id: "p13",
    level: 2,
    heading: "13. Where we operate",
    body: (
      <>
        <p>
          <strong>Annie&rsquo;s is a local business serving Delaware, New Jersey, Pennsylvania and
          Maryland.</strong> All data is stored and processed in the United States.
        </p>
        <p>
          <strong>We do not offer goods or services in the United Kingdom, the European Economic
          Area or Switzerland.</strong> We do not accept orders from those regions, we price only
          in US dollars, we ship nowhere, and we do not track or monitor the behaviour of anyone
          located there.
        </p>
        <p>
          <strong>The AI Yard Designer is limited to our service area and is not available in the
          UK, EEA or Switzerland.</strong> Visitors from those regions are shown a notice instead
          of the tool.
        </p>
        <p>
          <strong>If you are in the UK or EEA and believe we hold personal data about you</strong>{" "}
          — for example because you used the Designer before this restriction took effect —{" "}
          <strong>email privacy@anniesonlinenursery.com and we will delete it.</strong> You do not
          need to explain why, and we will confirm when it is done.
        </p>
        <p>
          If we ever begin offering goods or services in those regions, we will update this policy,
          appoint a representative where one is required, and give notice before doing so.
        </p>
      </>
    ),
  },
  {
    id: "p14",
    level: 2,
    heading: "14. Children",
    body: (
      <p>
        The Site and Designer are for adults. We do not knowingly collect information from anyone
        under 16, and children under 13 may not use the Site. If you believe a child has provided us
        information, email <strong>privacy@anniesonlinenursery.com</strong> and we will delete it
        promptly.
        <br />
        <strong>We ask parents not to let children upload photographs through the Designer.</strong>
      </p>
    ),
  },
  {
    id: "p15",
    level: 2,
    heading: "15. Third-party links",
    body: (
      <p>
        The Site links to third parties including Shopify&rsquo;s checkout and Union Park
        Landscaping. This policy does not apply to them.
      </p>
    ),
  },
  {
    id: "p16",
    level: 2,
    heading: "16. Changes",
    body: (
      <p>
        We may update this policy and will change the date above. <strong>If changes are material
        — for example, if we begin sharing information for targeted advertising, add tracking
        cookies, or extend how long we keep photographs — we will give notice on the Site and,
        where we have your email address, by email.</strong> Superseded versions remain available
        at <Link href="/privacy/v">/privacy/v/[date]</Link>.
      </p>
    ),
  },
  {
    id: "p17",
    level: 2,
    heading: "17. Contact",
    body: (
      <>
        <p><strong>Annie&rsquo;s Online Nursery, LLC</strong></p>
        <table>
          <tbody>
            <tr><td><strong>Privacy, data and deletion requests</strong></td><td><strong>privacy@anniesonlinenursery.com</strong></td></tr>
            <tr><td>General enquiries</td><td>anniesonlinenursery@gmail.com · (302) 757-5496</td></tr>
          </tbody>
        </table>
      </>
    ),
  },
];
