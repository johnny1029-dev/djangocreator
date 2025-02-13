from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
import json
import requests


def index(request):
    return render(request, 'dragger.html')

@csrf_exempt
def login(request):
    if request.method == "POST":
        data = json.loads(request.body)
        if data.get("username") == "" or data.get("password") == "":
            return JsonResponse({'message': "Provide credentials"}, status=401)
        user = authenticate(request, username=data.get("username"), password=data.get("password"))
        if user is not None:
            auth_login(request, user)
            return JsonResponse({'message': 'User authenticated'}, status=200)
        return JsonResponse({'message': 'User is not :('}, status=401)
    return render(request, 'login.html')

@csrf_exempt
def signup(request):
    if request.method == "POST":
        data = json.loads(request.body)
        if data.get("username") == "" or data.get("password") == "":
            return JsonResponse({'message': "Provide credentials"}, status=401)
        if(User.objects.filter(username=data.get("username")).exists()):
            return JsonResponse({'message': 'User already exists'}, status=401)
        user = User.objects.create_user(data.get("username"), password=data.get("password"))
        if User is not None:
            auth_login(request, user)
            return JsonResponse({'message': 'User created'}, status=200)
        return JsonResponse({'message': 'User is not :('}, status=401)
    return render(request, 'signup.html')

@csrf_exempt
def logout(request):
    if request.method == "POST":
        auth_logout(request)
        return JsonResponse({'message': 'User logged out'}, status=200)
    return JsonResponse({'message': 'Wrong method'}, status=401)

@login_required
def test(request):
    return render(request, 'test.html')

@login_required
def chat(request):
    return render(request, 'chat.html')

