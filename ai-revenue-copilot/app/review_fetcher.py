import requests
import os
import re
import json
from html.parser import HTMLParser

FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")

# Headers to mimic a real browser
BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}


class TextExtractor(HTMLParser):
    """Simple HTML parser that extracts visible text."""

    def __init__(self):
        super().__init__()
        self._texts = []
        self._skip = False
        self._skip_tags = {"script", "style", "noscript", "nav", "svg", "path", "head"}
        self._json_ld_blocks = []
        self._in_script = False
        self._script_attrs = {}

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag in self._skip_tags:
            self._skip = True
        if tag == "script":
            self._in_script = True
            self._script_attrs = attrs_dict

    def handle_endtag(self, tag):
        if tag in self._skip_tags:
            self._skip = False
        if tag == "script":
            self._in_script = False

    def handle_data(self, data):
        if self._in_script and self._script_attrs.get("type") == "application/ld+json":
            self._json_ld_blocks.append(data.strip())
        elif not self._skip:
            text = data.strip()
            if text:
                self._texts.append(text)

    def get_text(self):
        return "\n".join(self._texts)

    def get_json_ld(self):
        return self._json_ld_blocks


def _extract_reviews_from_json_ld(json_ld_blocks: list) -> list:
    """Extract review bodies from JSON-LD structured data (schema.org)."""
    reviews = []
    for block in json_ld_blocks:
        try:
            data = json.loads(block)
            # Handle single or array of schemas
            items = data if isinstance(data, list) else [data]
            for item in items:
                # Direct review objects
                if item.get("@type") == "Review" and item.get("reviewBody"):
                    reviews.append(item["reviewBody"])
                # Reviews nested in a Restaurant/LocalBusiness
                if "review" in item:
                    review_list = item["review"] if isinstance(item["review"], list) else [item["review"]]
                    for r in review_list:
                        body = r.get("reviewBody") or r.get("description") or ""
                        if len(body.strip()) > 20:
                            reviews.append(body.strip())
                # AggregateRating info as context
                if "aggregateRating" in item:
                    rating = item["aggregateRating"]
                    count = rating.get("reviewCount") or rating.get("ratingCount", 0)
                    value = rating.get("ratingValue", "N/A")
                    reviews.insert(0, f"Overall rating: {value}/5 based on {count} reviews")
        except (json.JSONDecodeError, TypeError):
            continue
    return reviews


def _extract_review_lines(raw_text: str):
    """Extract meaningful review-like lines from raw text."""
    lines = raw_text.split("\n")
    reviews = []

    for line in lines:
        line = line.strip()
        # Skip very short lines
        if len(line) < 40:
            continue
        # Skip lines that are just numbers, dates, or navigation
        if re.match(r"^[\d\s/\-:,\.]+$", line):
            continue
        # Skip common non-review patterns
        if re.match(r"^(copyright|©|follow us|download|sign in|log in|menu|home|about|terms|privacy|cookie)", line, re.IGNORECASE):
            continue
        reviews.append(line)

    return reviews[:50]


def _fetch_with_firecrawl(url: str):
    """Primary method: use Firecrawl API."""
    if not FIRECRAWL_API_KEY or FIRECRAWL_API_KEY == "your-firecrawl-api-key-here":
        return None

    try:
        response = requests.post(
            "https://api.firecrawl.dev/v1/scrape",
            headers={
                "Authorization": f"Bearer {FIRECRAWL_API_KEY}",
                "Content-Type": "application/json"
            },
            json={"url": url, "formats": ["markdown"]},
            timeout=30
        )

        if response.status_code != 200:
            print(f"[ReviewFetcher] Firecrawl returned {response.status_code}")
            return None

        content = response.json().get("data", {}).get("markdown", "")
        reviews = _extract_review_lines(content)
        return reviews if reviews else None

    except Exception as e:
        print(f"[ReviewFetcher] Firecrawl error: {e}")
        return None


def _fetch_direct(url: str):
    """Fallback: direct HTTP fetch with JSON-LD extraction + text fallback."""
    try:
        print(f"[ReviewFetcher] Direct fetch: {url}")

        session = requests.Session()
        response = session.get(url, headers=BROWSER_HEADERS, timeout=20, allow_redirects=True)

        print(f"[ReviewFetcher] Status: {response.status_code}, Size: {len(response.text)}")

        if response.status_code >= 400:
            # Try without the /reviews suffix
            base_url = re.sub(r"/reviews/?$", "", url)
            if base_url != url:
                print(f"[ReviewFetcher] Retrying base URL: {base_url}")
                response = session.get(base_url, headers=BROWSER_HEADERS, timeout=20, allow_redirects=True)
                print(f"[ReviewFetcher] Retry status: {response.status_code}")

        if response.status_code >= 400:
            return None

        # Parse HTML
        parser = TextExtractor()
        parser.feed(response.text)

        # Method A: Try JSON-LD structured data first (most reliable)
        json_ld_reviews = _extract_reviews_from_json_ld(parser.get_json_ld())
        if json_ld_reviews:
            print(f"[ReviewFetcher] JSON-LD: got {len(json_ld_reviews)} reviews")
            return json_ld_reviews[:50]

        # Method B: Extract from visible text
        raw_text = parser.get_text()
        reviews = _extract_review_lines(raw_text)

        if reviews:
            print(f"[ReviewFetcher] Text extraction: got {len(reviews)} review-like lines")
            return reviews

        return None

    except Exception as e:
        print(f"[ReviewFetcher] Direct fetch error: {e}")
        return None


def _get_demo_reviews():
    """Last resort: use built-in demo reviews so the system always returns data."""
    try:
        from .demo_reviews import DEMO_REVIEWS
        print("[ReviewFetcher] Using demo reviews as fallback")
        return DEMO_REVIEWS
    except ImportError:
        return []


def fetch_reviews(url: str):
    """
    Fetch reviews from a URL.
    Strategy:
      1. Try Firecrawl API (if key configured)
      2. Fallback to direct HTTP scrape (JSON-LD + text extraction)
      3. Last resort: use demo reviews so the system always works
    """
    # Method 1: Firecrawl
    result = _fetch_with_firecrawl(url)
    if result:
        print(f"[ReviewFetcher] Firecrawl: {len(result)} reviews")
        return result

    # Method 2: Direct scrape
    result = _fetch_direct(url)
    if result:
        print(f"[ReviewFetcher] Direct: {len(result)} reviews")
        return result

    # Method 3: Demo fallback (so the system always produces output)
    print("[ReviewFetcher] All methods failed — using demo reviews")
    return _get_demo_reviews()
