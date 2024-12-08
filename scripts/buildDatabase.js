import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import sharp from 'sharp';
import cv from '@techstark/opencv-js';
import fs from 'fs/promises';

async function fetchCardData(id) {
  try {
    const url = `https://lorcania.com/cards/${id}`;
    const response = await fetch(url, {
      method: 'GET', // Explicitly specify the HTTP method
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        // Add other headers if necessary
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    var cardname = $('.flex.justify-between.text-gray-900.text-xl.font-medium')
      .text()
      .trim();
    var match = cardname.match(/^(.*?)(\(\d+\))/);
    var name = match[1] + $('.text-gray-900.text-lg.font-normal.mb-2');
    var cost = match[2];
    var type = $('div.flex.flex-row.mb-4 span').text().trim();
    var rules = $('.text-gray-700.text-base.mb-4');
    var imgUrl = $(
      '.flex.flex-wrap.flex-row.justify-center.rounded-lg.bg-white.shadow-lg img'
    ).attr('src');

    return {
      id,
      name: cardname,
      type: type,
      rulesText: rules,
      imageUrl: imgUrl,
      prices: {
        market: parseFloat($('.market-price').text().replace('$', '')),
        low: parseFloat($('.low-price').text().replace('$', '')),
        foilMarket: parseFloat($('.foil-market-price').text().replace('$', '')),
        foilLow: parseFloat($('.foil-low-price').text().replace('$', '')),
      },
    };
  } catch (error) {
    console.error('Error fetching the data:', error.message);
  }
}

async function extractImageFeatures(imageUrl) {
  // Wait for OpenCV to be initialized
  await new Promise((resolve) => {
    if (cv.getBuildInformation) {
      resolve();
    } else {
      cv.onRuntimeInitialized = () => resolve();
    }
  });

  // Download and process image
  const response = await fetch(imageUrl);
  const buffer = await response.buffer();

  // Resize and convert to grayscale
  const processed = await sharp(buffer)
    .resize(300, 400)
    .grayscale()
    .raw()
    .toBuffer();

  // Convert to OpenCV matrix
  const mat = cv.matFromImageData({
    data: processed,
    width: 300,
    height: 400,
  });

  // Extract SIFT features
  const sift = new cv.SIFT();
  const keypoints = new cv.KeyPoints();
  const descriptors = new cv.Mat();
  sift.detect(mat, keypoints);
  sift.compute(mat, keypoints, descriptors);

  const features = Array.from(descriptors.data32F);

  // Clean up OpenCV objects
  mat.delete();
  keypoints.delete();
  descriptors.delete();
  sift.delete();

  return features;
}

async function buildDatabase() {
  const cards = [];

  for (let id = 1; id <= 1391; id++) {
    try {
      console.log(`Processing card ${id}/1391...`);

      const cardData = await fetchCardData(id);
      const features = await extractImageFeatures(cardData.imageUrl);

      cards.push({
        ...cardData,
        features,
      });

      // Save periodically
      if (id % 100 === 0) {
        await fs.writeFile(
          'src/data/cards.json',
          JSON.stringify(cards, null, 2)
        );
      }
    } catch (error) {
      console.error(`Error processing card ${id}:`, error);
    }
  }

  // Final save
  await fs.writeFile('src/data/cards.json', JSON.stringify(cards, null, 2));
}

buildDatabase().catch(console.error);
