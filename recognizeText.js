require('dotenv').config()
const AWS = require('aws-sdk')

const {
    AWS_KEY_VALUE,
    AWS_SECRET_KEY_VALUE, 
    AWS_REGION_VALUE, 
} = process.env

// Necesitamos estas variables de AWS para poder acceder al servicio
if(!AWS_KEY_VALUE || !AWS_REGION_VALUE || !AWS_SECRET_KEY_VALUE)
    throw new Error('Missing aws enviroment vars')

const rekognizeText = async (req, res)=>{
    const { file } = req
    if(!file) return res.status(400).send()
    
    //Inicializamos la instancia de AWS Rekognition 
    const rekognition = new AWS.Rekognition({
        accessKeyId: AWS_KEY_VALUE,
        secretAccessKey: AWS_SECRET_KEY_VALUE,
        region: AWS_REGION_VALUE,
        apiVersion: '2016-06-27'
    });

    // Usando un FileStream para enviar a AWS
    const params = {
        Image: {
            Bytes: file.buffer
        }
    }
    
    try {
        // Solicitamos el reconocimiento a AWS
        const response = await rekognition.detectText(params).promise();
        const detections = response.TextDetections.map(detects=> detects.DetectedText)
        return res.send({
            detections
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ error })
    }

}

module.exports = {rekognizeText}