from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import UserFile
import json


def index(request):
    return render(request, 'dragger.html')

def login(request):
    if request.method == "POST":
        data = json.loads(request.body)
        if data.get("username") == "" or data.get("password") == "":
            return JsonResponse({'message': "Provide credentials"}, status=401)
        user = authenticate(request, username=data.get("username"), password=data.get("password"))
        if user is not None:
            auth_login(request, user)
            return JsonResponse({'message': 'User authenticated'}, status=200)
        return JsonResponse({'message': 'User does not exist'}, status=404)
    return render(request, 'login.html')

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

@login_required
def editor(request):
    if request.method == "POST":
        files = UserFile.objects.filter(user=request.user).values('id', 'folder', 'name', 'language', 'created_at', 'updated_at')
        files_list = list(files)
        return JsonResponse({'files': files_list}, status=200)
    return render(request, 'editor.html')

@login_required
def editor_file(request, file):
    if request.method == "POST":
        if not UserFile.objects.filter(id=file).exists():
            return JsonResponse({'message': 'File does not exist'}, status=404)
        user_file = UserFile.objects.get(id=file)
        if user_file.user != request.user:
            return JsonResponse({'message': 'File does not belong to user'}, status=401)
        return JsonResponse({"name": user_file.name, "content": user_file.content, "language": user_file.language}, status=200)
    return render(request, 'editor.html', {'file': file})

@login_required
def save_file(request, file):
    if request.method == "POST":
        data = json.loads(request.body)
        if not UserFile.objects.filter(id=file).exists():
            return JsonResponse({'message': 'File does not exist'}, status=404)
        user_file = UserFile.objects.get(id=file)
        if user_file.user != request.user:
            return JsonResponse({'message': 'File does not belong to user'}, status=401)
        user_file.content = data.get("content")
        user_file.save()
        return JsonResponse({'message': 'File saved'}, status=200)
    return JsonResponse({'message': 'Wrong method'}, status=401)

@login_required
def delete_file(request, file):
    if request.method == "POST":
        if not UserFile.objects.filter(id=file).exists():
            return JsonResponse({'message': 'File does not exist'}, status=404)
        user_file = UserFile.objects.get(id=file)
        if user_file.user != request.user:
            return JsonResponse({'message': 'File does not belong to user'}, status=401)
        user_file.delete()
        return JsonResponse({'message': 'File deleted'}, status=200)
    return JsonResponse({'message': 'Wrong method'}, status=401)

@login_required
def new_file(request):
    if request.method == "POST":
        data = json.loads(request.body)
        if data.get("name") == "" or data.get("language") == "":
            return JsonResponse({'message': 'Provide file name and language'}, status=400)
        if UserFile.objects.filter(user=request.user, name=data.get("name"), language=data.get("language")).exists():
            return JsonResponse({'message': 'File already exists'}, status=400)
        user_file = UserFile(user=request.user, name=data.get("name"), language=data.get("language"))
        user_file.save()
        return JsonResponse({'message': 'File created', 'id': user_file.pk}, status=200)
    return JsonResponse({'message': 'Wrong method'}, status=401)

