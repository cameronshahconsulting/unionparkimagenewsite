/**
 * Version tags for the documents a customer/Designer user is asked to accept
 * (P0-8 clickwrap). Bump the relevant constant whenever that document's text
 * changes materially — the assent record captures whichever version was live
 * at the moment of acceptance, so "what did this customer agree to" stays
 * answerable forever, per Terms of Service § 21.
 *
 * All three documents are live (see lib/legal-content and app/terms,
 * app/privacy, app/designer-terms).
 */
export const TERMS_VERSION = "2.0";
export const PRIVACY_VERSION = "3.0";
export const DESIGNER_TERMS_VERSION = "1.0";
