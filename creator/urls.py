from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login/", views.login, name="login"),
    path("signup/", views.signup, name="signup"),
    path("logout/", views.logout, name="logout"),
    path("test/", views.test, name="test"),
    path("chat/", views.chat, name="chat"),
    path("editor/", views.editor, name="editor"),
    path("editor/<int:file>/", views.editor_file, name="editor_file"),
]