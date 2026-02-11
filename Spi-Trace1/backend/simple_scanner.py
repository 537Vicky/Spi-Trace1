"""
Simple keyword scanner - just checks if keywords appear on a webpage
"""
import requests
from bs4 import BeautifulSoup
from typing import List, Tuple

def scan_url_for_keywords(url: str, keywords: List[str], timeout: int = 10) -> Tuple[bool, List[str]]:
    """
    Scan a single URL for keywords.
    
    Args:
        url: The URL to scan
        keywords: List of keywords to search for
        timeout: Request timeout in seconds
    
    Returns:
        (found, matched_keywords): Tuple of whether keywords were found and which ones
    """
    try:
        # Add http:// if not present
        if not url.startswith(('http://', 'https://')):
            url = 'http://' + url
        
        # Fetch the page
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=timeout, allow_redirects=True)
        response.raise_for_status()
        
        # Parse HTML and extract text
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text content
        page_text = soup.get_text(separator=' ', strip=True).lower()
        
        # Search for keywords
        matched = []
        for keyword in keywords:
            if keyword.lower() in page_text:
                matched.append(keyword)
        
        return len(matched) > 0, matched
        
    except requests.exceptions.Timeout:
        print(f"Timeout scanning {url}")
        return False, []
    except requests.exceptions.RequestException as e:
        print(f"Error scanning {url}: {str(e)}")
        return False, []
    except Exception as e:
        print(f"Unexpected error scanning {url}: {str(e)}")
        return False, []
