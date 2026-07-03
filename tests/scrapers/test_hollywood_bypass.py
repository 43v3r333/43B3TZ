# tests/scrapers/test_hollywood_bypass.py
import unittest
from backend.scrapers.hollywoodbets import HollywoodbetsScraper

class TestHollywoodBypass(unittest.TestCase):
    def setUp(self):
        self.scraper = HollywoodbetsScraper()

    def test_fetch_odds_with_bypass(self):
        # Force proxy usage for testing
        self.scraper.use_proxy = True
        self.scraper.proxy_pool = ["104.28.16.4:8080", "172.64.150.12:8080"]
        
        result = self.scraper.fetch_odds("event-999")
        self.assertIsNotNone(result)
        self.assertEqual(result["provider"], "Hollywoodbets")
        self.assertTrue(result["proxy_routed"])
        self.assertTrue(result["stealth_bypass"])
        self.assertIn("104.28.16.4:8080" or "172.64.150.12:8080", result["route_ip"])

if __name__ == "__main__":
    unittest.main()
