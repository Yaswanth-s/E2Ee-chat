import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, Conversation

class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        if user is None or user.is_anonymous:
            await self.close()
            return
        await self.accept()

    async def receive_json(self, content):
        action = content.get('action')
        if action == 'join':
            conv = content.get('conversation_id')
            group = f'conversation_{conv}'
            await self.channel_layer.group_add(group, self.channel_name)
            await self.send_json({'action':'joined','conversation_id':conv})
        elif action == 'leave':
            conv = content.get('conversation_id')
            group = f'conversation_{conv}'
            await self.channel_layer.group_discard(group, self.channel_name)
        elif action == 'send_message':
            conv = content.get('conversation_id')
            ciphertext = content.get('ciphertext')
            nonce = content.get('nonce')
            sender = self.scope['user']
            msg = await database_sync_to_async(Message.objects.create)(conversation_id=conv, sender=sender, ciphertext=ciphertext, nonce=nonce)
            payload = {
                'id': msg.id, 'conversation': conv, 'sender': sender.id,
                'ciphertext': ciphertext, 'nonce': nonce, 'created_at': str(msg.created_at)
            }
            await self.channel_layer.group_send(f'conversation_{conv}', {'type':'chat.message','message': payload})

    async def chat_message(self, event):
        await self.send_json({'action':'new_message','message': event['message']})
