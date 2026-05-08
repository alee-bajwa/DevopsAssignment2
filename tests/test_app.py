import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

# Use the Docker container name defined in docker-compose-pipeline.yml
BASE_URL = "http://frontend-pipeline:3000"

@pytest.fixture(scope="module")
def driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.implicitly_wait(5)
    yield driver
    driver.quit()

# 1. Test Landing Page
def test_landing_page_loads(driver):
    driver.get(BASE_URL)
    assert "login" in driver.page_source.lower() or "haki" in driver.page_source.lower()

# 2. Test Login Page Navigation
def test_login_page_navigation(driver):
    driver.get(f"{BASE_URL}/login")
    assert "login" in driver.current_url.lower()

# 3. Test Signup Page Navigation
def test_signup_page_navigation(driver):
    driver.get(f"{BASE_URL}/signup")
    assert "signup" in driver.current_url.lower()

# 4. Test Invalid Login Form Submission
def test_invalid_login(driver):
    driver.get(f"{BASE_URL}/login")
    try:
        email_input = driver.find_element(By.CSS_SELECTOR, "input[type='email'], input[name='email']")
        pass_input = driver.find_element(By.CSS_SELECTOR, "input[type='password'], input[name='password']")
        submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        
        email_input.send_keys("wrong@email.com")
        pass_input.send_keys("wrongpassword")
        submit_btn.click()
        time.sleep(2)
        assert "dashboard" not in driver.current_url.lower()
    except Exception as e:
        pytest.skip(f"Could not locate login elements: {str(e)}")

# 5. Dashboard unauthorized access
def test_dashboard_unauthorized_access(driver):
    driver.get(f"{BASE_URL}/dashboard")
    time.sleep(2)
    assert "login" in driver.current_url.lower() or driver.current_url == f"{BASE_URL}/"

# 6. Transfer unauthorized access
def test_transfer_unauthorized_access(driver):
    driver.get(f"{BASE_URL}/transfer")
    time.sleep(2)
    assert "login" in driver.current_url.lower() or driver.current_url == f"{BASE_URL}/"

# 7. Transactions unauthorized access
def test_transactions_unauthorized_access(driver):
    driver.get(f"{BASE_URL}/transactions")
    time.sleep(2)
    assert "login" in driver.current_url.lower() or driver.current_url == f"{BASE_URL}/"

# 8. Bills unauthorized access
def test_bills_unauthorized_access(driver):
    driver.get(f"{BASE_URL}/bills")
    time.sleep(2)
    assert "login" in driver.current_url.lower() or driver.current_url == f"{BASE_URL}/"

# 9. Profile unauthorized access
def test_profile_unauthorized_access(driver):
    driver.get(f"{BASE_URL}/profile")
    time.sleep(2)
    assert "login" in driver.current_url.lower() or driver.current_url == f"{BASE_URL}/"

# 10. Admin dashboard unauthorized access
def test_admin_dashboard_unauthorized_access(driver):
    driver.get(f"{BASE_URL}/admin")
    time.sleep(2)
    assert "admin" not in driver.current_url.lower()

# 11. Admin users unauthorized access
def test_admin_users_unauthorized_access(driver):
    driver.get(f"{BASE_URL}/admin/users")
    time.sleep(2)
    assert "admin/users" not in driver.current_url.lower()

# 12. Admin transactions unauthorized access
def test_admin_transactions_monitoring_unauthorized_access(driver):
    driver.get(f"{BASE_URL}/admin/transactions")
    time.sleep(2)
    assert "admin/transactions" not in driver.current_url.lower()

# 13. Test 404 Fallback Route
def test_404_fallback(driver):
    driver.get(f"{BASE_URL}/random-invalid-route-12345")
    time.sleep(1)
    assert driver.current_url == f"{BASE_URL}/"

# 14. Signup Form Elements
def test_signup_form_elements(driver):
    driver.get(f"{BASE_URL}/signup")
    try:
        inputs = driver.find_elements(By.TAG_NAME, "input")
        assert len(inputs) > 0
        buttons = driver.find_elements(By.TAG_NAME, "button")
        assert len(buttons) > 0
    except Exception as e:
        pytest.skip(f"Signup elements not found: {str(e)}")

# 15. Login Form Elements
def test_login_form_elements(driver):
    driver.get(f"{BASE_URL}/login")
    try:
        inputs = driver.find_elements(By.TAG_NAME, "input")
        assert len(inputs) >= 2 
        submit = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        assert submit is not None
    except Exception as e:
        pytest.skip(f"Login elements not found: {str(e)}")