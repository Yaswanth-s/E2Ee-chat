from rest_framework import serializers
from .models import Conversation, Message
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer
User = get_user_model()

class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True)
    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'ciphertext', 'nonce', 'created_at']
