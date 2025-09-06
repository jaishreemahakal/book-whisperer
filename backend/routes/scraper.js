const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const router = express.Router();

router.post('/refresh', async (req, res) => {
  try {
    console.log('Refresh scraping requested');
    
    const scraperPath = path.join(__dirname, '../../scraper/scraper.js');
    
    const scraperProcess = spawn('node', [scraperPath], {
      stdio: 'pipe',
      cwd: path.join(__dirname, '../../scraper')
    });

    let output = '';
    let errorOutput = '';
    let hasResponded = false;

    const sendResponse = (statusCode, responseData) => {
      if (!hasResponded) {
        hasResponded = true;
        res.status(statusCode).json(responseData);
      }
    };

    scraperProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log('Scraper output:', data.toString());
    });

    scraperProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('Scraper error:', data.toString());
    });

    scraperProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Scraper completed successfully');
        sendResponse(200, {
          success: true,
          message: 'Scraping completed successfully',
          output: output.trim(),
          timestamp: new Date().toISOString()
        });
      } else {
        console.error('Scraper failed with code:', code);
        sendResponse(500, {
          success: false,
          error: 'Scraping failed',
          message: `Scraper process exited with code ${code}`,
          output: output.trim(),
          errorOutput: errorOutput.trim()
        });
      }
    });

    scraperProcess.on('error', (error) => {
      console.error('Failed to start scraper:', error);
      sendResponse(500, {
        success: false,
        error: 'Failed to start scraper',
        message: error.message
      });
    });

    setTimeout(() => {
      if (!scraperProcess.killed) {
        scraperProcess.kill();
        sendResponse(408, {
          success: false,
          error: 'Scraping timeout',
          message: 'Scraper process took too long and was terminated'
        });
      }
    }, 600000);

  } catch (error) {
    console.error('Error triggering scraper:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger scraper',
      message: error.message
    });
  }
});

router.get('/scraper/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'idle',
      lastRun: null,
      message: 'Scraper status endpoint - implement based on your needs'
    }
  });
});

module.exports = router;