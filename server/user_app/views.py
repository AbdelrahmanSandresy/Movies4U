from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError

from .models import AppUser
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status as s

# Create your views here.
class Register(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = str(request.data.get("email", "")).strip()
        password = request.data.get("password")

        if not email:
            return Response(
                {"detail": "Email is required."},
                status=s.HTTP_400_BAD_REQUEST,
            )

        if not password:
            return Response(
                {"detail": "Password is required."},
                status=s.HTTP_400_BAD_REQUEST,
            )

        if AppUser.objects.filter(email__iexact=email).exists():
            return Response(
                {
                    "detail": (
                        "An account with this email already exists. "
                        "Please log in instead."
                    )
                },
                status=s.HTTP_409_CONFLICT,
            )

        try:
            new_user = AppUser.objects.create_user(
                email=email,
                password=password,
            )
            token = Token.objects.create(user=new_user)
            return Response(
                {
                    "token":token.key,
                    "email":new_user.email
                },
                status=s.HTTP_201_CREATED
            )
        except ValidationError as error:
            first_error = next(iter(error.message_dict.values()))[0]
            return Response(
                {"detail": first_error},
                status=s.HTTP_400_BAD_REQUEST,
            )

class LogIn(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        data = request.data
    
        user = authenticate(
            email=data.get('email'),
            password=data.get("password")
        )
        
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "token":user.auth_token.key,
                    "email":user.email
                },
                status=s.HTTP_200_OK
            )
        else:
            return Response(
                "No user matching credentials",
                status=s.HTTP_404_NOT_FOUND
            )

class UserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]


class Info(UserView):
    def get(self, request):
        user = request.user
        return Response({"token":user.auth_token.key, "email":user.email})

class LogOut(UserView):
    def post(self, request):
        user = request.user
        user.auth_token.delete()
        return Response(f"{user.email} has been logged out")
