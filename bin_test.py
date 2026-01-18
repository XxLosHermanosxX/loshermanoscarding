import requests
import sys
import json
from datetime import datetime

class BinLookupTester:
    def __init__(self, base_url="https://carding-system.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")

    def test_bin_lookup_visa(self):
        """Test BIN lookup with Visa card (4111)"""
        try:
            response = requests.get(f"{self.api_url}/bin/4111", timeout=15)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                bin_info = response.json()
                details += f", Scheme: {bin_info.get('scheme', 'None')}"
                details += f", Type: {bin_info.get('type', 'None')}"
                details += f", Brand: {bin_info.get('brand', 'None')}"
                details += f", Country: {bin_info.get('country', 'None')}"
                
                # Check if we got meaningful data
                if bin_info.get('scheme') or bin_info.get('type') or bin_info.get('brand'):
                    details += " - BIN data retrieved successfully"
                else:
                    details += " - Empty BIN response (but endpoint works)"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Response: {response.text[:100]}"
                    
            self.log_test("GET /api/bin/4111 (Visa)", success, details)
            return success, response.json() if success else {}
            
        except Exception as e:
            self.log_test("GET /api/bin/4111 (Visa)", False, f"Error: {str(e)}")
            return False, {}

    def test_bin_lookup_mastercard(self):
        """Test BIN lookup with Mastercard (5555)"""
        try:
            response = requests.get(f"{self.api_url}/bin/5555", timeout=15)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                bin_info = response.json()
                details += f", Scheme: {bin_info.get('scheme', 'None')}"
                details += f", Type: {bin_info.get('type', 'None')}"
                details += f", Brand: {bin_info.get('brand', 'None')}"
                details += f", Country: {bin_info.get('country', 'None')}"
                
                # Check if we got meaningful data
                if bin_info.get('scheme') or bin_info.get('type') or bin_info.get('brand'):
                    details += " - BIN data retrieved successfully"
                else:
                    details += " - Empty BIN response (but endpoint works)"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Response: {response.text[:100]}"
                    
            self.log_test("GET /api/bin/5555 (Mastercard)", success, details)
            return success, response.json() if success else {}
            
        except Exception as e:
            self.log_test("GET /api/bin/5555 (Mastercard)", False, f"Error: {str(e)}")
            return False, {}

    def test_bin_lookup_invalid(self):
        """Test BIN lookup with invalid BIN"""
        try:
            response = requests.get(f"{self.api_url}/bin/0000", timeout=15)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                bin_info = response.json()
                # For invalid BIN, we should get empty response but still 200 status
                details += f", Response fields: {list(bin_info.keys())}"
                details += " - Invalid BIN handled gracefully"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Response: {response.text[:100]}"
                    
            self.log_test("GET /api/bin/0000 (Invalid)", success, details)
            return success
            
        except Exception as e:
            self.log_test("GET /api/bin/0000 (Invalid)", False, f"Error: {str(e)}")
            return False

    def test_bin_lookup_from_existing_card(self):
        """Test BIN lookup using BIN from existing card"""
        try:
            # First get a card to extract BIN
            cards_response = requests.get(f"{self.api_url}/cards", timeout=10)
            if cards_response.status_code != 200:
                self.log_test("BIN from existing card", False, "Could not fetch cards to get BIN")
                return False
                
            cards = cards_response.json()
            if not cards:
                self.log_test("BIN from existing card", False, "No cards available to extract BIN")
                return False
                
            # Extract BIN from first card
            first_card = cards[0]
            card_number = first_card.get('card_number', '').replace(' ', '')
            if len(card_number) < 6:
                self.log_test("BIN from existing card", False, "Card number too short to extract BIN")
                return False
                
            bin_number = card_number[:6]
            
            # Test BIN lookup
            response = requests.get(f"{self.api_url}/bin/{bin_number}", timeout=15)
            success = response.status_code == 200
            details = f"Status: {response.status_code}, BIN: {bin_number}"
            
            if success:
                bin_info = response.json()
                details += f", Scheme: {bin_info.get('scheme', 'None')}"
                details += f", Type: {bin_info.get('type', 'None')}"
                details += f", Brand: {bin_info.get('brand', 'None')}"
                details += f", Country: {bin_info.get('country', 'None')}"
                
                # Check if we got meaningful data
                if bin_info.get('scheme') or bin_info.get('type') or bin_info.get('brand'):
                    details += " - Real card BIN lookup successful"
                else:
                    details += " - Empty BIN response (but endpoint works)"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Response: {response.text[:100]}"
                    
            self.log_test(f"BIN from existing card ({bin_number})", success, details)
            return success
            
        except Exception as e:
            self.log_test("BIN from existing card", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all BIN lookup tests"""
        print("🔍 Starting BIN Lookup API Tests...")
        print(f"🔗 Testing API at: {self.api_url}")
        print("=" * 60)
        
        # Test various BIN lookups
        self.test_bin_lookup_visa()
        self.test_bin_lookup_mastercard()
        self.test_bin_lookup_invalid()
        self.test_bin_lookup_from_existing_card()
        
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All BIN lookup tests passed!")
            return True
        else:
            print("⚠️  Some BIN lookup tests failed - check details above")
            return False

def main():
    tester = BinLookupTester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/bin_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'success_rate': f"{(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%",
                'timestamp': datetime.now().isoformat()
            },
            'test_results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())