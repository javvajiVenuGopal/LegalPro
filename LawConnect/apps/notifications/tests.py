from django.test import TestCase
from apps.users.models import User
from .models import Notification

class NotificationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass', role='client')
        self.notification = Notification.objects.create(
            user=self.user,
            type='message',
            title='Test Notification',
            content='This is a test notification.'
        )

    def test_notification_created(self):
        self.assertEqual(Notification.objects.count(), 1)
        self.assertEqual(self.notification.title, 'Test Notification')
