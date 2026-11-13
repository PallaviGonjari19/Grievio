from django.db import models
from django.utils.text import slugify

class Institution(models.Model):
    name = models.CharField(max_length=200, help_text="Official name of the university or college.")
    code = models.CharField(max_length=30, unique=True, help_text="Unique short code used by students/staff (e.g., MIT-ENG).")
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    address = models.TextField(blank=True)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=30, blank=True)
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='institutions/logos/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.name}-{self.code}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.code})"

class CampusLocation(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='locations')
    block_name = models.CharField(max_length=100, help_text="e.g. Science Block, Academic Hall A, Hostel B")
    floor = models.CharField(max_length=50, blank=True, help_text="e.g. Ground Floor, 2nd Floor")
    room_number = models.CharField(max_length=50, blank=True, help_text="e.g. Room 204, Chemistry Lab 2")
    description = models.CharField(max_length=255, blank=True)

    class Meta:
        unique_together = ('institution', 'block_name', 'floor', 'room_number')

    def __str__(self):
        parts = [self.block_name]
        if self.floor:
            parts.append(self.floor)
        if self.room_number:
            parts.append(self.room_number)
        return f"{' - '.join(parts)} ({self.institution.code})"
