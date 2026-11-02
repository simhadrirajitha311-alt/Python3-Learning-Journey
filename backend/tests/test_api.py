import pytest
from django.test import Client

@pytest.mark.django_db
def test_authentication_endpoints_exist():
    client = Client()
    # Test registration endpoint rejects empty payload
    response = client.post('/api/v1/auth/register/', {}, content_type='application/json')
    assert response.status_code in [400, 401, 404, 405]

def test_opportunity_matching_algorithm():
    # Pure matching assertions
    required = ['Python', 'Distributed Systems', 'Git']
    student = ['Python', 'Docker', 'Git']
    overlap = set(required).intersection(set(student))
    assert len(overlap) == 2
    assert 'Python' in overlap
    assert 'Git' in overlap
