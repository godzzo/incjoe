
'use strict'

async function EatLess(parms, ctx, setting) {
    return JSON.stringify({msg: 'EatLess', name: 'Joe'});
}

async function ExerciseMore(parms, ctx, setting) {
    return JSON.stringify({msg: 'ExerciseMore', name: 'Johanna'});
}

function LearnEveryDay(parms, ctx, setting) {
    return JSON.stringify({msg: 'LearnEveryDay', name: 'Eva'});
}

module.exports = {
    EatLess,
    ExerciseMore,
    LearnEveryDay
};