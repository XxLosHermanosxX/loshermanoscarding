import requests
import sys
import json
from datetime import datetime

class CardVaultAPITester:
    def __init__(self, base_url="https://card-organizer-3.preview.emergentagent.com"):
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

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'No message')}"
            self.log_test("API Root Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("API Root Endpoint", False, f"Error: {str(e)}")
            return False

    def test_get_cards(self):
        """Test GET /api/cards endpoint"""
        try:
            response = requests.get(f"{self.api_url}/cards", timeout=15)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                cards = response.json()
                details += f", Cards found: {len(cards)}"
                
                # Validate card structure if cards exist
                if cards and len(cards) > 0:
                    first_card = cards[0]
                    required_fields = ['id', 'card_number', 'expiry_month', 'expiry_year', 'cvv', 'cardholder_name']
                    missing_fields = [field for field in required_fields if field not in first_card]
                    
                    if missing_fields:
                        details += f", Missing fields: {missing_fields}"
                        success = False
                    else:
                        details += ", All required fields present"
                        
                        # Store first card ID for other tests
                        self.test_card_id = first_card.get('id')
                else:
                    details += ", No cards in database"
                    self.test_card_id = None
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Response: {response.text[:100]}"
                    
            self.log_test("GET /api/cards", success, details)
            return success, response.json() if success else []
            
        except Exception as e:
            self.log_test("GET /api/cards", False, f"Error: {str(e)}")
            return False, []

    def test_get_single_card(self, card_id):
        """Test GET /api/cards/{id} endpoint"""
        if not card_id:
            self.log_test("GET /api/cards/{id}", False, "No card ID available for testing")
            return False
            
        try:
            response = requests.get(f"{self.api_url}/cards/{card_id}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Card ID: {card_id}"
            
            if success:
                card = response.json()
                details += f", Cardholder: {card.get('cardholder_name', 'Unknown')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Response: {response.text[:100]}"
                    
            self.log_test("GET /api/cards/{id}", success, details)
            return success
            
        except Exception as e:
            self.log_test("GET /api/cards/{id}", False, f"Error: {str(e)}")
            return False

    def test_create_card(self):
        """Test POST /api/cards endpoint"""
        test_card = {
            "card_number": "4111111111111111",
            "expiry_month": "12",
            "expiry_year": "2025",
            "cvv": "123",
            "cardholder_name": "TEST USER API"
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/cards", 
                json=test_card,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                created_card = response.json()
                details += f", Created card ID: {created_card.get('id')}"
                self.created_card_id = created_card.get('id')
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Response: {response.text[:100]}"
                    
            self.log_test("POST /api/cards", success, details)
            return success
            
        except Exception as e:
            self.log_test("POST /api/cards", False, f"Error: {str(e)}")
            return False

    def test_update_card(self, card_id):
        """Test PUT /api/cards/{id} endpoint"""
        if not card_id:
            self.log_test("PUT /api/cards/{id}", False, "No card ID available for testing")
            return False
            
        update_data = {
            "cardholder_name": "UPDATED TEST USER"
        }
        
        try:
            response = requests.put(
                f"{self.api_url}/cards/{card_id}",
                json=update_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Card ID: {card_id}"
            
            if success:
                updated_card = response.json()
                details += f", Updated name: {updated_card.get('cardholder_name')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Response: {response.text[:100]}"
                    
            self.log_test("PUT /api/cards/{id}", success, details)
            return success
            
        except Exception as e:
            self.log_test("PUT /api/cards/{id}", False, f"Error: {str(e)}")
            return False

    def test_delete_card(self, card_id):
        """Test DELETE /api/cards/{id} endpoint"""
        if not card_id:
            self.log_test("DELETE /api/cards/{id}", False, "No card ID available for testing")
            return False
            
        try:
            response = requests.delete(f"{self.api_url}/cards/{card_id}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Card ID: {card_id}"
            
            if success:
                result = response.json()
                details += f", Message: {result.get('message', 'Deleted')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Response: {response.text[:100]}"
                    
            self.log_test("DELETE /api/cards/{id}", success, details)
            return success
            
        except Exception as e:
            self.log_test("DELETE /api/cards/{id}", False, f"Error: {str(e)}")
            return False

    def test_update_card_status(self, card_id):
        """Test PATCH /api/cards/{id}/status endpoint"""
        if not card_id:
            self.log_test("PATCH /api/cards/{id}/status", False, "No card ID available for testing")
            return False
            
        status_data = {
            "is_live": True,
            "tested_at": "Amazon Prime"
        }
        
        try:
            response = requests.patch(
                f"{self.api_url}/cards/{card_id}/status",
                json=status_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Card ID: {card_id}"
            
            if success:
                updated_card = response.json()
                details += f", is_live: {updated_card.get('is_live')}, tested_at: {updated_card.get('tested_at')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Response: {response.text[:100]}"
                    
            self.log_test("PATCH /api/cards/{id}/status", success, details)
            return success
            
        except Exception as e:
            self.log_test("PATCH /api/cards/{id}/status", False, f"Error: {str(e)}")
            return False

    def test_remove_duplicates(self):
        """Test DELETE /api/cards/duplicates endpoint"""
        try:
            response = requests.delete(f"{self.api_url}/cards/duplicates", timeout=15)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                result = response.json()
                details += f", Message: {result.get('message', 'No message')}, Removed: {result.get('removed', 0)}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Response: {response.text[:100]}"
                    
            self.log_test("DELETE /api/cards/duplicates", success, details)
            return success
            
        except Exception as e:
            self.log_test("DELETE /api/cards/duplicates", False, f"Error: {str(e)}")
            return False

    def test_bin_lookup(self):
        """Test GET /api/bin/{bin_number} endpoint"""
        test_bin = "411111"  # Visa test BIN
        
        try:
            response = requests.get(f"{self.api_url}/bin/{test_bin}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}, BIN: {test_bin}"
            
            if success:
                bin_info = response.json()
                details += f", Scheme: {bin_info.get('scheme', 'Unknown')}"
                if bin_info.get('bank'):
                    details += f", Bank: {bin_info.get('bank')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Response: {response.text[:100]}"
                    
            self.log_test("GET /api/bin/{bin_number}", success, details)
            return success
            
        except Exception as e:
            self.log_test("GET /api/bin/{bin_number}", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Card Vault API Tests...")
        print(f"🔗 Testing API at: {self.api_url}")
        print("=" * 60)
        
        # Test API availability
        if not self.test_api_root():
            print("❌ API root endpoint failed - stopping tests")
            return False
        
        # Test GET cards (main endpoint)
        success, cards = self.test_get_cards()
        if not success:
            print("❌ GET /api/cards failed - this is critical for the app")
            return False
        
        # Test single card retrieval if cards exist
        if hasattr(self, 'test_card_id') and self.test_card_id:
            self.test_get_single_card(self.test_card_id)
            # Test status update with existing card
            self.test_update_card_status(self.test_card_id)
        
        # Test CRUD operations
        if self.test_create_card():
            # Test update and delete with created card
            if hasattr(self, 'created_card_id'):
                self.test_update_card(self.created_card_id)
                # Test new status update endpoint
                self.test_update_card_status(self.created_card_id)
                self.test_delete_card(self.created_card_id)
        
        # Test new endpoints
        self.test_remove_duplicates()
        self.test_bin_lookup()
        
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed - check details above")
            return False

def main():
    tester = CardVaultAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
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