const express = require('express')
const app = express()

const port = process.env.SERVER_PORT

console.log("running NODE_ENV : " + process.env.NODE_ENV)

app.use(express.json())

app.get('/version', (req, res) =>{
    console.log("test version")
    res.status(200).send("0.0.1")
})

console.log("Starting server...")
app.listen(port, () => {
    console.log("Running on port " + port)
})
