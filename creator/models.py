import uuid
from django.db import models
# from django.utils.timezone import now

# class User(models.Model):
#   username = models.CharField(max_length=128)
#   password = models.CharField(max_length=128)
#   createdAt = models.DateField(default=now)
  
#   def __str__(self):
#     return self.username

class UserFile(models.Model):
  LANGUAGE_CHOICES = [
    ('html', 'HTML'),
    ('css', 'CSS'),
    ('js', 'JavaScript'),
    ('py', 'Python'),
  ]

  user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
  folder = models.CharField(max_length=255, blank=True, default="")  # Folder name or path
  name = models.CharField(max_length=255)
  language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES)
  content = models.TextField(blank=True)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self):
    return f"{self.folder}/{self.name}.{self.language}" if self.folder else f"{self.name}.{self.language}"