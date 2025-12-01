from django.test import TestCase
from django.urls import reverse
from .models import Task, Category


class TaskModelTests(TestCase):
    def test_create_task_defaults(self):
        task = Task.objects.create(title="Comprar pan")

        self.assertEqual(task.title, "Comprar pan")
        self.assertFalse(task.completed)   # default
        self.assertEqual(task.priority, 2) # default "Media"

    def test_task_str_returns_title(self):
        task = Task.objects.create(title="Estudiar Django")
        self.assertEqual(str(task), "Estudiar Django")


class TaskViewsTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Casa")
        self.task = Task.objects.create(
            title="Lavar ropa",
            description="Lavar la ropa blanca",
            category=self.category
        )

    def test_task_list_view_status_and_content(self):
        url = reverse("task_list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Lavar ropa")

    def test_task_create_view_get(self):
        url = reverse("task_create")
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "<form")

    def test_task_create_view_post_creates_task(self):
        url = reverse("task_create")
        data = {
            "title": "Nueva tarea",
            "description": "Algo por hacer",
            "priority": 3,
            "category": self.category.id
        }

        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 302)  # redirect
        self.assertTrue(Task.objects.filter(title="Nueva tarea").exists())

    def test_task_update_view_post_updates_task(self):
        url = reverse("task_update", args=[self.task.id])
        data = {
            "title": "Lavar ropa YA",
            "description": self.task.description,
            "priority": self.task.priority,
            "category": self.category.id
        }

        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 302)

        self.task.refresh_from_db()
        self.assertEqual(self.task.title, "Lavar ropa YA")

    def test_task_delete_view_post_deletes_task(self):
        url = reverse("task_delete", args=[self.task.id])

        response = self.client.post(url)
        self.assertEqual(response.status_code, 302)
        self.assertFalse(Task.objects.filter(id=self.task.id).exists())

    def test_task_toggle_complete(self):
        url = reverse("task_toggle_complete", args=[self.task.id])

        # False -> True
        self.client.get(url)
        self.task.refresh_from_db()
        self.assertTrue(self.task.completed)

        # True -> False
        self.client.get(url)
        self.task.refresh_from_db()
        self.assertFalse(self.task.completed)
