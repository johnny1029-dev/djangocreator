from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
from .models import User
import json


def index(request):
    return render(request, 'dragger.html')

@csrf_exempt
def login(request):
    if request.method == "POST":
        data = json.loads(request.body)
        try:
            user = User.objects.get(username=data.get("username"))
        except User.DoesNotExist:
            return JsonResponse({'message': "User does not exist"}, status=401)
        if check_password(data.get("password"), user.password):
            return JsonResponse({'message': 'Logged in'}, status=200)
        return JsonResponse({'message': 'Bad credentials'}, status=401)
    return render(request, 'login.html')

@csrf_exempt
def signup(request):
    if request.method == "POST":
        data = json.loads(request.body)
        if data.get("username") == "" or data.get("password") == "":
            return JsonResponse({'message': "Provide credentials"}, status=401)
        password = make_password(data.get("password"))
        if User.objects.filter(username=data.get("username")).exists():
            return JsonResponse({'message': 'User already exists'}, status=401)
        User.objects.create(username=data.get("username"), password=password)
        return JsonResponse({'message': 'User created'}, status=200)
    return render(request, 'signup.html')

@csrf_exempt
def logout(request):
    return request