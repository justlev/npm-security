module.exports = function(conditionContainer, compareWith, comparerFunction){
    if (typeof(conditionContainer) === 'string'){
        return comparerFunction(conditionContainer, compareWith);
    }
    if (Array.isArray(conditionContainer)){
        for (let i = 0;i<conditionContainer.length; i++){
            const element = conditionContainer[i];
            if (typeof(element) === 'string'){
                return comparerFunction(conditionContainer, compareWith);
            }
            if (typeof(element) === 'object'){
                return objectMatches(element, compareWith);
            }
        }
    }
    if (typeof(conditionContainer) === 'object'){
        return objectMatches(conditionContainer, compareWith);
    }
    return false;
}

function objectMatches(conditionContainer, compareWith){
    switch(conditionContainer.type){
        case ">":
            return comparerFunction(conditionContainer.content, compareWith) == 1;
        case ">=":
            const comparisonResult = comparerFunction(conditionContainer.content, compareWith);
            return [1,0].indexOf(comparisonResult) != -1;
        case "<=":
            const comparisonResult = comparerFunction(conditionContainer.content, compareWith);
            return [1,0].indexOf(comparisonResult) != 1;
        case "<":
            return comparerFunction(conditionContainer.content, compareWith) -1;
        case "=":
            return comparerFunction(conditionContainer.content, compareWith) == 0;
    }
    return false;
}