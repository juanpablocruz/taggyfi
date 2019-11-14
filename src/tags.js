const { filter, curry, map, sort, pipe } = require('ramda')
const {conjunctions, prepositions} = require('./language')

const replaceAll = (target, search, replacement) =>
    target.split(search).join(replacement)

const removeChars = [',', '.', '¿', '?', '(', ')', ';', ':', /<[^>]*>?/gm, /(\r\n|\n|\r)/gm]

const remove = text => removeChars.reduce((t, c) => replaceAll(t, c, ' '), text)
const removePrepositions = text => replaceAll(text, new RegExp(' (' + [...prepositions, ...conjunctions].join('|') + ') ', 'g'), ' ')
const splitAndClean = text => text.split(' ').map(w => w.trim()).filter(w => w.length > 0)

const weighted = curry((total, text) => map(w => ({...w, weight: w.count / total }), text))
const sortedByOcurrences = text => sort((a, b) => b.count - a.count, text)
const addOcurrences = curry((words, text) => map(u => ({ word: u, count: words.reduce((c, w) => w === u ? c + 1 : c, 0) }), text))
const filterNaN = text => filter(isNaN, text)
const longerThan3 = text => filter(w => w.length > 3, text)
const notExclude = text => filter(w => ![...prepositions, ...conjunctions].includes(w), text)
const unique = text => [...new Set(text)]
const bias = 1
const calcMean = arr => arr.reduce((acc, w) => acc + w.weight, 0) / arr.length
const highest = arr => arr.reduce((acc, w) => w.weight > acc ? w.weight : acc, 0)
const calcBoundary = text => ({ text, boundary: ((0.75 * highest(text) + 0.75 * calcMean(text)) / 2) })

const compare = new Intl.Collator('es-ES').compare
const includesIntl = (arr, word) => arr.filter(w => compare(w, word)).length > 0

const filterBiased = curry((bias, { text, boundary }) => filter(w => w.weight < bias && w.weight > boundary, text))

const normalize = text => text.reduce((acc, word) => {
    if (acc.includes(word)) return acc
    const lastChar = word.charAt(word.length - 1)
    if (lastChar === 's') {
        if (word.charAt(word.length - 2) === 'e') {
            const singular = word.slice(0, -2)
            if (includesIntl(text, singular)) return [...acc, singular]
        } else {
            const singular = word.slice(0, -1)
            if (includesIntl(text, singular)) return [...acc, singular]
        }
    } else if (lastChar === 'a') {
        const withO = word.slice(0, -1) + 'o'
        const neutral = word.slice(0, -1)
        if (includesIntl(text, neutral)) return [...acc, neutral]
        if (includesIntl(text, withO)) return [...acc, withO]
    }
    return [...acc, word]
}, [])

const extractKeys = text => {
    const preprocesed = remove(text.toLowerCase())
    const words = pipe(removePrepositions, splitAndClean, notExclude)(preprocesed)
    const total = splitAndClean(preprocesed).length

    const transforms = pipe(
        longerThan3,
        filterNaN,
        normalize,
        normalize,
        unique,
        addOcurrences(words),
        weighted(total),
        calcBoundary,
        filterBiased(bias),
        sortedByOcurrences,
    )

    return transforms(words)
}

module.exports = {
    extractKeys
}