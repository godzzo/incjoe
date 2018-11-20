
'use strict'

/*
    obj:
        parms - Parsed QueryString
        ctx - request context
        setting - config invoke setting
        config - main config
        results - mysql result array
 */

async function EatLess(obj) {
    return JSON.stringify({msg: 'EatLess', name: 'Joe'});
}

async function ExerciseMore(obj) {
    return JSON.stringify({msg: 'ExerciseMore', name: 'Johanna'});
}

function LearnEveryDay(obj) {
    return JSON.stringify({msg: 'LearnEveryDay', name: 'Eva'});
}

module.exports = {
    EatLess,
    ExerciseMore,
    LearnEveryDay
};