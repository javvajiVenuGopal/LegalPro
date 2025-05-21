import json
from channels.generic.websocket import AsyncWebsocketConsumer
from ..apps.users.models import User
from ..apps.cases.models import Message
from asgiref.sync import sync_to_async


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']  # this is now a user ID
        user1_id = self.scope['user'].id
        user2_id = self.room_name

        # Use sorted IDs to create a consistent room group name
        self.room_group_name = f"chat_{'_'.join(sorted([str(user1_id), str(user2_id)]))}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        case_id = data.get('case_id')

        # Validate message and case_id
        if not message:
            await self.send(text_data=json.dumps({'error': 'Message content is missing'}))
            return
        
        if not case_id:
            await self.send(text_data=json.dumps({'error': 'Missing case_id'}))
            return

        sender = self.scope['user']
        receiver = await self.get_receiver_user()

        if not receiver:
            await self.send(text_data=json.dumps({'error': 'Receiver not found'}))
            return

        try:
            # Save the message in the database
            await self.save_message(sender, receiver, message, case_id)
        except Case.DoesNotExist:
            await self.send(text_data=json.dumps({'error': 'Case not found'}))
            return

        # Send message to group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'sender': sender.username,
                'receiver': receiver.username,
                'message': message
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'sender': event['sender'],
            'receiver': event['receiver'],
            'message': event['message']
        }))

    @sync_to_async
    def get_receiver_user(self):
        try:
            return User.objects.get(id=int(self.room_name))
        except User.DoesNotExist:
            return None

    @sync_to_async
    def save_message(self, sender, receiver, message, case_id):
        from apps.cases.models import Case  # avoid circular import
        try:
            case = Case.objects.get(id=case_id)
            Message.objects.create(sender=sender, receiver=receiver, content=message, case=case)
        except Case.DoesNotExist:
            raise Case.DoesNotExist
