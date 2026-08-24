#include <iostream>
#include <cstring>

class MyString {
  char* string_content;
  int string_length;
  int memory_capacity;

 public:
  MyString(char c);
  MyString(const char* c);
  MyString(const MyString& str);

  ~MyString();

  int length() const;
  void print() const;
  int capacity() const;
  void reserve(int size);
  MyString& assign(const char* c);
  MyString& assign(const MyString& str);
};

MyString::MyString(char c) {
  string_content = new char[1];
  string_content[0] = c;
  string_length = 1;
}

MyString::MyString(const char* c) {
  string_length = strlen(c);
  string_content = new char[string_length];

  for (int i = 0; i != string_length; i++) string_content[i] = c[i];
}

MyString::MyString(const MyString& str) {
  string_length = str.string_length;
  string_content = new char[string_length];
  for (int i = 0; i != string_length; i++) string_content[i] = str.string_content[i];
}

MyString::~MyString() { delete[] string_content; }

int MyString::length() const { return string_length; }
int MyString::capacity() const { return memory_capacity; }

void MyString::print() const {
  for (int i = 0; i != string_length; i++) {
    std::cout << string_content[i];
  }
  std::cout << std::endl;
}

MyString& MyString::assign(const char* c) {
  int len = strlen(c);
  if (len > memory_capacity) {
    delete[] string_content;
    string_content = new char[len];
    memory_capacity = len;
  }

  for (int i = 0; i != len; i++) string_content[i] = c[i];

  string_length = len;

  return *this;
}

Mystring& MyString::assign(const MyString& str) {
  if(str.string_length > memory_capacity) {
    delete[] string_content;
    string_content = new char[str.string_length];
    memory_capacity = str.string_length;
  }

  for (int i = 0; i != str.string_length; i++) string_content[i] = str.string_content[i];

  string_length = str.string_length;

  return *this;
}

void MyString::reserve(int size) {
  if (size > memory_capacity) {
    char* prev_string_content = string_content;

    string_content = new char[size];
    memory_capacity = size;

    for (int i = 0; i != string_length; i++) string_content[i] = prev_string_content[i];

    delete[] prev_string_content;
  }

}

int main() {
  MyString str1("hello world!");
  MyString str2(str1);

  str1.print();
  str2.print();

  str2.assign("abcdefg").assign("ssd").print();
}
