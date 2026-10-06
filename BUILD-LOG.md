# Nerbous — handoff

Date: 1 October 2026
Artist: **Nerbous** (verified name, this casing)
The site is no longer AK Ai LLC.
Logo: the gold machine-jellyfish print.
Shape: one page. A holding desk. Concept only. Not a store.

This file is the handoff. It records what is built, what is locked, and what the next thread must not do. Do not publish unless Commander says publish. Do not put buyer WAVs on Porkbun. Do not open Printify, Etsy, or the bank from this shell.

---

## 1. What this site is

A dark holding desk. The garment is an invisible upper body. The song is the mark on it. Nothing is for sale.

| Section | Anchor | Role |
|---|---|---|
| Header | — | Sticky. Mark “Nerbous”. Nav: Stage, Packs, Shelf. Hold reads “Not for sale”. |
| Mast | — | “Nerbous”. |
| Stage | `#stage` | Hoodie or tee shaped around an unseen torso. Hollow neck. No mannequin, no plaster, no box figure. Cloth colors: Ink, Bone, Brass, Forest. |
| Packs | `#packs` | Two cards under the stage. Third wraps. Concept only. No bag on the cards. |
| Shelf | `#shelf` | Three songs. Wire visualizer is SVG, not a canvas, so the page stays a website unfurl. It overlaps the rows and is not caged. |
| Player | fixed bottom | Compressed file only. Seek. Does not sell. |

There is no account system, no payment, no cart, and no checkout.

---

## 2. Locks

Pack A is a concept, not a listing.

| Pack | Price | Mark | Status |
|---|---|---|---|
| Jellyfish | $78 | The brand logo is the gold machine-jellyfish print. File: `public/brand-logo.jpg`. It is the header logo and the Jellyfish pack logo. It is not the garment print. The song cover is the cream poster, `public/jellyfish-cover.jpg`. Cover is not the logo and not cloth. | Concept locked |
| I'm Thinking | $75 | Brain / Nerbous | First print locked. Hoodie mock not approved |
| Deep Down | $72 | Jellyfish logo is off this print. The hoodie reads Deep Down, Nerbous. | Print updated. Heart draft is retired as a name |

Price band $72–78. A buyer would get hoodie + personal WAV + mp3. Not exclusive. File-only notes stay off the cards: lease $29, exclusive $249.

Public player file: `public/audio/jellyfish.m4a` (compressed). I'm Thinking and Deep Down stay on Wait — their public mp3s are not in this shell. Buyer WAVs are not in this project. Do not add them to `public/`.

Store covers are not cloth and are not on this page.

---

## 3. Files that own behavior

| Path | Owns |
|---|---|
| `src/routes/index.tsx` | Home route. Renders the studio. |
| `src/components/studio.tsx` | Stage, packs, shelf, player, visualizer. |
| `src/styles.css` | Tokens and layout. Phone reflow lives here. |
| `src/routes/__root.tsx` | Document shell. Do not strip the preview bridge or the branding injector. |
| `src/lib/og/site.json` | Share title `Nerbous`, custom card. Not a game. No `og:type`. |
| `public/og.jpg` | 1200×630 share card. Artwork only. Title stays in `site.json` because generated type kept rendering “AK AI”. |
| `public/favicon.svg` | Gold jellyfish on ink. |
| `public/brand-logo.jpg` | The logo. Gold machine-jellyfish from the print. Header and Jellyfish pack only. |
| `public/jellyfish-cover.jpg` | Jellyfish song cover. Not the logo. Not cloth. |
| `public/favicon.png` | Bell of the real logo. |
| `public/og.jpg` | Share card using the real logo, not a redraw. |
| `public/audio/jellyfish.m4a` | The only playable file. |
| `startup.sh` | Brings the preview back. Do not delete it. |

Auth is off. Database is off. Do not import `@/lib/db` or add sign-in.

---

## 4. Hosting

Not published. Not a Vercel app. This is a static folder.

The folder is `static-host/`. Upload that folder as the site root. It is `index.html`, the built CSS and JS, `brand-logo.jpg`, `jellyfish-cover.jpg`, the favicon, the share card, and `audio/jellyfish.m4a`. No server. Paths are root-absolute, so the folder has to be the host root, not a subpath.

Clicks were checked against that folder on its own: tee, bone, no console errors. The preview in this workspace is only for looking. It is not the thing to upload.

Do not publish this project. Do not put buyer WAVs in the folder. akai.llc is not this site.

---

## 5. Not done

Bank not open. Both signers. No Printify. No Etsy. No live domain. No Porkbun upload. Hoodie mock for I'm Thinking is not approved. Deep Down heart is a draft. I'm Thinking and Deep Down public audio are not in the shell.

---

## 6. Next thread

Read this file first. The upload is `static-host/`, zipped as `artifacts/AKAi-static.zip`. Edit `src/components/studio.tsx` and `src/styles.css` in place, then rebuild the static folder from the production HTML plus `public/` assets. Do not rebuild the mannequin. Do not put a bag on the pack cards. Do not publish, and do not upload WAVs, unless Commander writes that in the new thread.
