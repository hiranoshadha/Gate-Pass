const csvParser = require('csv-parser');
const { Readable } = require('stream');
const Location  = require('../models/Location');
const Category = require('../models/Category');


const addLocation = async (req, res) => {
  try {
    const { location } = req.body;
    console.log(location);
    if (!location) return res.status(400).json({ error: 'Location is required' });

    const newLocation = await Location.create({ name: location }); // Save to DB
    res.json({ message: 'Location added successfully', location: newLocation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const addCategory = async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) return res.status(400).json({ error: 'Category is required' });

    const newCategory = await Category.create({ name: category }); // Save to DB
    res.json({ message: 'Category added successfully', category: newCategory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const bulkUploadLocations = async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'File is required' });
  
      const fileBuffer = req.file.buffer;
      const locationsArray = [];
  
      Readable.from(fileBuffer.toString())
        .pipe(csvParser())
        .on('data', (row) => {
          if (row.location) locationsArray.push({ name: row.location });
        })
        .on('end', async () => {
          try {
            await Location.insertMany(locationsArray); // Save to DB
            res.json({ message: 'Locations uploaded successfully', locations: locationsArray });
          } catch (dbError) {
            res.status(500).json({ error: dbError.message });
          }
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

  const bulkUploadCategories = async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'File is required' });
  
      const fileBuffer = req.file.buffer;
      const categoriesArray = [];
  
      Readable.from(fileBuffer.toString())
        .pipe(csvParser())
        .on('data', (row) => {
          if (row.category) categoriesArray.push({ name: row.category });
        })
        .on('end', async () => {
          try {
            await Category.insertMany(categoriesArray); // Save to DB
            res.json({ message: 'Categories uploaded successfully', categories: categoriesArray });
          } catch (dbError) {
            res.status(500).json({ error: dbError.message });
          }
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


  const getLocations = async (req, res) => {
    try {
      const locations = await Location.find();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const getCategories = async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

module.exports = { addLocation, addCategory, bulkUploadLocations, bulkUploadCategories, getLocations, getCategories };
