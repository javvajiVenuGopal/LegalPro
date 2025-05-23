from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from . import consumers
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'LawConnect.settings')
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path('ws/chat/<int:room_name>/', consumers.ChatConsumer.as_asgi()),
        ])
    ),
})