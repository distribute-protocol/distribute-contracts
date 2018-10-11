// weightings should add up to 100
/* there is no check in the contracts, but the assumption is that stakers
will not want to shoot themselves in the foot */

const task1 = {description: 'test description 1', weighting: 5}
const task2 = {description: 'test description 2', weighting: 20}
const task3 = {description: 'test description 3', weighting: 30}
const task4 = {description: 'test description 4', weighting: 40}
const task5 = {description: 'test description 5', weighting: 5}

const task6 = {description: 'test description 6', weighting: 50}
const task7 = {description: 'test description 7', weighting: 50}

const task8 = {description: 'test description 8', weighting: 15}
const task9 = {description: 'test description 9', weighting: 15}
const task10 = {description: 'test description 10', weighting: 15}
const task11 = {description: 'test description 11', weighting: 15}
const task12 = {description: 'test description 12', weighting: 15}
const task13 = {description: 'test description 13', weighting: 15}
const task14 = {description: 'test description 14', weighting: 10}

const task15 = {description: 'test description 15', weighting: 30}
const task16 = {description: 'test description 16', weighting: 30}
const task17 = {description: 'test description 16', weighting: 40}

const task18 = {description: 'test description 15', weighting: 5}
const task19 = {description: 'test description 16', weighting: 5}
const task20 = {description: 'test description 16', weighting: 10}
const task21 = {description: 'test description 15', weighting: 10}
const task22 = {description: 'test description 16', weighting: 10}
const task23 = {description: 'test description 16', weighting: 10}
const task24 = {description: 'test description 15', weighting: 10}
const task25 = {description: 'test description 16', weighting: 10}
const task26 = {description: 'test description 16', weighting: 10}
const task27 = {description: 'test description 15', weighting: 10}
const task28 = {description: 'test description 16', weighting: 10}

const taskSet1 = [task1, task2, task3, task4, task5]
const taskSet2 = [task6, task7]
const taskSet3 = [task8, task9, task10, task11, task12, task13, task14]
const taskSet4 = [task15, task16, task17]
const taskSet5 = [task18, task19, task20, task21, task22, task23, task24, task25, task26, task27, task28]

module.exports = {taskSet1, taskSet2, taskSet3, taskSet4, taskSet5}
