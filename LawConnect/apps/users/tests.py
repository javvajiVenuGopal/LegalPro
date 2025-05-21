from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class UserTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass', role='client')

    def test_user_created(self):
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.role, 'client')
