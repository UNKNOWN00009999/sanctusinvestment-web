# Licenses

The Sanctus Investment website. Everything it loads is served from this site; it makes no external font, script or tracking requests.

## Fonts (all SIL Open Font License 1.1)

| File in `fonts/` | Family | Copyright | Source |
|---|---|---|---|
| `bricolage-grotesque-vf.woff2` | Bricolage Grotesque (variable: opsz, wght, wdth) | Copyright 2022 The Bricolage Grotesque Project Authors (https://github.com/ateliertriay/bricolage) | https://github.com/google/fonts/tree/main/ofl/bricolagegrotesque |
| `geist-vf.woff2` | Geist (variable: wght) | Copyright 2024 The Geist Project Authors (https://github.com/vercel/geist-font.git) | https://github.com/google/fonts/tree/main/ofl/geist |
| `geist-mono-vf.woff2` | Geist Mono (variable: wght) | Copyright 2024 The Geist Project Authors (https://github.com/vercel/geist-font.git) | https://github.com/google/fonts/tree/main/ofl/geistmono |
| `noto-sans-greek-sub.woff2` | Noto Sans (subset: the five Greek letters of one word) | Copyright 2022 The Noto Project Authors (https://github.com/notofonts/latin-greek-cyrillic) | https://github.com/google/fonts/tree/main/ofl/notosans |
| `noto-sans-hebrew-sub.woff2` | Noto Sans Hebrew (subset: the letters of one word) | Copyright 2022 The Noto Project Authors (https://github.com/notofonts/hebrew) | https://github.com/google/fonts/tree/main/ofl/notosanshebrew |

The files were subset to the characters the site uses and converted to WOFF2 with fontTools (`_tools/assets.py`). The family names are unchanged. None of the families declares a Reserved Font Name in its license file.

The full license text shipped with each family is in `fonts/OFL-*.txt`.

- `fonts/pretendard-ko-sub.woff2`: Pretendard Medium, subset to the Hangul syllables of the name block. SIL Open Font License 1.1 (`fonts/OFL-Pretendard.txt`).

## Images

- `img/logo-script.webp`, `img/logo-full.webp`, `favicon*`, `apple-touch-icon.png`, `og-image.png`: the company's own logo.
- `img/logos*/`: portfolio-company and partner logos. They are the trademarks of their owners and are used only to identify those companies.
- The strategy pictograms on Investment > Strategy are inline SVG drawn for this site.

No generated images, stock photos or icon sets are used.

## Scripts

All scripts and stylesheets were written for this site. No third-party library is included.
