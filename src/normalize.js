const indelpenalty = -1
const misspenalty = -2
const matchreward = 5

const matchingScore = (word1, word2) => {
    let M = Array(word1.length + 1).fill(0).map(e => Array(word2.length + 1).fill(0))
    
    const splitted1 = word1.toLowerCase().split('')
    const splitted2 = word2.toLowerCase().split('')
    Array(splitted1.length + 1).map((val, index) => M[index][0] = index * indelpenalty)
    Array(splitted2.length + 1).map((val, index) => M[0][index] = index * indelpenalty)

    for (let i = 1; i <= splitted1.length; i++) {
        for (let j = 1; j <= splitted2.length; j++) {
            const score = splitted1[i - 1] === splitted2[j -1] ? matchreward : misspenalty
            M[i][j] = Math.max(M[i-1][j-1]+score, M[i][j-1]+indelpenalty, M[i-1][j]+indelpenalty)
        }
    }
    return M[splitted1.length][splitted2.length]
}

const normalize = text => word => {
    const minExpectedVal = (word.length * matchreward) / 2.0
    
    const matches = text.reduce((acc, nextStr) => {
        const val = matchingScore(word, nextStr)
        if (val >= minExpectedVal) {
            if (!acc.hasOwnProperty(val)) {
                acc[val] = [nextStr]
            } else {
                acc = acc[val].concat(nextStr)
            }
            return acc
        }
        return acc
    }, {})
    
    return Object.entries(matches).sort((a, b) => b[0] - a[0]).map(e => ({[e[0]]: e[1]}))
}

module.exports = {
    normalize
}