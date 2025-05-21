from django.test import TestCase
from apps.users.models import User
from apps.cases.models import Case

class CaseTestCase(TestCase):
    def setUp(self):
        self.client_user = User.objects.create_user(username='clientuser', password='testpass', role='client')
        self.lawyer_user = User.objects.create_user(username='lawyeruser', password='testpass', role='lawyer')
        self.case = Case.objects.create(title='Case 1', description='Description of case 1', client=self.client_user, lawyer=self.lawyer_user)

    def test_case_creation(self):
        case = Case.objects.get(id=self.case.id)
        self.assertEqual(case.title, 'Case 1')
        self.assertEqual(case.client.username, 'clientuser')
        self.assertEqual(case.lawyer.username, 'lawyeruser')
