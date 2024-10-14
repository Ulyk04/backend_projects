const readline = require('readline-sync');

class Game {
    constructor() {
        this.rooms = {
            'Кухня': {
                description: 'Вы находитесь на кухне. Здесь есть стол и стул.',
                actions: {
                    'идти в гостиную': 'Гостиная',
                }
            },
            'Гостиная': {
                description: 'Вы находитесь в гостиной. Здесь есть диван и телевизор.',
                actions: {
                    'идти на кухню': 'Кухня',
                    'включить телевизор': 'Смотреть телевизор'
                }
            },
            'Смотреть телевизор': {
                description: 'Вы смотрите телевизор. Хорошая программа!',
                actions: {
                    'идти в гостиную': 'Гостиная',
                }
            }
        };

        this.currentRoom = 'Кухня'; // Начальная комната
        this.play();
    }

    play() {
        while (true) {
            console.log(this.rooms[this.currentRoom].description);
            const actions = this.rooms[this.currentRoom].actions;
            console.log('Вы можете:');
            Object.keys(actions).forEach(action => {
                console.log(`- ${action}`);
            });

            const input = readline.question('Введите команду: ');

            if (actions[input]) {
                this.currentRoom = actions[input];
            } else {
                console.log('Неверная команда. Попробуйте снова.');
            }
        }
    }
}

new Game();
