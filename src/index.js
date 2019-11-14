const term = require('terminal-kit').terminal
const fs = require('fs')
const {extractKeys} = require('./tags')
const {normalize} = require('./normalize')

const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage'
)
const optionDefinitions = [
    { name: 'verbose', alias: 'v', type: Boolean, description: 'Shows more information during the process'},
    { name: 'file', type: String, alias: 'f', description: 'The file to process', typeLabel: '{underline file}',}
]
const sections = [
    {
        header: 'Tags inferer',
        content: 'Infer tags from text'
    },
    {
        header: 'Options',
        optionList: optionDefinitions
    }
]
const usage = commandLineUsage(sections)
const options = commandLineArgs(optionDefinitions)


const normalized = normalize(["olimpicos", "olimpicas", "alameda", "olmo", "olimpo","hierro"])("olimpico")
console.log(normalized)

const processOptions = ({file, verbose}) => {
    try {
        if (!file) {
            throw new Error('File is required')
        }
    
        if (verbose) {
            term(`Reading ${file}...\n`)
    
            const readStream = fs.createReadStream(file, 'utf8')


            let data = ''
            readStream.on('data', chunk => (data+=chunk))
            readStream.on('end', () => {
                console.log(extractKeys(data))
            })
    
        }
    } catch(err) {
        term.red(err.message+ "\n")
    }

}

Object.keys(options).length === 0 
?  console.log(usage) 
: processOptions(options)