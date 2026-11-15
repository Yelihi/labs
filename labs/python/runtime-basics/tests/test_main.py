import unittest
from src.main import add


class AddTest(unittest.TestCase):
    def test_add(self):
        self.assertEqual(add(2, 3), 5)
        self.assertEqual(add(-2, 2), 0)
