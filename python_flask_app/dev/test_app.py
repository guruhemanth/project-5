import pytest
from server_xorkeesign import app
from models import db


@pytest.fixture
def client():
    """Configures the Flask app for testing using an in-memory SQLite DB."""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['WTF_CSRF_ENABLED'] = False
    app._got_first_request = False

    with app.app_context():
        db.create_all()
        with app.test_client() as client:
            yield client
        db.drop_all()


# --- STAGE 3 TESTS ---

def test_login_page_get(client):
    """Test GET /login returns 200 OK."""
    response = client.get('/login')
    assert response.status_code == 200


def test_register_page_get(client):
    """Test GET /register returns 200 OK."""
    response = client.get('/register')
    assert response.status_code == 200


def test_user_registration_api(client):
    """Test POST /api/register creates user in DB."""
    payload = {
        "username": "testguru",
        "email": "guru@test.com",
        "password": "Password123!"
    }
    response = client.post('/api/register', json=payload)
    assert response.status_code == 201
    assert "registered successfully" in response.get_json()["message"]


def test_user_login_api_success(client):
    """Test POST /api/login with valid credentials."""
    # First register user
    client.post('/api/register', json={
        "username": "testguru",
        "email": "guru@test.com",
        "password": "Password123!"
    })
    # Then attempt login
    response = client.post('/api/login', json={
        "username": "testguru",
        "password": "Password123!"
    })
    assert response.status_code == 200
    assert response.get_json()["message"] == "Login successful"


def test_user_login_api_failure(client):
    """Test POST /api/login with invalid password returns 401."""
    response = client.post('/api/login', json={
        "username": "nonexistent",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Invalid" in response.get_json()["error"]
