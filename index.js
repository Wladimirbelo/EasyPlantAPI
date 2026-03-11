require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

app.use(cors());
app.use(bodyParser.json());

// Swagger specification
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Simple Device API',
    version: '1.0.0',
    description: 'API with GET and POST endpoints for device data'
  },
  paths: {
    '/': {
      get: {
        summary: 'Health check',
        responses: {
          '200': {
            description: 'API is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/data': {
      post: {
        summary: 'Receive and save device data',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  device_id:  { type: 'string' },
                  timestamp:  { type: 'number' },
                  Temperatura: { type: 'number' },
                  Umidade:    { type: 'number' }
                },
                required: ['device_id', 'timestamp', 'Temperatura', 'Umidade']
              },
              example: {
                device_id: 'esp32-01',
                timestamp: 1625151600,
                Temperatura: 24.5,
                Umidade: 60.2
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Data saved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status:  { type: 'string' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Missing required fields'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// GET / - Health check
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// POST /data - Recebe e salva dados do dispositivo
app.post('/data', async (req, res) => {
  const { device_id, timestamp, Temperatura, Umidade } = req.body;

  // Validação básica
  if (!device_id || !timestamp || Temperatura == null || Umidade == null) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields: device_id, timestamp, Temperatura, Umidade'
    });
  }

  console.log('Received payload:', req.body);

  // Salvar no Supabase
  const { data, error } = await supabase
    .from('sensor_readings')
    .insert([{
      device_id,
      timestamp,
      temperatura: Temperatura,
      umidade: Umidade
    }]);

  if (error) {
    console.error('Supabase error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }

  res.json({
    status: 'ok',
    message: 'Data saved successfully'
  });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});