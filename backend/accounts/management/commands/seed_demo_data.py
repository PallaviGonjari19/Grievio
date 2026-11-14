import os
from django.core.management.base import BaseCommand
from institutions.models import Institution, InstitutionStatus, CampusLocation
from departments.models import Department, ComplaintCategory, ComplaintPriority
from accounts.models import User, UserRole, ApprovalStatus, StudentProfile, StaffProfile

class Command(BaseCommand):
    help = "Seeds initial demo institutions, departments, categories, and test accounts for Phase 2."

    def handle(self, *args, **options):
        self.stdout.write("Seeding Grievio multi-institution demo data...")

        # 1. Seed Institution: Apex Institute of Technology
        apex, _ = Institution.objects.get_or_create(
            code="APEX-TECH",
            defaults={
                "name": "Apex Institute of Technology",
                "slug": "apex-institute-of-technology",
                "status": InstitutionStatus.ACTIVE,
                "is_active": True,
                "contact_email": "admin@apex.edu",
                "contact_phone": "+1 (555) 234-5678",
                "website": "https://apex.edu",
                "address": "100 Innovation Blvd, Silicon Valley, CA"
            }
        )

        # 2. Seed Institution: Beacon University
        beacon, _ = Institution.objects.get_or_create(
            code="BEACON-ENG",
            defaults={
                "name": "Beacon Engineering University",
                "slug": "beacon-engineering-university",
                "status": InstitutionStatus.ACTIVE,
                "is_active": True,
                "contact_email": "contact@beacon.edu",
                "contact_phone": "+1 (555) 987-6543",
                "website": "https://beacon.edu",
                "address": "450 University Way, Boston, MA"
            }
        )

        # 3. Seed Campus Locations for Apex
        loc_sci, _ = CampusLocation.objects.get_or_create(
            institution=apex, block_name="Science Block", floor="2nd Floor", room_number="Lab 204",
            defaults={"description": "Physics and Robotics research lab"}
        )
        loc_hostel, _ = CampusLocation.objects.get_or_create(
            institution=apex, block_name="Hostel Block A", floor="Ground Floor", room_number="Room 102",
            defaults={"description": "First-year undergraduate dorms"}
        )

        # 4. Seed Departments & Categories for Apex
        elec_dept, _ = Department.objects.get_or_create(
            institution=apex, name="Electrical & Maintenance",
            defaults={"description": "Wiring, lighting, transformers, and power backup", "sla_hours": 24}
        )
        ComplaintCategory.objects.get_or_create(
            department=elec_dept, name="Power Outage",
            defaults={"default_priority": ComplaintPriority.HIGH}
        )
        ComplaintCategory.objects.get_or_create(
            department=elec_dept, name="Faulty Switchboard",
            defaults={"default_priority": ComplaintPriority.MEDIUM}
        )

        plumb_dept, _ = Department.objects.get_or_create(
            institution=apex, name="Plumbing & Sanitation",
            defaults={"description": "Water filtration, restroom fixtures, and pipeline maintenance", "sla_hours": 12}
        )
        ComplaintCategory.objects.get_or_create(
            department=plumb_dept, name="Water Pipe Leakage",
            defaults={"default_priority": ComplaintPriority.HIGH}
        )
        ComplaintCategory.objects.get_or_create(
            department=plumb_dept, name="Washroom Cleaning",
            defaults={"default_priority": ComplaintPriority.MEDIUM}
        )

        it_dept, _ = Department.objects.get_or_create(
            institution=apex, name="Campus IT & Network",
            defaults={"description": "Wi-Fi access points, computer labs, and smart board maintenance", "sla_hours": 8}
        )
        ComplaintCategory.objects.get_or_create(
            department=it_dept, name="Wi-Fi Signal Loss",
            defaults={"default_priority": ComplaintPriority.MEDIUM}
        )
        ComplaintCategory.objects.get_or_create(
            department=it_dept, name="Projector Malfunction",
            defaults={"default_priority": ComplaintPriority.HIGH}
        )

        # 5. Seed Users with Standard Password: "Password123!"
        STANDARD_PASS = "Password123!"

        # 5.1 Platform Super Admin
        superadmin, created = User.objects.get_or_create(
            username="superadmin",
            defaults={
                "email": "superadmin@grievio.com",
                "first_name": "Platform",
                "last_name": "SuperAdmin",
                "role": UserRole.SUPERADMIN,
                "approval_status": ApprovalStatus.APPROVED,
                "is_staff": True,
                "is_superuser": True
            }
        )
        if created:
            superadmin.set_password(STANDARD_PASS)
            superadmin.save()

        # 5.2 College Administrator for Apex
        admin_apex, created = User.objects.get_or_create(
            username="apex_admin",
            defaults={
                "email": "admin@apex.edu",
                "first_name": "Marcus",
                "last_name": "Vance",
                "role": UserRole.ADMIN,
                "institution": apex,
                "approval_status": ApprovalStatus.APPROVED,
                "is_staff": True
            }
        )
        if created:
            admin_apex.set_password(STANDARD_PASS)
            admin_apex.save()

        # 5.3 Department Staff for Apex (Electrical)
        staff_elec, created = User.objects.get_or_create(
            username="staff_apex",
            defaults={
                "email": "electrician@apex.edu",
                "first_name": "Elena",
                "last_name": "Reyes",
                "role": UserRole.STAFF,
                "institution": apex,
                "approval_status": ApprovalStatus.APPROVED
            }
        )
        if created:
            staff_elec.set_password(STANDARD_PASS)
            staff_elec.save()
            StaffProfile.objects.create(
                user=staff_elec, staff_id="APX-STAFF-01", department=elec_dept, designation="Senior Electrician"
            )

        # 5.4 Approved Student for Apex
        student_apex, created = User.objects.get_or_create(
            username="student_apex",
            defaults={
                "email": "alex.student@apex.edu",
                "first_name": "Alex",
                "last_name": "Johnson",
                "role": UserRole.STUDENT,
                "institution": apex,
                "approval_status": ApprovalStatus.APPROVED
            }
        )
        if created:
            student_apex.set_password(STANDARD_PASS)
            student_apex.save()
            StudentProfile.objects.create(
                user=student_apex, roll_number="2024CS101", batch_year=2024, room_or_hostel="Hostel A - 102"
            )

        # 5.5 Pending Student for Apex (To test approval queue!)
        student_pending, created = User.objects.get_or_create(
            username="student_pending",
            defaults={
                "email": "pending.applicant@apex.edu",
                "first_name": "Samantha",
                "last_name": "Wright",
                "role": UserRole.STUDENT,
                "institution": apex,
                "approval_status": ApprovalStatus.PENDING
            }
        )
        if created:
            student_pending.set_password(STANDARD_PASS)
            student_pending.save()
            StudentProfile.objects.create(
                user=student_pending, roll_number="2025MECH204", batch_year=2025, room_or_hostel="Day Scholar"
            )

        self.stdout.write(self.style.SUCCESS("Grievio Phase 2 Demo Data successfully seeded!"))
        self.stdout.write(self.style.SUCCESS("""
Test Credentials (Password: Password123!):
- Platform Super Admin: superadmin / Password123!
- College Admin:        apex_admin / Password123! (Code: APEX-TECH)
- Department Staff:     staff_apex / Password123! (Code: APEX-TECH)
- Approved Student:     student_apex / Password123! (Code: APEX-TECH)
- Pending Student:      student_pending / Password123! (Code: APEX-TECH)
        """))
