#include <iostream>

typedef struct Animal {
    char name[30]; // 이름

    int age;
    int health;
    int food;
    int clean;    
} Animal;

void createAnimal(Animal *animal) {
    std::cout << "동물의 이름을 입력하세요: ";
    std::cin >> animal -> name;

    std::cout << "동물의 나이를 입력하세요: ";
    std::cin >> animal -> age;

    animal -> health = 100;
    animal -> food = 100;
    animal -> clean = 100;
}

void play(Animal *animal) {
    animal -> health += 10;
    animal -> food -= 20;
    animal -> clean -= 30;
}

void oneDayPass(Animal *animal) {
    animal -> health -= 10;
    animal -> food -= 30;
    animal -> clean -= 20;
}

void showStat(Animal *animal) {
    std::cout << "이름: " << animal -> name << std::endl;
    std::cout << "나이: " << animal -> age << std::endl;
    std::cout << "건강: " << animal -> health << std::endl;
    std::cout << "밥: " << animal -> food << std::endl;
    std::cout << "청결: " << animal -> clean << std::endl;
}

int main() {
    Animal *list[10];
    int animal_num = 0;

    for (;;) {
        std::cout << "1. 동물 추가" << std::endl;
        std::cout << "2. 동물 놀기" << std::endl;
        std::cout << "3. 상태 보기" << std::endl;

        int input;
        std::cin >> input;

        switch (input) {
            int play_with;
            case 1:
                list[animal_num] = new Animal;
                createAnimal(list[animal_num]);
                animal_num++;
                break;
            case 2:
                std::cout << "누구랑 놀게? : " << std::endl;
                std::cin >> play_with;

                if(play_with < animal_num) play(list[play_with]);

                break;
            case 3:
                std::cout << "누구의 상태를 보게? : " << std::endl;
                std::cin >> play_with;

                if(play_with < animal_num) showStat(list[play_with]);

                break;
        }

        for(int i = 0; i < animal_num; i++) {
            oneDayPass(list[i]);
        }
    }

    for(int i = 0; i < animal_num; i++) {
        delete list[i];
    }


    return 0;
}
