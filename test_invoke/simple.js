
'use strict'

function EatLess(parms, ctx) {
    return JSON.stringify({msg: 'EatLess', name: 'Joe'});
}

function ExerciseMore(parms, ctx) {
    return JSON.stringify({msg: 'ExerciseMore', name: 'Johanna'});
}

function LearnEveryDay(parms, ctx) {
    return JSON.stringify({msg: 'LearnEveryDay', name: 'Eva'});
}

module.exports = {
    EatLess,
    ExerciseMore,
    LearnEveryDay
};