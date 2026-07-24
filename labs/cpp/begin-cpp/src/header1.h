#pragma once

#include <iostream>

namespace header1 {
  inline int foo() {
    std::cout << "header1::foo()" << std::endl;
    return 0;
  }

  void bar();
}
